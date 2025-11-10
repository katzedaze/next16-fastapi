"use client";

import { useState } from "react";
import Link from "next/link";
import { createItem } from "@/lib/api";

/**
 * Item Creation Form Page
 *
 * This is a Client Component that allows users to create new items.
 * After creating an item, users can navigate to cached pages to observe
 * cache behavior.
 */
export default function ItemsCreatePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await createItem({
        title,
        description: description || undefined,
      });

      setSuccess(true);
      setTitle("");
      setDescription("");

      // Wait a bit to show success message
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-200">
              新規アイテム作成
            </h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
              CSR (Client)
            </span>
          </div>
          <p className="text-gray-200">
            キャッシュ無効化動作をテストするための新しいアイテムを追加
          </p>
        </div>

        <div className="mb-6 flex gap-4">
          <Link
            href="/items-use-cache"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            use cache版を見る
          </Link>
          <Link
            href="/items-suspense"
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Suspense版を見る
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium mb-2 text-gray-900"
              >
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={255}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="アイテムのタイトルを入力"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-2 text-gray-900"
              >
                説明
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="アイテムの説明を入力（任意）"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                アイテムが正常に作成されました！一覧ページに移動してキャッシュ動作を確認してください。
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "作成中..." : "アイテムを作成"}
            </button>
          </form>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <h2 className="font-semibold text-yellow-900 mb-2">テスト手順:</h2>
          <ol className="text-sm text-yellow-800 space-y-2 list-decimal list-inside">
            <li>
              <strong>ステップ 1:</strong> まず &quot;use cache&quot; または
              &quot;Suspense&quot; の一覧ページにアクセス
            </li>
            <li>
              <strong>ステップ 2:</strong> タイムスタンプと現在のアイテムを確認
            </li>
            <li>
              <strong>ステップ 3:</strong> このフォームで新しいアイテムを作成
            </li>
            <li>
              <strong>ステップ 4:</strong> 一覧ページに戻る
            </li>
            <li>
              <strong>ステップ 5:</strong> キャッシュの動作を観察:
              <ul className="ml-6 mt-1 space-y-1">
                <li>
                  • <strong>use cache:</strong>{" "}
                  データは1分間キャッシュされ、新しいアイテムはすぐに表示されません
                </li>
                <li>
                  • <strong>Suspense:</strong>{" "}
                  データはビルド時にキャッシュされ、再ビルドまで更新されません
                </li>
                <li>
                  •
                  キャッシュの有効期限を待つか、revalidateTag()を使用して更新を確認
                </li>
              </ul>
            </li>
          </ol>
        </div>

        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h2 className="font-semibold text-blue-900 mb-2">
            キャッシュ無効化のオプション:
          </h2>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • <strong>use cache ページ:</strong>{" "}
              1分後に自動再検証（cacheLife）
            </li>
            <li>
              • <strong>手動無効化:</strong> Server Action で
              revalidateTag(&apos;items&apos;) を使用
            </li>
            <li>
              • <strong>強制リフレッシュ:</strong>{" "}
              ブラウザのハードリロード（Ctrl+Shift+R）
            </li>
            <li>
              • <strong>ルーターリフレッシュ:</strong>{" "}
              router.refresh()を使用（テストには非推奨）
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
