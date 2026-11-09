"use client";

import Link from "next/link";
import Cover from "@/components/Cover";
import LoginGate from "@/components/LoginGate";
import { useApp } from "@/components/StoreProvider";
import { useAllBooks } from "@/components/useBooks";
import { isPublic } from "@/lib/copyright";

export default function HistoryPage() {
  const { history } = useApp();
  const allBooks = useAllBooks();
  const items = history
    .map((h) => ({ ...h, book: allBooks.find((b) => b.id === h.bookId) }))
    .filter((h) => h.book && isPublic(h.book));

  return (
    <LoginGate>
      <h1 className="text-2xl font-bold">阅读历史</h1>
      <p className="mb-5 mt-1 text-sm text-neutral-500">记录书籍、最近阅读时间、阅读进度和当前章节，支持一键继续阅读</p>
      {items.length ? (
        <div className="space-y-2">
          {items.map((h) => (
            <div key={h.bookId} className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-700">
              <Cover book={h.book!} small />
              <div className="min-w-0">
                <div className="truncate font-medium">{h.book!.title}</div>
                <div className="text-sm text-neutral-500">
                  {new Date(h.time).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  {" · 读至 "}{h.book!.chapters[h.chapterIndex]?.title ?? ""} · {h.percent}%
                </div>
              </div>
              <div className="flex-1" />
              <Link href={`/read/${h.bookId}`} className="rounded-lg bg-accent px-4 py-2 text-sm text-white">继续阅读</Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-14 text-center text-neutral-500">还没有阅读记录，去图书馆逛逛吧</div>
      )}
    </LoginGate>
  );
}
