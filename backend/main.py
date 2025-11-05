from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from pathlib import Path
from dotenv import load_dotenv

# プロジェクトルートの.envファイルを読み込む
project_root = Path(__file__).resolve().parent.parent
env_path = project_root / ".env"
load_dotenv(dotenv_path=env_path)

# ルーターのインポート
from app.routers import auth

app = FastAPI(
    title="Next16-FastAPI Application",
    description="Backend API for Next16-FastAPI application",
    version="1.0.0"
)

# CORS設定 - 環境変数からフロントエンドURLを取得
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーター登録
app.include_router(auth.router)


@app.get("/")
async def root():
    """ルートエンドポイント"""
    return {
        "message": "Welcome to Next16-FastAPI Application",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """ヘルスチェックエンドポイント"""
    return {
        "status": "healthy",
        "database": "connected"
    }


@app.get("/api/test")
async def test_endpoint():
    """テスト用エンドポイント"""
    return {
        "message": "API is working!",
        "environment": os.getenv("ENVIRONMENT", "development")
    }
