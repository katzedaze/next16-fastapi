.PHONY: help build up down restart logs logs-backend logs-db ps clean migrate migrate-create migrate-history test health shell shell-db

# デフォルトターゲット
help:
	@echo "=========================================="
	@echo "Next16-FastAPI Docker Management"
	@echo "=========================================="
	@echo ""
	@echo "Available commands:"
	@echo "  make build          - Docker イメージをビルド"
	@echo "  make up             - コンテナを起動（デタッチモード）"
	@echo "  make down           - コンテナを停止・削除"
	@echo "  make restart        - コンテナを再起動"
	@echo "  make logs           - すべてのログを表示（リアルタイム）"
	@echo "  make logs-backend   - バックエンドのログを表示"
	@echo "  make logs-db        - データベースのログを表示"
	@echo "  make ps             - コンテナの状態を表示"
	@echo "  make clean          - すべてを停止・削除（ボリューム含む）"
	@echo ""
	@echo "Database commands:"
	@echo "  make migrate        - マイグレーションを実行"
	@echo "  make migrate-create - 新しいマイグレーションを作成"
	@echo "  make migrate-history - マイグレーション履歴を表示"
	@echo ""
	@echo "Development commands:"
	@echo "  make test           - 起動確認とヘルスチェック"
	@echo "  make health         - ヘルスチェックエンドポイントをテスト"
	@echo "  make shell          - バックエンドコンテナのシェルに入る"
	@echo "  make shell-db       - データベースコンテナに接続"
	@echo ""

# Docker イメージをビルド
build:
	@echo "🔨 Building Docker images..."
	docker-compose build

# コンテナを起動
up:
	@echo "🚀 Starting containers..."
	docker-compose up -d
	@echo ""
	@echo "✅ Containers started!"
	@echo "Backend API: http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"
	@echo ""
	@echo "Run 'make logs' to view logs"
	@echo "Run 'make migrate' to apply database migrations"

# コンテナを停止・削除
down:
	@echo "🛑 Stopping containers..."
	docker-compose down

# コンテナを再起動
restart: down up

# すべてのログを表示
logs:
	docker-compose logs -f

# バックエンドのログを表示
logs-backend:
	docker-compose logs -f backend

# データベースのログを表示
logs-db:
	docker-compose logs -f db

# コンテナの状態を表示
ps:
	@echo "📊 Container Status:"
	@docker-compose ps
	@echo ""
	@echo "🐳 Docker Processes:"
	@docker ps --filter "name=next16-fastapi"

# すべてを停止・削除（ボリューム含む）
clean:
	@echo "🧹 Cleaning up..."
	docker-compose down -v
	@echo "✅ Cleanup complete!"

# マイグレーションを実行
migrate:
	@echo "🔄 Running database migrations..."
	docker-compose exec backend alembic upgrade head
	@echo "✅ Migrations applied!"

# 新しいマイグレーションを作成
migrate-create:
	@read -p "Enter migration message: " msg; \
	docker-compose exec backend alembic revision --autogenerate -m "$$msg"

# マイグレーション履歴を表示
migrate-history:
	@echo "📜 Migration History:"
	docker-compose exec backend alembic history

# 起動確認とヘルスチェック
test:
	@echo "🧪 Running startup tests..."
	@echo ""
	@echo "1️⃣ Checking if containers are running..."
	@docker-compose ps
	@echo ""
	@echo "2️⃣ Waiting for backend to be ready..."
	@sleep 3
	@echo ""
	@echo "3️⃣ Testing health endpoint..."
	@curl -f http://localhost:8000/health || (echo "❌ Health check failed!" && exit 1)
	@echo ""
	@echo ""
	@echo "4️⃣ Testing root endpoint..."
	@curl -f http://localhost:8000/ || (echo "❌ Root endpoint failed!" && exit 1)
	@echo ""
	@echo ""
	@echo "✅ All tests passed!"
	@echo ""
	@echo "🎉 Your application is running successfully!"
	@echo "📝 API Documentation: http://localhost:8000/docs"

# ヘルスチェックエンドポイントをテスト
health:
	@echo "🏥 Checking application health..."
	@curl -s http://localhost:8000/health | python3 -m json.tool

# バックエンドコンテナのシェルに入る
shell:
	@echo "🐚 Opening shell in backend container..."
	docker-compose exec backend /bin/bash

# データベースコンテナに接続
shell-db:
	@echo "🗄️  Connecting to PostgreSQL..."
	docker-compose exec db psql -U postgres -d app_db
