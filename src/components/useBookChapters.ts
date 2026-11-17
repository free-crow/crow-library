"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Book, Chapter } from "@/lib/types";

export interface BookChaptersState {
  chapters: Chapter[];
  /** 全文尚未下完时，已能解析出的第一章。只用于首屏出字，不能当成完整目录。 */
  firstChapter: Chapter | null;
  loading: boolean;
  error: boolean;
  retry: () => void;
}

/** 从尚未收齐的 JSON 文本里取出 chapters[0]。串被截断或还不是合法对象时返回 null。 */
export function sliceFirstChapter(buffer: string): Chapter | null {
  const key = '"chapters":';
  const at = buffer.indexOf(key);
  if (at < 0) return null;
  let i = at + key.length;
  while (i < buffer.length && buffer[i] === " ") i += 1;
  if (buffer[i] !== "[") return null;
  i += 1;
  while (i < buffer.length && /\s/.test(buffer[i])) i += 1;
  if (buffer[i] !== "{") return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let k = i; k < buffer.length; k += 1) {
    const c = buffer[k];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "{" || c === "[") depth += 1;
    else if (c === "}" || c === "]") {
      depth -= 1;
      if (depth === 0) {
        try {
          const chapter = JSON.parse(buffer.slice(i, k + 1)) as Chapter;
          if (chapter && typeof chapter.title === "string" && Array.isArray(chapter.paras) && chapter.paras.length) return chapter;
        } catch {
          return null;
        }
        return null;
      }
    }
  }
  return null;
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
  const [state, setState] = useState<{ chapters: Chapter[] | null; firstChapter: Chapter | null; loading: boolean; error: boolean }>({
    chapters: null,
    firstChapter: null,
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
      setState({ chapters: null, firstChapter: null, loading: false, error: false });
      return;
    }
    const cached = chapterCache.get(id);
    if (cached?.length) {
      setState({ chapters: cached, firstChapter: null, loading: false, error: false });
      return;
    }
    if (!hasFullText) {
      const chapters = builtinRef.current ?? [];
      setState({ chapters, firstChapter: null, loading: false, error: chapters.length === 0 });
      return;
    }
    const ctrl = new AbortController();
    setState({ chapters: null, firstChapter: null, loading: true, error: false });
    timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT);
    fetch(`/books/text/${id}.json`, { signal: ctrl.signal, cache: "force-cache" })
      .then(async (r) => {
        if (!r.ok) return null;
        if (!r.body) return r.json();
        const reader = r.body.getReader();
        const decoder = new TextDecoder();
        let raw = "";
        let announced = false;
        while (true) {
          const { done, value } = await reader.read();
          if (value) raw += decoder.decode(value, { stream: !done });
          if (!announced) {
            const first = sliceFirstChapter(raw);
            if (first && alive) {
              announced = true;
              setState((prev) => (prev.firstChapter ? prev : { ...prev, firstChapter: first }));
            }
          }
          if (done) break;
        }
        raw += decoder.decode();
        return raw ? JSON.parse(raw) : null;
      })
      .then((d) => {
        if (!alive) return;
        const chapters: Chapter[] = d?.chapters?.length ? (d.chapters as Chapter[]) : (builtinRef.current ?? []);
        if (chapters.length && d?.chapters?.length) remember(id, chapters);
        setState({ chapters, firstChapter: null, loading: false, error: chapters.length === 0 });
      })
      .catch(() => {
        if (!alive) return;
        /* 网络失败/超时：先用内置预览章节保证有内容可读，再由界面提供重试 */
        const chapters = builtinRef.current ?? [];
        setState({ chapters, firstChapter: null, loading: false, error: chapters.length === 0 });
      })
      .finally(() => clearTimeout(timer));
    return () => {
      alive = false;
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [id, format, hasFullText, attempt]);

  return { chapters: state.chapters ?? [], firstChapter: state.firstChapter, loading: state.loading, error: state.error, retry };
}
