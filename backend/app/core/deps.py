from typing import Generator, Optional
from fastapi import Depends, HTTPException, status, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.core.security import decode_token
from app.crud.user import get_user_by_id
from app.models import User


# HTTPBearer スキーム
security = HTTPBearer(auto_error=False)


def get_db() -> Generator[Session, None, None]:
    """データベースセッションを取得"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    db: Session = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    access_token: Optional[str] = Cookie(None)
) -> User:
    """
    現在のユーザーを取得

    AuthorizationヘッダーまたはCookieからJWTトークンを取得し、
    データベースからユーザー情報を取得します。

    優先順位:
    1. Authorizationヘッダー (Bearer トークン)
    2. Cookie (access_token)
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # トークンの取得（Authorizationヘッダー優先、次にCookie）
    token = None
    if credentials:
        token = credentials.credentials
    elif access_token:
        token = access_token

    if not token:
        raise credentials_exception

    payload = decode_token(token)

    if payload is None:
        raise credentials_exception

    user_id: Optional[int] = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    try:
        user_id = int(user_id)
    except ValueError:
        raise credentials_exception

    user = get_user_by_id(db, user_id=user_id)
    if user is None:
        raise credentials_exception

    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    現在のアクティブユーザーを取得

    ユーザーがアクティブであることを確認します。
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user


def get_current_superuser(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    現在のスーパーユーザーを取得

    ユーザーがスーパーユーザーであることを確認します。
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user
