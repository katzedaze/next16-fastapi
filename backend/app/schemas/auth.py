from typing import Optional
from pydantic import EmailStr, Field
from datetime import datetime
from .base import CamelCaseModel


# ========================================
# 認証リクエスト/レスポンススキーマ
# ========================================

class UserRegisterRequest(CamelCaseModel):
    """
    ユーザー登録リクエスト

    フロントエンド(キャメルケース):
    {
        "email": "user@example.com",
        "username": "johndoe",
        "password": "SecurePass123"
    }
    """
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=100)


class UserLoginRequest(CamelCaseModel):
    """
    ログインリクエスト

    フロントエンド(キャメルケース):
    {
        "email": "user@example.com",
        "password": "SecurePass123"
    }
    """
    email: EmailStr
    password: str


class TokenResponse(CamelCaseModel):
    """
    トークンレスポンス

    フロントエンド(キャメルケース):
    {
        "accessToken": "eyJ...",
        "refreshToken": "eyJ...",
        "tokenType": "bearer"
    }
    """
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"


class UserResponse(CamelCaseModel):
    """
    ユーザー情報レスポンス

    フロントエンド(キャメルケース):
    {
        "id": 1,
        "email": "user@example.com",
        "username": "johndoe",
        "isActive": true,
        "createdAt": "2025-11-06T00:00:00Z",
        "updatedAt": "2025-11-06T00:00:00Z"
    }
    """
    id: int
    email: str
    username: str
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class UserWithTokenResponse(CamelCaseModel):
    """
    ユーザー情報とトークンを含むレスポンス

    フロントエンド(キャメルケース):
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
    """
    user: UserResponse
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"


class RefreshTokenRequest(CamelCaseModel):
    """
    リフレッシュトークンリクエスト

    フロントエンド(キャメルケース):
    {
        "refreshToken": "eyJ..."
    }
    """
    refresh_token: str


class MessageResponse(CamelCaseModel):
    """
    メッセージレスポンス

    フロントエンド(キャメルケース):
    {
        "message": "Operation successful"
    }
    """
    message: str
