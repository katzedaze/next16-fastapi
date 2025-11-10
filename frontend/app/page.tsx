import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="text-center px-4 max-w-4xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Next16-FastAPI
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Full-stack application with Next.js 16 and FastAPI
        </p>

        <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Authentication Demo
          </h2>
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
        </div>

        <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Next.js 16 Cache Testing
          </h2>
          <p className="text-gray-600 mb-4">
            Compare caching strategies: &apos;use cache&apos; vs Suspense
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/items-use-cache"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              use cache Version
            </Link>
            <Link
              href="/items-suspense"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Suspense Version
            </Link>
            <Link
              href="/items-create"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Create Item
            </Link>
          </div>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>JWT認証 • React Hook Form • Zod • PostgreSQL • Next.js 16 Caching</p>
        </div>
      </main>
    </div>
  );
}
