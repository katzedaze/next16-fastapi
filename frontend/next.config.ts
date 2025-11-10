import type { NextConfig } from "next";
import { config } from 'dotenv';
import { resolve } from 'path';

// ルートディレクトリの.envファイルを読み込む
config({ path: resolve(__dirname, '../.env') });

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    cacheComponents: true,
  },
};

export default nextConfig;
