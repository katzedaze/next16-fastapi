# Next.js 16 Cache Testing Guide

このガイドでは、Next.js 16の`use cache`ディレクティブとSuspenseを使用した2つの異なるキャッシング戦略の動作を比較・検証する方法を説明します。

## 📋 概要

このプロジェクトでは、Next.js 16の新しいキャッシング機能を検証するために、以下の3つのページを実装しています:

1. **`/items-use-cache`** - `use cache`ディレクティブを使用
2. **`/items-suspense`** - Suspense境界を使用
3. **`/items-create`** - アイテム作成フォーム

## 🎯 実装内容

### バックエンド (FastAPI)

#### モデル

- **Item**: シンプルなアイテムモデル
  - `id`: 主キー
  - `title`: タイトル（必須）
  - `description`: 説明（オプション）
  - `created_at`: 作成日時
  - `updated_at`: 更新日時

#### APIエンドポイント

- `POST /api/items` - アイテム作成
- `GET /api/items` - アイテム一覧取得
- `GET /api/items/{id}` - 個別アイテム取得
- `DELETE /api/items/{id}` - アイテム削除

### フロントエンド (Next.js 16)

#### `/items-use-cache` ページ

**キャッシング戦略:**

```typescript
async function getItems() {
  'use cache';
  cacheTag('items');
  cacheLife('minutes'); // 1分間キャッシュ

  return await fetchItems();
}
```

**特徴:**

- ✅ 明示的なキャッシュ制御
- ✅ `cacheLife('minutes')`で1分間のキャッシュ有効期限
- ✅ `cacheTag('items')`でタグベースの無効化が可能
- ✅ `revalidateTag('items')`で選択的に無効化可能
- ✅ 時間ベースの自動再検証

#### `/items-suspense` ページ

**キャッシング戦略:**

```typescript
async function ItemsList() {
  const data = await fetchItems();
  return <div>...</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<ItemsLoading />}>
      <ItemsList />
    </Suspense>
  );
}
```

**特徴:**

- ✅ 自動ローディング状態
- ✅ Next.jsのデフォルトキャッシング動作を使用
- ✅ `fetch()`リクエストはデフォルトで`'force-cache'`
- ✅ ビルド時に静的生成
- ✅ ストリーミングサーバーレンダリング対応

## 🧪 テスト手順

### セットアップ

1. **バックエンドとデータベースを起動:**

```bash
make up
make migrate
```

2. **フロントエンドを起動:**

```bash
cd frontend
npm run dev
```

### テストシナリオ 1: `use cache`ページのキャッシュ動作確認

1. `http://localhost:3000/items-use-cache` にアクセス
2. 「Rendered at」タイムスタンプを記録
3. 「Create New Item」ボタンをクリック
4. 新しいアイテムを作成
5. `/items-use-cache`ページに戻る

**期待される動作:**

- タイムスタンプは変わらない（ページがキャッシュされている）
- 新しいアイテムは**表示されない**（キャッシュが有効）
- 1分後にページをリロード → 新しいアイテムが表示される

### テストシナリオ 2: Suspenseページのキャッシュ動作確認

1. `http://localhost:3000/items-suspense` にアクセス
2. 「Page rendered at」タイムスタンプを記録
3. 「Create New Item」ボタンをクリック
4. 新しいアイテムを作成
5. `/items-suspense`ページに戻る

**期待される動作:**

- タイムスタンプは変わる可能性がある（動的レンダリング）
- 新しいアイテムは**表示されない**（データがビルド時にキャッシュ）
- リロードしても変わらない（再ビルドが必要）

### テストシナリオ 3: キャッシュ無効化の比較

#### `use cache`ページの場合

```typescript
// Server Actionで手動無効化
import { revalidateTag } from 'next/cache';

export async function createItemAction(data: FormData) {
  'use server';
  await createItem(data);
  revalidateTag('items'); // 即座にキャッシュ無効化
}
```

#### Suspenseページの場合

- 自動再検証なし（明示的な設定が必要）
- `revalidatePath('/items-suspense')`で無効化可能
- または再ビルドが必要

## 📊 キャッシュ動作の比較表

| 特徴 | `use cache` | Suspense |
|------|-------------|----------|
| キャッシュ制御 | 明示的 | 暗黙的（Next.jsデフォルト） |
| 再検証 | 時間ベース（cacheLife） | 設定なし（デフォルト） |
| タグベース無効化 | ✅ 可能（cacheTag） | ❌ 不可 |
| ローディング状態 | 手動実装が必要 | ✅ 自動 |
| ストリーミング | 可能 | ✅ 最適化済み |
| 使用ケース | データの鮮度が重要 | ユーザー体験重視 |

## 🔍 キャッシュの確認方法

### 1. ブラウザコンソールでログを確認

両方のページでは、データ取得時にコンソールログを出力します:

```typescript
console.log('[use cache] Fetching items from API...');
console.log('[Suspense] Fetching items from API...');
```

**キャッシュが機能している場合:** ページ遷移時にこのログが表示されない
**キャッシュが無効化された場合:** ページ遷移時にログが表示される

### 2. Next.js Dev Toolsを使用

Next.js 16では、開発者ツールでキャッシュ状態を確認できます。

### 3. Network タブで確認

- キャッシュヒット: APIリクエストが送信されない
- キャッシュミス: APIリクエストが送信される

## 🎓 学習ポイント

### `use cache`の利点

1. **細かい制御**: `cacheLife`で正確な有効期限を設定
2. **選択的無効化**: `cacheTag`を使用して特定のデータのみ無効化
3. **予測可能**: いつキャッシュが無効化されるか明確

### Suspenseの利点

1. **シンプル**: 追加の設定不要
2. **UX最適化**: 自動ローディング状態
3. **パフォーマンス**: ストリーミングレンダリングで初期表示が高速

### 使い分けの指針

**`use cache`を使用する場合:**

- データの鮮度が重要（例: 在庫情報、価格）
- 定期的な更新が必要
- Server Actionでデータを更新する場合

**Suspenseを使用する場合:**

- 静的なコンテンツ（例: ブログ記事、商品詳細）
- ユーザー体験を最優先
- ローディング状態の細かい制御が必要

## 🚀 次のステップ

### 実装してみたい機能

1. **Server Actionとの統合**

```typescript
'use server';
import { revalidateTag } from 'next/cache';

export async function createItemAction(formData: FormData) {
  const item = await createItem({
    title: formData.get('title') as string,
    description: formData.get('description') as string,
  });

  revalidateTag('items'); // キャッシュ即座に無効化
  return item;
}
```

2. **`use cache: remote`の検証**

```typescript
async function getDynamicPrice(productId: string) {
  'use cache: remote';
  cacheLife({ expire: 300 }); // 5分

  // 動的コンテキストでもキャッシュ可能
  await connection();
  return fetchPrice(productId);
}
```

3. **`use cache: private`の検証**

```typescript
async function getUserRecommendations(userId: string) {
  'use cache: private';
  cacheLife({ expire: 60 }); // 1分

  // ユーザー固有のキャッシュ
  const sessionId = (await cookies()).get('session-id')?.value;
  return fetchRecommendations(userId, sessionId);
}
```

## 📝 まとめ

Next.js 16の`use cache`ディレクティブは、より細かいキャッシュ制御を可能にします。
一方、Suspenseは簡潔でユーザー体験に優れています。

**両方の特性を理解し、適切に使い分けることが重要です。**

## 🔗 参考資料

- [Next.js 16 Documentation - use cache](https://nextjs.org/docs/app/api-reference/directives/use-cache)
- [React Suspense](https://react.dev/reference/react/Suspense)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
