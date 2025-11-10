"use client";

import { useEffect, useState } from "react";

/**
 * Client component to display current timestamp
 * SSR時のハイドレーション不一致を避けるため、クライアント側でのみレンダリング
 */
export default function CurrentTimestamp() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // setTimeoutを使用してsetStateを非同期にし、カスケードレンダリング警告を回避
    // この使用は意図的: SSR/クライアントのハイドレーション不一致を避けるため
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  if (!mounted) return <span>読み込み中...</span>;

  const now = new Date().toLocaleString("ja-JP");
  return <span>{now}</span>;
}
