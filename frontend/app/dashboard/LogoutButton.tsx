'use client';

/**
 * ログアウトボタンコンポーネント
 * Client Componentとして、ユーザーインタラクションを処理
 */

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);

      // バックエンドのログアウトエンドポイントを呼び出し
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Cookieを含める
      });

      // ログインページにリダイレクト
      router.push('/login');
      router.refresh(); // Server Componentを再読み込み
    } catch (error) {
      console.error('Logout error:', error);
      // エラーが発生してもログインページにリダイレクト
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
    >
      {isLoading ? 'ログアウト中...' : 'ログアウト'}
    </button>
  );
}
