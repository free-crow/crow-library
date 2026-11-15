"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import BookCard from "@/components/BookCard";
import { useBooks } from "@/components/useBooks";
import { useI18n } from "@/components/useI18n";
import { CATEGORIES } from "@/lib/data";
import { isPublic } from "@/lib/copyright";

function LibraryInner() {
  const params = useSearchParams();
  const { t, cat: catName } = useI18n();
  const allBooks = useBooks();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [cat, setCat] = useState(params.get("cat") ?? "");
  const [sort, setSort] = useState<"updated" | "heat">("updated");

  const result = useMemo(() => {
    let r = allBooks.filter(isPublic);
    const kw = q.trim().toLowerCase();
    if (kw) r = r.filter((b) => b.title.toLowerCase().includes(kw) || b.author.toLowerCase().includes(kw));
    if (cat) r = r.filter((b) => b.categoryId === cat || b.categoryId.startsWith(cat));
    return [...r].sort((a, b) => (sort === "heat" ? b.heat - a.heat : b.updatedAt.localeCompare(a.updatedAt)));
  }, [allBooks, q, cat, sort]);

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("lib.title")}</h1>
      <p className="mb-5 mt-1 text-sm text-neutral-500">{t("lib.subtitle")}</p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input className="w-72 max-w-full rounded-full border border-neutral-300 bg-neutral-100 px-4 py-2 text-sm outline-none dark:border-neutral-600 dark:bg-neutral-800"
          placeholder={t("lib.search")} value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-600"
          value={sort} onChange={(e) => setSort(e.target.value as "updated" | "heat")}>
          <option value="updated">{t("lib.sortUpdated")}</option>
          <option value="heat">{t("lib.sortHeat")}</option>
        </select>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <button className={`rounded-full border px-4 py-1.5 text-sm ${!cat ? "border-accent bg-accent text-white" : "border-neutral-300 dark:border-neutral-600"}`} onClick={() => setCat("")}>{t("lib.all")}</button>
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)}
            className={`rounded-full border px-4 py-1.5 text-sm ${cat === c.id ? "border-accent bg-accent text-white" : "border-neutral-300 dark:border-neutral-600"}`}>{catName(c.id)}</button>
        ))}
      </div>

      {result.length ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">{result.map((b) => <BookCard key={b.id} book={b} />)}</div>
      ) : (
        <div className="py-16 text-center text-neutral-500">{t("lib.empty")}</div>
      )}
    </div>
  );
}

export default function LibraryPage() {
  const { t } = useI18n();
  return (
    <Suspense fallback={<div className="py-16 text-center text-neutral-500">{t("common.loading")}</div>}>
      <LibraryInner />
    </Suspense>
  );
}
