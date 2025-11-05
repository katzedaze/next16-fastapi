from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from pathlib import Path
from dotenv import load_dotenv

# プロジェクトルートの.envファイルを読み込む
# Dockerコンテナ内では環境変数が直接渡されるため、このload_dotenvは主にローカル開発用
project_root = Path(__file__).resolve().parent.parent.parent
env_path = project_root / ".env"
load_dotenv(dotenv_path=env_path)

# データベースURL
# psycopg3を使用するため postgresql+psycopg:// を使用
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://postgres:postgres@localhost:5432/app_db"
)

# SQLAlchemyエンジンの作成
engine = create_engine(DATABASE_URL)

# セッションローカルの作成
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Baseクラスの作成
Base = declarative_base()


# データベースセッションの依存性
def get_db():
    """データベースセッションを取得"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
