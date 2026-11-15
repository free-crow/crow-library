"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import BookCard from "@/components/BookCard";
import Cover from "@/components/Cover";
import { useApp } from "@/components/StoreProvider";
import { useBooks } from "@/components/useBooks";
import { useI18n } from "@/components/useI18n";
import { CATEGORIES } from "@/lib/data";
import { isPublic } from "@/lib/copyright";

/** 首页每个板块（推荐/最近上架/各分类书架）最多展示几本书 */
const SHELF_SIZE = 5;

export default function HomePage() {
  const router = useRouter();
  const { history, progress, ready } = useApp();
  const { t, cat: catName } = useI18n();
  const [q, setQ] = useState("");
  const allBooks = useBooks();
  const books = allBooks.filter(isPublic);
  const hot = [...books].sort((a, b) => b.heat - a.heat);
  const recent = [...books].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const last = ready && history[0] ? books.find((b) => b.id === history[0].bookId) : undefined;
  const lastProg = last ? progress[last.id] : undefined;

  // 按一级分类归类：子分类（如 lit-classic-novel）归入其一级分类（lit）；没有书的分类不显示
  const shelves = CATEGORIES.map((c) => ({
    cat: c,
    items: hot.filter((b) => b.categoryId === c.id || b.categoryId.startsWith(`${c.id}-`)),
  })).filter((s) => s.items.length > 0);

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-br from-accent to-purple-500 p-6 text-white md:p-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold md:text-2xl">{t("home.title")}</h1>
          <p className="mt-1 text-sm opacity-90">{t("home.subtitle")}</p>
          <input
            className="mt-4 w-full max-w-sm rounded-full px-4 py-2.5 text-sm text-neutral-900 outline-none"
            placeholder={t("home.search")} value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && q.trim()) router.push(`/library?q=${encodeURIComponent(q.trim())}`); }}
          />
        </div>
        {/* 紫色区域右侧（手机端为下方）的乌鸦吉祥物 */}
        <img src="/images/crow.jpg" alt={t("brand.mascot")}
          className="mx-auto h-28 w-28 rounded-2xl object-cover shadow-lg ring-2 ring-white/40 md:mx-0 md:h-36 md:w-36" />
      </section>

      {last && lastProg && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">{t("home.continue")}</h2>
          <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
            <Cover book={last} small />
            <div className="min-w-0">
              <div className="truncate font-medium">{last.title}</div>
              <div className="text-sm text-neutral-500">{t("home.readTo", { chapter: lastProg.chapterTitle, percent: lastProg.percent })}</div>
            </div>
            <div className="flex-1" />
            <button className="rounded-lg bg-accent px-4 py-2 text-sm text-white" onClick={() => router.push(`/read/${last.id}`)}>{t("home.continueBtn")}</button>
          </div>
        </section>
      )}

      {/* 顺序：继续阅读 → 分类导航 → 最近上架 → 推荐书籍 → 各分类书架 */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">{t("home.catNav")}</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c.id} className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm hover:border-accent hover:text-accent dark:border-neutral-600"
              onClick={() => router.push(`/library?cat=${c.id}`)}>{catName(c.id)}</button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">{t("home.recent")}</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">{recent.slice(0, SHELF_SIZE).map((b) => <BookCard key={b.id} book={b} />)}</div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">{t("home.recommended")}</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">{hot.slice(0, SHELF_SIZE).map((b) => <BookCard key={b.id} book={b} />)}</div>
      </section>

      {/* 分类书架：每个一级分类放 5 本该类的书（按热度），点「查看更多」进入图书馆对应分类 */}
      {shelves.map(({ cat, items }) => (
        <section key={cat.id}>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">
              {catName(cat.id)}
              <span className="ml-2 text-sm font-normal text-neutral-500">{t("home.count", { n: items.length })}</span>
            </h2>
            <button className="text-sm text-accent hover:underline" onClick={() => router.push(`/library?cat=${cat.id}`)}>{t("home.more")}</button>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {items.slice(0, SHELF_SIZE).map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        </section>
      ))}

      <section className="flex flex-wrap items-center gap-4 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-700">
        <div className="min-w-0 flex-1">{t("home.aiHint")}</div>
        <button className="rounded-lg bg-accent px-4 py-2 text-sm text-white" onClick={() => router.push("/ai")}>{t("home.aiEnter")}</button>
      </section>
    </div>
  );
}
