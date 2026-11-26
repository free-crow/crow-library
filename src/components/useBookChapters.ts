"use client";

import { useEffect, useState } from "react";
import type { Book, Chapter } from "@/lib/types";

function useBookJson<T>(url: string | null, attempt: number) {
  const [result, setResult] = useState<{ url: string; attempt: number; data?: T; error?: boolean }>();
  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 30000);
    fetch(url, { signal: controller.signal, cache: "force-cache" })
      .then(async (response) => {
        if (!response.ok) throw new Error(String(response.status));
        return await response.json() as T;
      })
      .then((data) => { if (active) setResult({ url, attempt, data }); })
      .catch(() => { if (active) setResult({ url, attempt, error: true }); })
      .finally(() => clearTimeout(timeout));
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [url, attempt]);
  return result?.url === url && result?.attempt === attempt ? result : undefined;
}

export function useBookChapters(book: Book | undefined, requested: number, ready: boolean) {
  const [attempt, setAttempt] = useState(0);
  const remote = book?.format === "TXT" && book.hasFullText;
  const id = remote ? encodeURIComponent(book.id) : "";
  const toc = useBookJson<{ titles: string[] }>(remote ? `/books/toc/${id}.json` : null, attempt);
  const titles = remote ? toc?.data?.titles : book?.chapters?.map((chapter) => chapter.title);
  const target = Number.isFinite(requested) ? Math.max(0, Math.floor(requested)) : 0;
  const index = titles?.length ? Math.min(target, titles.length - 1) : target;
  // 同时请求目录和目标章。越界链接在目录返回后自动定位到最后一章。
  const body = useBookJson<Chapter>(remote && ready ? `/books/chapters/${id}/${index}.json` : null, attempt);
  const chapter = remote ? body?.data : book?.chapters?.[index];
  const error = remote ? toc?.error || (titles && (body?.error || !titles.length)) : !chapter;
  return { titles, index, chapter, error, retry: () => setAttempt((n) => n + 1) };
}
