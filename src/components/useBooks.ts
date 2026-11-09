"use client";

import { useMemo } from "react";
import { useApp } from "@/components/StoreProvider";
import { BOOKS } from "@/lib/data";
import { mergeBooks } from "@/lib/overrides";
import type { Book } from "@/lib/types";

/** 合并管理员调整后的书籍列表（所有状态） */
export function useAllBooks(): Book[] {
  const { bookOverrides } = useApp();
  return useMemo(() => mergeBooks(BOOKS, bookOverrides), [bookOverrides]);
}

/** 合并管理员调整后的书籍列表（仅公开） */
export function useBooks(): Book[] {
  return useAllBooks().filter((b) => b.copyright.status === "approved");
}
