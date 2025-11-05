/**
 * ダッシュボードページ（ログイン後のホームページ）
 * Server Componentとして実装し、SSRとSEOに対応
 *
 * 認証チェックはMiddlewareで行われるため、
 * このページにアクセスできる時点で認証済みです。
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/api/server-auth';
import LogoutButton from './LogoutButton';
import type { Metadata } from 'next';

// SEO用のメタデータ
export const metadata: Metadata = {
  title: 'ダッシュボード | Next16-FastAPI',
  description: 'ユーザーダッシュボード - 認証が必要な保護されたページです。',
};

export default async function DashboardPage() {
  // Server Componentでユーザー情報を取得
  const user = await getCurrentUser();

  // ユーザー情報が取得できない場合はログインページにリダイレクト
  // （通常はMiddlewareでチェックされますが、念のため）
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <LogoutButton />
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
            ログインに成功しました。このページはSSR対応の認証が必要な保護されたページです。
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
            <li>JWT認証によるセキュアな認証（HttpOnly Cookie）</li>
            <li>React Hook Form + Zodによるフォームバリデーション</li>
            <li>バックエンドのcamelCase ↔ snake_case自動変換</li>
            <li>SSR対応の認証状態管理</li>
            <li>Middlewareによる保護されたルート</li>
            <li>Server Componentによる最適なSEO対応</li>
            <li>HttpOnly Cookieによるセキュリティ強化（XSS対策）</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
