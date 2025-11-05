import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16 Proxy
 *
 * SSR対応の認証チェック
 * 保護されたルートへのアクセス時に、Cookieからトークンの存在をチェックします。
 *
 * Note: Next.js 16では`middleware`が`proxy`にリネームされました。
 */

// 保護されたルート（認証が必要）
const protectedRoutes = ['/dashboard'];

// 認証済みユーザーがアクセスできないルート（ログインページなど）
const authRoutes = ['/login', '/signup'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cookieからアクセストークンを取得
  const accessToken = request.cookies.get('access_token')?.value;
  const isAuthenticated = !!accessToken;

  // 保護されたルートへのアクセスチェック
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      // 未認証の場合はログインページにリダイレクト
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 認証済みユーザーがログイン/サインアップページにアクセスした場合
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      // ダッシュボードにリダイレクト
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Proxyを適用するパスの設定
export const config = {
  matcher: [
    /*
     * 以下のパスを除くすべてのパスにマッチ:
     * - api (APIルート)
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化ファイル)
     * - favicon.ico (ファビコン)
     * - public フォルダ内のファイル
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};
