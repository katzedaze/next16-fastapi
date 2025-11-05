# Next16-FastAPI

Next.js 16とFastAPIを使用したモダンなフルスタックWebアプリケーション開発用テンプレート。

## 特徴

- **Frontend**: Next.js 16 (App Router) + React 19 + Tailwind CSS v4
- **Backend**: FastAPI + SQLAlchemy 2.0 + Alembic
- **Database**: PostgreSQL 18
- **認証**: JWT認証システム（登録・ログイン機能実装済み）
- **型安全**: TypeScript (フロントエンド) + Pydantic (バックエンド)
- **開発環境**: Docker Compose対応

## 技術スタック

### Frontend

- Next.js 16.0.1 (App Router)
- React 19.2.0
- TypeScript 5
- Tailwind CSS v4
- React Hook Form + Zod (フォームバリデーション)

### Backend

- Python 3.14.0
- FastAPI >=0.115.0
- SQLAlchemy 2.0.44
- Alembic >=1.17.1
- PostgreSQL 18
- JWT認証 (bcrypt + python-jose)

## クイックスタート

### 前提条件

- Docker & Docker Compose
- Node.js 20+ (フロントエンド開発用)
- Make (オプション、便利なコマンド実行用)

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd next16-fastapi
```

### 2. 環境変数の設定

```bash
# .env.exampleから.envを作成（既に作成済みの場合はスキップ）
cp .env.example .env

# 必要に応じて.envを編集
vim .env
```

### 3. バックエンドとデータベースの起動

```bash
# Makefileを使用する場合（推奨）
make up
make migrate

# または、docker-composeを直接使用
docker-compose up -d
docker-compose exec backend alembic upgrade head
```

バックエンドが起動したら、以下のURLにアクセスできます：

- API: <http://localhost:8000>
- API ドキュメント: <http://localhost:8000/docs>
- ReDoc: <http://localhost:8000/redoc>

### 4. フロントエンドの起動

```bash
cd frontend
npm install
npm run dev
```

フロントエンドは <http://localhost:3000> で起動します。

## 開発コマンド

### Makeコマンド（推奨）

プロジェクトルートで実行：

```bash
make help            # すべてのコマンドを表示
make up              # バックエンド・DBを起動
make down            # サービスを停止
make logs            # ログを表示
make migrate         # マイグレーションを実行
make migrate-create  # 新しいマイグレーションを作成
make shell           # バックエンドコンテナに入る
make shell-db        # PostgreSQLに接続
make health          # ヘルスチェック
make clean           # すべて削除（ボリューム含む）
```

### Docker Composeコマンド

```bash
# サービスの起動・停止
docker-compose up -d              # 起動
docker-compose down               # 停止
docker-compose down -v            # 停止 + ボリューム削除

# ログ確認
docker-compose logs -f backend    # バックエンドのログ
docker-compose logs -f db         # データベースのログ

# マイグレーション
docker-compose exec backend alembic upgrade head
docker-compose exec backend alembic revision --autogenerate -m "message"
```

### フロントエンドコマンド

`frontend/`ディレクトリで実行：

```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm start            # プロダクションサーバー起動
npm run lint         # ESLint実行
```

## プロジェクト構造

```text
next16-fastapi/
├── frontend/                    # Next.js フロントエンド
│   ├── app/                    # App Router (pages, layouts)
│   ├── lib/                    # ユーティリティ関数
│   └── public/                 # 静的ファイル
│
├── backend/                     # FastAPI バックエンド
│   ├── app/
│   │   ├── core/               # 設定・セキュリティ・依存性
│   │   ├── models.py           # SQLAlchemyモデル
│   │   ├── schemas/            # Pydanticスキーマ
│   │   ├── crud/               # データベース操作
│   │   ├── routers/            # APIエンドポイント
│   │   └── database.py         # DB接続設定
│   ├── alembic/                # データベースマイグレーション
│   └── main.py                 # FastAPIエントリーポイント
│
├── docker-compose.yml           # Docker Compose設定
├── Makefile                     # 便利なコマンド集
├── .env                         # 環境変数（gitignore済み）
├── .env.example                 # 環境変数テンプレート
└── README.md                    # このファイル
```

## API エンドポイント

実装済みのエンドポイント：

- `GET /` - ルートエンドポイント
- `GET /health` - ヘルスチェック
- `POST /auth/register` - ユーザー登録
- `POST /auth/login` - ログイン（JWT取得）

詳細なAPIドキュメントは <http://localhost:8000/docs> で確認できます。

## データベース

### マイグレーション

新しいモデルを追加した場合：

1. `backend/app/models.py` にモデルを定義
2. `backend/alembic/env.py` でモデルをインポート
3. マイグレーションを生成:

   ```bash
   make migrate-create
   # または
   docker-compose exec backend alembic revision --autogenerate -m "add new model"
   ```

4. マイグレーションを適用:

   ```bash
   make migrate
   # または
   docker-compose exec backend alembic upgrade head
   ```

### データベースリセット

開発中にデータベースをリセットする場合：

```bash
make clean           # すべて削除
make up              # 再起動
make migrate         # マイグレーション適用
```

## 環境変数

プロジェクトルートの`.env`ファイルで管理します：

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=app_db
POSTGRES_PORT=5432

# Backend
BACKEND_PORT=8000
ENVIRONMENT=development

# Frontend
FRONTEND_URL=http://localhost:3000

# JWT Secret (本番環境では必ず変更してください)
SECRET_KEY=your-secret-key-here
```

**重要**: サブディレクトリ（`backend/`や`frontend/`）に`.env`ファイルを作成しないでください。すべての環境変数はプロジェクトルートの`.env`で管理します。

## 開発ワークフロー

### 新機能の追加

1. **バックエンド**:
   - `backend/app/models.py` にモデルを追加
   - `backend/app/schemas/` にスキーマを追加
   - `backend/app/crud/` にCRUD操作を追加
   - `backend/app/routers/` にルーターを追加
   - `backend/main.py` でルーターを登録
   - マイグレーションを生成・適用

2. **フロントエンド**:
   - `frontend/app/` に新しいページを追加
   - 必要に応じてコンポーネントを作成
   - React Hook Form + Zodでフォームを実装
   - APIクライアント関数を実装

### 認証の実装

バックエンドには既にJWT認証が実装されています：

- パスワードハッシュ化（bcrypt）
- JWT トークン生成・検証
- 保護されたエンドポイント用の依存性

フロントエンドで認証を使用する場合：

```typescript
// ログイン
const response = await fetch('http://localhost:8000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { access_token } = await response.json();

// 保護されたエンドポイントへのアクセス
fetch('http://localhost:8000/protected', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
```

## トラブルシューティング

### データベース接続エラー

```bash
# データベースコンテナの状態確認
docker-compose ps
docker-compose logs db

# データベースに直接接続してテスト
make shell-db
```

### マイグレーションエラー

```bash
# 現在のマイグレーション状態を確認
docker-compose exec backend alembic current

# マイグレーション履歴を確認
make migrate-history

# データベースをリセット（開発時のみ）
make clean
make up
make migrate
```

### ポートの競合

`.env`ファイルでポートを変更できます：

```env
POSTGRES_PORT=5433
BACKEND_PORT=8001
```

## ライセンス

MIT

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。
