"use client";

import { useEffect, useState } from "react";
import type { Book, Chapter } from "@/lib/types";

/** 优先加载 public/books/text/<id>.json 的公版全文，未提供时回退到 data.ts 内置章节 */
export function useBookChapters(book?: Book | null): Chapter[] {
  const [chapters, setChapters] = useState<Chapter[] | null>(null);

  useEffect(() => {
    let alive = true;
    if (!book || book.format !== "TXT") {
      setChapters(null);
      return;
    }
    setChapters(null);
    if (!book.hasFullText) {
      setChapters(book.chapters);
      return;
    }
    fetch(`/books/text/${book.id}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive) return;
        setChapters(d?.chapters?.length ? (d.chapters as Chapter[]) : book.chapters);
      })
      .catch(() => {
        if (alive) setChapters(book.chapters);
      });
    return () => {
      alive = false;
    };
  }, [book]);

  return chapters ?? (book?.chapters ?? []);
}
