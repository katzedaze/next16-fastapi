# Backend - FastAPI Application

FastAPI、SQLAlchemy、Alembic、PostgreSQLを使用したバックエンドアプリケーション。

## 構成

- **Python**: 3.14.0 (2025年10月、最新安定版)
- **FastAPI**: Webフレームワーク [standard] >=0.115.0 (2025年11月)
- **SQLAlchemy**: ORM 2.0.44 (2025年10月)
- **Alembic**: データベースマイグレーション >=1.17.1 (2025年10月)
- **PostgreSQL**: データベース 18 (2025年9月、最新安定版)
- **Uvicorn**: ASGIサーバー [standard] >=0.38.0 (2025年10月、Python 3.14対応)
- **Pydantic**: データバリデーション >=2.12.3 (2025年11月)
- **psycopg**: PostgreSQLドライバー [binary] >=3.2.12 (psycopg3、Python 3.14完全対応)

すべての依存関係は2025年の最新安定版を使用し、Python 3.14に完全対応しています。

## セットアップ

### 環境変数の設定

**重要**: 環境変数は**プロジェクトルート**（`next16-fastapi/`）の`.env`ファイルで管理します。
`backend/.env`は作成しないでください。

プロジェクトルートの`.env`ファイルは既に`.env.example`から作成されています。
必要に応じて値を編集してください。

### Docker Composeで起動

プロジェクトルートから実行：

```bash
# バックエンドとデータベースを起動
docker-compose up -d

# ログを確認
docker-compose logs -f backend

# 停止
docker-compose down

# ボリュームも削除する場合
docker-compose down -v
```

### データベースマイグレーション

```bash
# コンテナ内でマイグレーションを実行
docker-compose exec backend alembic upgrade head

# 新しいマイグレーションを生成
docker-compose exec backend alembic revision --autogenerate -m "migration message"

# マイグレーション履歴を確認
docker-compose exec backend alembic history

# 1つ前のマイグレーションに戻す
docker-compose exec backend alembic downgrade -1
```

## APIエンドポイント

サーバー起動後、以下のURLでアクセス可能：

- **ルート**: http://localhost:8000/
- **ヘルスチェック**: http://localhost:8000/health
- **テストAPI**: http://localhost:8000/api/test
- **APIドキュメント (Swagger)**: http://localhost:8000/docs
- **APIドキュメント (ReDoc)**: http://localhost:8000/redoc

## ローカル開発（Dockerなし）

### 依存関係のインストール

```bash
pip install -r requirements.txt
```

### データベースの準備

PostgreSQLがローカルで動作している必要があります。

```bash
# データベースの作成
createdb app_db

# マイグレーションを適用
alembic upgrade head
```

### サーバーの起動

```bash
uvicorn main:app --reload --port 8000
```

## プロジェクト構造

```
backend/
├── alembic/              # データベースマイグレーション
│   ├── versions/         # マイグレーションファイル
│   └── env.py           # Alembic環境設定
├── app/                  # アプリケーションコード
│   ├── __init__.py
│   ├── database.py      # データベース接続設定
│   └── models.py        # SQLAlchemyモデル
├── main.py              # FastAPIアプリケーションエントリーポイント
├── requirements.txt     # Python依存関係
├── Dockerfile           # Dockerイメージ定義
├── alembic.ini          # Alembic設定
└── .env.example         # 環境変数テンプレート
```

## モデルの追加方法

1. `app/models.py`に新しいモデルを追加
2. `alembic/env.py`でモデルをインポート（自動検出されるように）
3. マイグレーションを生成：
   ```bash
   docker-compose exec backend alembic revision --autogenerate -m "add new model"
   ```
4. マイグレーションを適用：
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

## トラブルシューティング

### データベース接続エラー

```bash
# データベースコンテナの状態を確認
docker-compose ps

# データベースログを確認
docker-compose logs db

# データベースに直接接続してテスト
docker-compose exec db psql -U postgres -d app_db
```

### マイグレーションエラー

```bash
# 現在のマイグレーション状態を確認
docker-compose exec backend alembic current

# データベースをリセット（開発時のみ）
docker-compose down -v
docker-compose up -d
docker-compose exec backend alembic upgrade head
```
