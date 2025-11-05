from typing import Optional
from sqlalchemy.orm import Session
from app.models import User
from app.core.security import get_password_hash, verify_password


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """メールアドレスでユーザーを取得"""
    return db.query(User).filter(User.email == email).first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """ユーザー名でユーザーを取得"""
    return db.query(User).filter(User.username == username).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """IDでユーザーを取得"""
    return db.query(User).filter(User.id == user_id).first()


def create_user(
    db: Session,
    email: str,
    username: str,
    password: str
) -> User:
    """新しいユーザーを作成"""
    hashed_password = get_password_hash(password)
    db_user = User(
        email=email,
        username=username,
        hashed_password=hashed_password,
        is_active=True,
        is_superuser=False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(
    db: Session,
    email: str,
    password: str
) -> Optional[User]:
    """ユーザー認証"""
    user = get_user_by_email(db, email=email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def update_user_password(
    db: Session,
    user_id: int,
    new_password: str
) -> Optional[User]:
    """ユーザーのパスワードを更新"""
    user = get_user_by_id(db, user_id=user_id)
    if not user:
        return None

    user.hashed_password = get_password_hash(new_password)
    db.commit()
    db.refresh(user)
    return user


def deactivate_user(db: Session, user_id: int) -> Optional[User]:
    """ユーザーを無効化"""
    user = get_user_by_id(db, user_id=user_id)
    if not user:
        return None

    user.is_active = False
    db.commit()
    db.refresh(user)
    return user
