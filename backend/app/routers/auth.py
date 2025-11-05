from datetime import timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user, get_current_active_user
from app.core.security import create_access_token, create_refresh_token
from app.core.config import settings
from app.crud.user import (
    get_user_by_email,
    get_user_by_username,
    create_user,
    authenticate_user
)
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    UserWithTokenResponse,
    TokenResponse,
    UserResponse,
    RefreshTokenRequest,
    MessageResponse
)
from app.models import User

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/register", response_model=UserWithTokenResponse, status_code=status.HTTP_201_CREATED)
def register(
    request: UserRegisterRequest,
    db: Session = Depends(get_db)
):
    """
    ユーザー登録エンドポイント

    新しいユーザーを作成し、アクセストークンとリフレッシュトークンを返します。

    フロントエンド送信データ (camelCase):
    ```json
    {
        "email": "user@example.com",
        "username": "johndoe",
        "password": "SecurePass123"
    }
    ```

    レスポンス (camelCase):
    ```json
    {
        "user": {
            "id": 1,
            "email": "user@example.com",
            "username": "johndoe",
            "isActive": true,
            "createdAt": "2025-11-06T00:00:00Z"
        },
        "accessToken": "eyJ...",
        "refreshToken": "eyJ...",
        "tokenType": "bearer"
    }
    ```
    """
    # メールアドレスの重複チェック
    existing_user = get_user_by_email(db, email=request.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # ユーザー名の重複チェック
    existing_username = get_user_by_username(db, username=request.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    # ユーザー作成
    user = create_user(
        db=db,
        email=request.email,
        username=request.username,
        password=request.password
    )

    # トークン生成
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return UserWithTokenResponse(
        user=UserResponse.model_validate(user),
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.post("/login", response_model=UserWithTokenResponse)
def login(
    request: UserLoginRequest,
    db: Session = Depends(get_db)
):
    """
    ログインエンドポイント

    メールアドレスとパスワードで認証し、トークンを返します。

    フロントエンド送信データ (camelCase):
    ```json
    {
        "email": "user@example.com",
        "password": "SecurePass123"
    }
    ```

    レスポンス (camelCase):
    ```json
    {
        "user": {
            "id": 1,
            "email": "user@example.com",
            "username": "johndoe",
            "isActive": true
        },
        "accessToken": "eyJ...",
        "refreshToken": "eyJ...",
        "tokenType": "bearer"
    }
    ```
    """
    # ユーザー認証
    user = authenticate_user(db, email=request.email, password=request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # アクティブユーザーチェック
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )

    # トークン生成
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return UserWithTokenResponse(
        user=UserResponse.model_validate(user),
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    トークンリフレッシュエンドポイント

    リフレッシュトークンから新しいアクセストークンを発行します。

    フロントエンド送信データ (camelCase):
    ```json
    {
        "refreshToken": "eyJ..."
    }
    ```

    レスポンス (camelCase):
    ```json
    {
        "accessToken": "eyJ...",
        "tokenType": "bearer"
    }
    ```
    """
    from app.core.security import decode_token

    # リフレッシュトークンの検証
    payload = decode_token(request.refresh_token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: Optional[int] = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = int(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # ユーザー存在確認
    from app.crud.user import get_user_by_id
    user = get_user_by_id(db, user_id=user_id)
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )

    # 新しいアクセストークンを生成
    access_token = create_access_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        token_type="bearer"
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_active_user)):
    """
    現在のユーザー情報を取得

    認証が必要なエンドポイント（Bearerトークン必須）

    リクエストヘッダー:
    ```
    Authorization: Bearer eyJ...
    ```

    レスポンス (camelCase):
    ```json
    {
        "id": 1,
        "email": "user@example.com",
        "username": "johndoe",
        "isActive": true,
        "createdAt": "2025-11-06T00:00:00Z",
        "updatedAt": "2025-11-06T00:00:00Z"
    }
    ```
    """
    return UserResponse.model_validate(current_user)


@router.post("/logout", response_model=MessageResponse)
def logout():
    """
    ログアウトエンドポイント

    実際のトークン無効化はフロントエンド側で行います。
    （JWTトークンはステートレスなため、サーバー側では無効化できません）

    フロントエンド側で行うべき処理:
    1. ローカルストレージからトークンを削除
    2. アプリケーションの認証状態をクリア

    レスポンス (camelCase):
    ```json
    {
        "message": "Successfully logged out"
    }
    ```
    """
    return MessageResponse(message="Successfully logged out")
