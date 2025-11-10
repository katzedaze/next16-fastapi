import { cacheLife, cacheTag } from "next/cache";
import { fetchItems } from "@/lib/api";
import Link from "next/link";
import CurrentTimestamp from "./CurrentTimestamp";

/**
 * Cached data fetching function using 'use cache' directive
 * This demonstrates Next.js 16's new caching mechanism
 */
async function getItems() {
  "use cache";
  cacheTag("items");
  cacheLife("minutes"); // Cache for 1 minute

  console.log("[use cache] Fetching items from API...");
  const data = await fetchItems();
  console.log("[use cache] Fetched items:", data.total);

  return data;
}

/**
 * Items List Page with 'use cache' directive
 *
 * This page demonstrates:
 * - Using 'use cache' directive for function-level caching
 * - Cache invalidation with cacheTag
 * - Configurable cache lifetime with cacheLife
 */
export default async function ItemsUseCachePage() {
  const data = await getItems();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-200">
              アイテム一覧 - use cache
            </h1>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
              SSG + Cache
            </span>
          </div>
          <p className="text-gray-200">
            Next.js 16の &apos;use cache&apos;
            ディレクティブを使用したキャッシング
          </p>
          <p className="text-sm text-gray-200 mt-2">
            レンダリング時刻: <CurrentTimestamp />
          </p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold text-blue-900 mb-2">
            キャッシング戦略:
          </h2>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • レンダリング: <strong>SSG + Cache</strong> (静的生成 +
              関数レベルキャッシュ)
            </li>
            <li>
              • getItems()関数に &apos;use cache&apos; ディレクティブを使用
            </li>
            <li>
              • キャッシュ有効期限: 1分間 (cacheLife(&apos;minutes&apos;))
            </li>
            <li>• キャッシュタグ: &apos;items&apos; (無効化用)</li>
            <li>• データは1分後に自動再検証される</li>
            <li>• ページ自体は静的だが、データ取得がキャッシュされる</li>
          </ul>
        </div>

        <div className="mb-6 flex gap-4">
          <Link
            href="/items-create"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            新規作成
          </Link>
          <Link
            href="/items-suspense"
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Suspense版を見る
          </Link>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            ホーム
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Items List ({data.total} items)
            </h2>
          </div>

          {data.items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              アイテムがありません。新規作成してください！
            </p>
          ) : (
            <div className="space-y-4">
              {data.items.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <h3 className="font-semibold text-lg mb-1 text-gray-900">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-gray-600 mb-2">{item.description}</p>
                  )}
                  <div className="text-sm text-gray-500">
                    <span>ID: {item.id}</span>
                    <span className="mx-2">•</span>
                    <span>
                      Created:{" "}
                      {new Date(item.createdAt).toLocaleString("ja-JP")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold text-yellow-900 mb-2">
            キャッシュ動作のテスト方法:
          </h3>
          <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
            <li>上部の「レンダリング時刻」を記録してください</li>
            <li>「新規作成」ボタンで新しいアイテムを作成します</li>
            <li>
              このページに戻る →
              タイムスタンプは変わりません（キャッシュされている）
            </li>
            <li>
              1分待ってリロード（ブラウザの更新）→ 新しいデータが表示されます
            </li>
            <li>
              または Server Action で revalidateTag(&apos;items&apos;)
              を使用して即座に無効化できます
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
