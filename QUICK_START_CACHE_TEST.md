# 🚀 Next.js 16 Cache Testing - Quick Start Guide

## セットアップ (5分)

### 1. バックエンドとデータベースを起動

```bash
# プロジェクトルートで実行
make up
make migrate
```

バックエンドAPIは http://localhost:8000 で起動します。
API ドキュメント: http://localhost:8000/docs

### 2. フロントエンドを起動

```bash
cd frontend
npm run dev
```

フロントエンドは http://localhost:3000 で起動します。

## 🎯 テスト方法

### Step 1: ホームページにアクセス

http://localhost:3000 にアクセスすると、以下のオプションが表示されます:

- **use cache Version** - `use cache`ディレクティブを使用したページ
- **Suspense Version** - Suspense境界を使用したページ
- **Create Item** - アイテム作成フォーム

### Step 2: キャッシュ動作を確認

#### 🔵 `use cache`ページのテスト

1. **「use cache Version」**をクリック
2. ページ上部の**「Rendered at」タイムスタンプ**を確認
3. 表示されているアイテム数を確認
4. **「Create New Item」**ボタンをクリック
5. 新しいアイテムを作成（例: "Cache Test Item"）
6. ブラウザの**戻るボタン**で`use cache`ページに戻る

**期待される結果:**
- ✅ タイムスタンプは変わらない（キャッシュが効いている）
- ✅ 新しいアイテムは表示されない（1分間キャッシュされる）
- ⏱️ **1分後にページをリロード**すると、新しいアイテムが表示される

#### 🟣 Suspenseページのテスト

1. **「Suspense Version」**をクリック
2. ページ上部の**「Page rendered at」タイムスタンプ**を確認
3. 表示されているアイテム数を確認
4. **「Create New Item」**ボタンをクリック
5. 新しいアイテムを作成（例: "Suspense Test Item"）
6. ブラウザの**戻るボタン**でSuspenseページに戻る

**期待される結果:**
- ✅ タイムスタンプが変わる可能性がある（動的レンダリング部分）
- ✅ 新しいアイテムは表示されない（ビルド時にキャッシュ）
- 🔄 リロードしても変わらない（Next.jsの再ビルドが必要）

### Step 3: ブラウザコンソールで詳細を確認

開発者ツールのコンソールタブを開いて、以下のログを確認:

```
[use cache] Fetching items from API...
[use cache] Fetched items: 2
```

または

```
[Suspense] Fetching items from API...
[Suspense] Fetched items: 2
```

**キャッシュが効いている場合:** ページ遷移時にこのログが**表示されない**
**キャッシュが無効の場合:** ページ遷移時にログが表示される

## 📊 比較表

| 項目 | `use cache` | Suspense |
|------|-------------|----------|
| キャッシュ期間 | 1分（設定可能） | ビルド時まで |
| 新規データの反映 | 1分後に自動 | 再ビルドが必要 |
| 手動無効化 | `revalidateTag('items')` | `revalidatePath()` |
| ローディング表示 | 手動実装 | 自動（fallback） |
| 使用ケース | 動的データ | 静的コンテンツ |

## 🧪 実験してみよう

### 実験1: キャッシュタイミングの確認

1. `use cache`ページを開く
2. タイムスタンプを記録: `2025-11-10 12:00:00`
3. アイテムを1つ作成
4. **30秒後**にページに戻る → 新しいアイテムは表示されない
5. **1分30秒後**にページに戻る → 新しいアイテムが表示される

### 実験2: 複数アイテムの作成

1. `use cache`ページを開く
2. 3つのアイテムを連続で作成
3. ページに戻る → 新しいアイテムは表示されない
4. 1分待つ
5. ページをリロード → **3つすべて**が表示される

### 実験3: 両方のページを比較

1. `use cache`ページでタイムスタンプを記録
2. Suspenseページでタイムスタンプを記録
3. アイテムを作成
4. 両方のページに戻る
5. 動作の違いを観察

## 🔍 トラブルシューティング

### APIが応答しない場合

```bash
# バックエンドの状態を確認
make logs

# 再起動
make down
make up
make migrate
```

### フロントエンドでエラーが出る場合

```bash
cd frontend

# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install

# 開発サーバーを再起動
npm run dev
```

### キャッシュがクリアされない場合

- ブラウザのハードリロード: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
- `.next`フォルダを削除: `rm -rf frontend/.next`

## 📚 詳細ドキュメント

より詳しい説明は `CACHE_TESTING_GUIDE.md` を参照してください。

## 🎓 学んだこと

このテストで理解できること:

1. **`use cache`の動作原理**
   - 関数レベルでのキャッシュ
   - `cacheLife`による有効期限の設定
   - `cacheTag`による選択的無効化

2. **Suspenseの動作原理**
   - コンポーネントレベルでの非同期処理
   - 自動ローディング状態
   - Next.jsのデフォルトキャッシング

3. **適切な使い分け**
   - いつ`use cache`を使うべきか
   - いつSuspenseを使うべきか
   - パフォーマンスとUXのトレードオフ

## 🚀 次のステップ

1. Server Actionと`revalidateTag()`の実装
2. `use cache: remote`の検証
3. `use cache: private`でユーザー固有のキャッシュを実装

---

**Have fun testing!** 🎉
