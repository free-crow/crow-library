"use client";

import Link from "next/link";
import Cover from "@/components/Cover";
import LoginGate from "@/components/LoginGate";
import { useApp } from "@/components/StoreProvider";
import { useAllBooks } from "@/components/useBooks";
import { useI18n } from "@/components/useI18n";
import { isPublic } from "@/lib/copyright";
import { htmlLangOf } from "@/lib/i18n";

export default function HistoryPage() {
  const { history } = useApp();
  const { t, lang } = useI18n();
  const allBooks = useAllBooks();
  const items = history
    .map((h) => ({ ...h, book: allBooks.find((b) => b.id === h.bookId) }))
    .filter((h) => h.book && isPublic(h.book));

  return (
    <LoginGate>
      <h1 className="text-2xl font-bold">{t("hist.title")}</h1>
      <p className="mb-5 mt-1 text-sm text-neutral-500">{t("hist.subtitle")}</p>
      {items.length ? (
        <div className="space-y-2">
          {items.map((h) => (
            <div key={h.bookId} className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-700">
              <Cover book={h.book!} small />
              <div className="min-w-0">
                <div className="truncate font-medium">{h.book!.title}</div>
                <div className="text-sm text-neutral-500">
                  {new Date(h.time).toLocaleString(htmlLangOf(lang), { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  {" · "}{t("hist.readTo", { chapter: h.book!.chapters[h.chapterIndex]?.title ?? "", percent: h.percent })}
                </div>
              </div>
              <div className="flex-1" />
              <Link href={`/read/${h.bookId}`} className="rounded-lg bg-accent px-4 py-2 text-sm text-white">{t("home.continueBtn")}</Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-14 text-center text-neutral-500">{t("hist.empty")}</div>
      )}
    </LoginGate>
  );
}
