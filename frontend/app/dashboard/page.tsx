'use client';

/**
 * ダッシュボードページ（ログイン後のホームページ）
 * 認証が必要な保護されたページ
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/stores/auth-context';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  // 認証チェック
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // ローディング中
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 未認証の場合は何も表示しない（リダイレクト中）
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            ログアウト
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ウェルカムメッセージ */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            ようこそ、{user.username}さん！
          </h2>
          <p className="text-gray-600">
            ログインに成功しました。このページは認証が必要な保護されたページです。
          </p>
        </div>

        {/* ユーザー情報カード */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ユーザー情報</h3>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">ユーザーID</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">ユーザー名</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.username}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">メールアドレス</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">ステータス</dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.isActive ? 'アクティブ' : '非アクティブ'}
                </span>
              </dd>
            </div>
            {user.createdAt && (
              <div>
                <dt className="text-sm font-medium text-gray-500">登録日</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(user.createdAt).toLocaleString('ja-JP')}
                </dd>
              </div>
            )}
            {user.updatedAt && (
              <div>
                <dt className="text-sm font-medium text-gray-500">最終更新日</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(user.updatedAt).toLocaleString('ja-JP')}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* 機能紹介 */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            実装された機能
          </h3>
          <ul className="list-disc list-inside text-blue-800 space-y-1">
            <li>JWT認証によるセキュアな認証</li>
            <li>React Hook Form + Zodによるフォームバリデーション</li>
            <li>バックエンドのcamelCase ↔ snake_case自動変換</li>
            <li>認証状態管理（Context API）</li>
            <li>保護されたルート</li>
            <li>自動的なトークン管理</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
