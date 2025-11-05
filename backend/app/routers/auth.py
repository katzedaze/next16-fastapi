from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_active_user
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
    response: Response,
    db: Session = Depends(get_db)
):
    """
    ユーザー登録エンドポイント

    新しいユーザーを作成し、アクセストークンとリフレッシュトークンをHttpOnly Cookieにセットします。

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

    注: トークンはHttpOnly Cookieにもセットされます（SSR対応）
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

    # HttpOnly Cookieにトークンをセット（SSR対応）
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,  # JavaScriptからアクセス不可（XSS対策）
        secure=settings.environment == "production",  # 本番環境ではHTTPSのみ
        samesite="lax",  # CSRF対策
        max_age=settings.access_token_expire_minutes * 60,  # 秒単位
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.environment == "production",
        samesite="lax",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
    )

    return UserWithTokenResponse(
        user=UserResponse.model_validate(user),
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.post("/login", response_model=UserWithTokenResponse)
def login(
    request: UserLoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    ログインエンドポイント

    メールアドレスとパスワードで認証し、トークンをHttpOnly Cookieにセットします。

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

    注: トークンはHttpOnly Cookieにもセットされます（SSR対応）
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

    # HttpOnly Cookieにトークンをセット（SSR対応）
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.environment == "production",
        samesite="lax",
        max_age=settings.access_token_expire_minutes * 60,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.environment == "production",
        samesite="lax",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
    )

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
def logout(response: Response):
    """
    ログアウトエンドポイント

    HttpOnly Cookieからトークンを削除します。

    レスポンス (camelCase):
    ```json
    {
        "message": "Successfully logged out"
    }
    ```
    """
    # Cookieを削除
    response.delete_cookie(key="access_token", samesite="lax")
    response.delete_cookie(key="refresh_token", samesite="lax")

    return MessageResponse(message="Successfully logged out")
