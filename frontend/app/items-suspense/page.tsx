import { Suspense } from "react";
import { fetchItems } from "@/lib/api";
import Link from "next/link";
import CurrentTimestamp from "./CurrentTimestamp";

/**
 * Component that fetches items without explicit caching
 * Demonstrates how Suspense handles async data fetching
 */
async function ItemsList() {
  console.log("[Suspense] Fetching items from API...");
  const data = await fetchItems();
  console.log("[Suspense] Fetched items:", data.total);

  return (
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
                  Created: {new Date(item.createdAt).toLocaleString("ja-JP")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Loading component shown while ItemsList is fetching data
 */
function ItemsLoading() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Items List Page with Suspense boundary
 *
 * This page demonstrates:
 * - Using Suspense for async data fetching
 * - Automatic loading states
 * - Streaming server rendering
 * - No explicit caching directives
 */
export default function ItemsSuspensePage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-200">
              アイテム一覧 - Suspense
            </h1>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full">
              SSG + Streaming
            </span>
          </div>
          <p className="text-gray-200">React Suspenseを使用したデータ取得</p>
          <p className="text-sm text-gray-200 mt-2">
            ページレンダリング時刻: <CurrentTimestamp />
          </p>
        </div>

        <div className="mb-6 p-4 bg-purple-50 rounded-lg">
          <h2 className="font-semibold text-purple-900 mb-2">
            キャッシング戦略:
          </h2>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>
              • レンダリング: <strong>SSG + Streaming</strong> (静的生成 +
              ストリーミング)
            </li>
            <li>• Suspense境界を使用した非同期データ取得</li>
            <li>
              •
              明示的なキャッシングディレクティブなし（Next.jsのデフォルト動作）
            </li>
            <li>
              • fetch()リクエストはデフォルトで &apos;force-cache&apos;
              でキャッシュされる
            </li>
            <li>• ローディング状態が自動的に表示される</li>
            <li>• データ部分のみストリーミングで配信される</li>
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
            href="/items-use-cache"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            use cache版を見る
          </Link>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            ホーム
          </Link>
        </div>

        <Suspense fallback={<ItemsLoading />}>
          <ItemsList />
        </Suspense>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold text-yellow-900 mb-2">
            キャッシュ動作のテスト方法:
          </h3>
          <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
            <li>上部の「ページレンダリング時刻」を記録してください</li>
            <li>「新規作成」ボタンで新しいアイテムを作成します</li>
            <li>
              このページに戻る →
              タイムスタンプは変わる可能性がありますが、アイテムリストはキャッシュされたまま
            </li>
            <li>
              データはビルド時にキャッシュされ、再ビルドまたはブラウザのハードリフレッシュ(Ctrl+Shift+R)まで更新されません
            </li>
            <li>時間ベースの再検証がある use cache 版と比較してみてください</li>
          </ol>
        </div>

        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2 text-gray-900">主な違い:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-700 mb-1">
                use cache 版:
              </h4>
              <ul className="space-y-1 text-gray-700">
                <li>• cacheLifeによる明示的なキャッシュ制御</li>
                <li>• 選択的無効化のためのタグ付きキャッシング</li>
                <li>• 時間ベースの再検証（1分）</li>
                <li>• revalidateTag()で更新可能</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-700 mb-1">
                Suspense 版:
              </h4>
              <ul className="space-y-1 text-gray-700">
                <li>• 自動ローディング状態</li>
                <li>• Next.jsのデフォルトキャッシング動作</li>
                <li>• ページシェルは静的生成（SSG）</li>
                <li>• データはストリーミングで配信</li>
                <li>• 初期表示が高速</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
