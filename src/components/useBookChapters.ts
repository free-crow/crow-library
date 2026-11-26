"use client";

import { useCallback, useEffect, useState } from "react";
import type { Book, Chapter } from "@/lib/types";

interface Toc { titles: string[]; }
const CACHE_LIMIT = 24;
const CACHE_TTL = 5 * 60 * 1000;
const jsonCache = new Map<string, { data: unknown; savedAt: number }>();

function isToc(data: unknown): data is Toc {
  const titles = (data as Toc | null)?.titles;
  return Array.isArray(titles) && titles.length > 0 &&
    titles.every((title) => typeof title === "string" && title.trim().length > 0);
}

function isChapter(data: unknown): data is Chapter {
  const chapter = data as Chapter | null;
  return typeof chapter?.title === "string" && chapter.title.trim().length > 0 &&
    Array.isArray(chapter.paras) && chapter.paras.length > 0 &&
    chapter.paras.every((paragraph) => typeof paragraph === "string");
}

function useBookJson<T>(url: string | null, attempt: number, validate: (data: unknown) => data is T) {
  const [result, setResult] = useState<{ url: string; attempt: number; data?: T; error?: boolean }>();
  useEffect(() => {
    if (!url) return;
    const cached = jsonCache.get(url);
    if (attempt === 0 && cached && Date.now() - cached.savedAt < CACHE_TTL && validate(cached.data)) {
      jsonCache.delete(url);
      jsonCache.set(url, cached);
      setResult({ url, attempt, data: cached.data });
      return;
    }
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 30000);
    fetch(url, { signal: controller.signal, cache: attempt ? "reload" : "force-cache" })
      .then(async (response) => {
        if (!response.ok) throw new Error(String(response.status));
        const data: unknown = await response.json();
        if (!validate(data)) throw new Error("Invalid book data");
        return data;
      })
      .then((data) => {
        if (!active) return;
        jsonCache.delete(url);
        jsonCache.set(url, { data, savedAt: Date.now() });
        if (jsonCache.size > CACHE_LIMIT) jsonCache.delete(jsonCache.keys().next().value!);
        setResult({ url, attempt, data });
      })
      .catch(() => {
        if (active) {
          jsonCache.delete(url);
          setResult({ url, attempt, error: true });
        }
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [url, attempt, validate]);
  return result?.url === url && result.attempt === attempt ? result : undefined;
}

/** Details and reader share the same validated TOC and retry behavior. */
export function useBookToc(book: Book | undefined) {
  const [attempt, setAttempt] = useState(0);
  const remote = book?.format === "TXT" && book.hasFullText;
  const id = remote ? encodeURIComponent(book.id) : "";
  const toc = useBookJson(remote ? `/books/toc/${id}.json` : null, attempt, isToc);
  const titles = remote ? toc?.data?.titles : book?.chapters?.map((chapter) => chapter.title);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { titles, error: Boolean(remote && toc?.error), loading: Boolean(remote && !toc), retry, attempt };
}

export function useBookChapters(book: Book | undefined, requested: number, ready: boolean) {
  const toc = useBookToc(book);
  const { titles, attempt } = toc;
  const remote = book?.format === "TXT" && book.hasFullText;
  const target = Number.isFinite(requested) ? Math.max(0, Math.floor(requested)) : 0;
  const index = titles?.length ? Math.min(target, titles.length - 1) : target;
  // Resolve the real TOC before requesting a saved index, so partial previews never clamp progress.
  const body = useBookJson(
    remote && ready && titles?.length ? `/books/chapters/${encodeURIComponent(book.id)}/${index}.json` : null,
    attempt,
    isChapter,
  );
  const chapter = remote ? body?.data : book?.chapters?.[index];
  const mismatch = Boolean(chapter && titles?.length && chapter.title !== titles[index]);
  const error = toc.error || Boolean(remote ? body?.error || mismatch : book?.format === "TXT" && !chapter);
  return { titles, index, chapter: error ? undefined : chapter, error, retry: toc.retry };
}
