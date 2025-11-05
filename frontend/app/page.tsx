import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="text-center px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Next16-FastAPI
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Full-stack application with Next.js 16 and FastAPI
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ログイン
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            新規登録
          </Link>
        </div>
        <div className="mt-12 text-sm text-gray-500">
          <p>JWT認証 • React Hook Form • Zod • PostgreSQL</p>
        </div>
      </main>
    </div>
  );
}
