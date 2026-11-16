"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Book, Chapter } from "@/lib/types";

export interface BookChaptersState {
  chapters: Chapter[];
  loading: boolean;
  error: boolean;
  retry: () => void;
}

/** 单本全文最长等待时间：超过就给出明确错误，不让页面一直转圈 */
const FETCH_TIMEOUT = 30000;

/**
 * 最近打开过的全文按 id 缓存在内存里：从详情页返回、或在同一本书里来回切换时不再重新下载解析。
 * 只保留最近 3 本，避免长文本把内存撑大。
 */
const chapterCache = new Map<string, Chapter[]>();

function remember(id: string, chapters: Chapter[]) {
  chapterCache.delete(id);
  chapterCache.set(id, chapters);
  if (chapterCache.size > 3) {
    const oldest = chapterCache.keys().next().value;
    if (oldest) chapterCache.delete(oldest);
  }
}

/**
 * 优先加载 public/books/text/<id>.json 的公版全文，未提供时回退 data.ts 内置章节。
 * 全文加载期间不返回内置预览章节，避免调用方把预览章节数当成真实章节数（导致进度被夹到第 2 章）。
 * 依赖 book 的稳定字段而非整个对象，切换界面语言重新 map 书籍对象时不会重复请求全文。
 */
export function useBookChapters(book?: Book | null): BookChaptersState {
  const [state, setState] = useState<{ chapters: Chapter[] | null; loading: boolean; error: boolean }>({
    chapters: null,
    loading: true,
    error: false,
  });
  const [attempt, setAttempt] = useState(0);

  const id = book?.id;
  const format = book?.format;
  const hasFullText = book?.hasFullText;
  const builtin = book?.chapters;

  /* 内置预览章节只作兜底，用 ref 读取，避免它每次换引用都触发全文重新下载 */
  const builtinRef = useRef<Chapter[] | undefined>(builtin);
  builtinRef.current = builtin;

  const retry = useCallback(() => setAttempt((v) => v + 1), []);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (!id || format !== "TXT") {
      setState({ chapters: null, loading: false, error: false });
      return;
    }
    const cached = chapterCache.get(id);
    if (cached?.length) {
      setState({ chapters: cached, loading: false, error: false });
      return;
    }
    if (!hasFullText) {
      const chapters = builtinRef.current ?? [];
      setState({ chapters, loading: false, error: chapters.length === 0 });
      return;
    }
    const ctrl = new AbortController();
    setState({ chapters: null, loading: true, error: false });
    timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT);
    fetch(`/books/text/${id}.json`, { signal: ctrl.signal, cache: "force-cache" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive) return;
        const chapters: Chapter[] = d?.chapters?.length ? (d.chapters as Chapter[]) : (builtinRef.current ?? []);
        if (chapters.length && d?.chapters?.length) remember(id, chapters);
        setState({ chapters, loading: false, error: chapters.length === 0 });
      })
      .catch(() => {
        if (!alive) return;
        /* 网络失败/超时：先用内置预览章节保证有内容可读，再由界面提供重试 */
        const chapters = builtinRef.current ?? [];
        setState({ chapters, loading: false, error: chapters.length === 0 });
      })
      .finally(() => clearTimeout(timer));
    return () => {
      alive = false;
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [id, format, hasFullText, attempt]);

  return { chapters: state.chapters ?? [], loading: state.loading, error: state.error, retry };
}
