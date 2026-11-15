"use client";

import { useMemo } from "react";
import { useApp } from "@/components/StoreProvider";
import { BOOKS } from "@/lib/data";
import { mergeBooks } from "@/lib/overrides";
import { localizeBook } from "@/lib/i18n";
import type { Book } from "@/lib/types";

/** 合并管理员调整后的书籍列表（所有状态），并按当前界面语言翻译书名/作者 */
export function useAllBooks(): Book[] {
  const { bookOverrides, lang } = useApp();
  return useMemo(
    () => mergeBooks(BOOKS, bookOverrides).map((b) => localizeBook(b, lang)),
    [bookOverrides, lang]
  );
}

/** 合并管理员调整后的书籍列表（仅公开） */
export function useBooks(): Book[] {
  return useAllBooks().filter((b) => b.copyright.status === "approved");
}
