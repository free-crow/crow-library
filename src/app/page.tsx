"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import BookCard from "@/components/BookCard";
import Cover from "@/components/Cover";
import { useApp } from "@/components/StoreProvider";
import { useBooks } from "@/components/useBooks";
import { CATEGORIES } from "@/lib/data";
import { isPublic } from "@/lib/copyright";

export default function HomePage() {
  const router = useRouter();
  const { history, progress, ready } = useApp();
  const [q, setQ] = useState("");
  const allBooks = useBooks();
  const books = allBooks.filter(isPublic);
  const hot = [...books].sort((a, b) => b.heat - a.heat);
  const recent = [...books].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const last = ready && history[0] ? books.find((b) => b.id === history[0].bookId) : undefined;
  const lastProg = last ? progress[last.id] : undefined;

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-br from-accent to-purple-500 p-6 text-white md:p-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold md:text-2xl">让阅读更自由，让知识更容易被理解。</h1>
          <p className="mt-1 text-sm opacity-90">免费、开放的数字图书馆 · 所有书籍均通过版权审核</p>
          <input
            className="mt-4 w-full max-w-sm rounded-full px-4 py-2.5 text-sm text-neutral-900 outline-none"
            placeholder="搜索书名或作者…" value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && q.trim()) router.push(`/library?q=${encodeURIComponent(q.trim())}`); }}
          />
        </div>
        {/* 紫色区域右侧（手机端为下方）的乌鸦吉祥物 */}
        <img src="/images/crow.jpg" alt="乌鸦吉祥物"
          className="mx-auto h-28 w-28 rounded-2xl object-cover shadow-lg ring-2 ring-white/40 md:mx-0 md:h-36 md:w-36" />
      </section>

      {last && lastProg && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">继续阅读</h2>
          <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
            <Cover book={last} small />
            <div className="min-w-0">
              <div className="truncate font-medium">{last.title}</div>
              <div className="text-sm text-neutral-500">读至 {lastProg.chapterTitle} · {lastProg.percent}%</div>
            </div>
            <div className="flex-1" />
            <button className="rounded-lg bg-accent px-4 py-2 text-sm text-white" onClick={() => router.push(`/read/${last.id}`)}>继续阅读</button>
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">推荐书籍</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">{hot.map((b) => <BookCard key={b.id} book={b} />)}</div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">最近上架</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">{recent.map((b) => <BookCard key={b.id} book={b} />)}</div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">分类导航</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c.id} className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm hover:border-accent hover:text-accent dark:border-neutral-600"
              onClick={() => router.push(`/library?cat=${c.id}`)}>{c.name}</button>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-4 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-700">
        <div className="min-w-0 flex-1">选中文字即可解释、总结、翻译；AI 功能仅对授权允许 AI 处理的书籍开放。</div>
        <button className="rounded-lg bg-accent px-4 py-2 text-sm text-white" onClick={() => router.push("/ai")}>进入 AI 阅读室</button>
      </section>
    </div>
  );
}
