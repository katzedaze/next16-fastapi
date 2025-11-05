from pydantic_settings import BaseSettings
from pathlib import Path
import os
from dotenv import load_dotenv

# プロジェクトルートの.envファイルを読み込む
project_root = Path(__file__).resolve().parent.parent.parent.parent
env_path = project_root / ".env"
load_dotenv(dotenv_path=env_path)


class Settings(BaseSettings):
    """アプリケーション設定"""

    # アプリケーション基本設定
    app_name: str = "Next16-FastAPI Application"
    environment: str = os.getenv("ENVIRONMENT", "development")

    # データベース設定
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/app_db"
    )

    # JWT認証設定
    secret_key: str = os.getenv(
        "SECRET_KEY",
        "your-secret-key-please-change-in-production-min-32-characters"
    )
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # CORS設定
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    class Config:
        env_file = str(env_path)
        case_sensitive = False


settings = Settings()
