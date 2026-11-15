"use client";

import BookCard from "@/components/BookCard";
import Icon from "@/components/Icon";
import LoginGate from "@/components/LoginGate";
import { useApp } from "@/components/StoreProvider";
import { useAllBooks } from "@/components/useBooks";
import { useI18n } from "@/components/useI18n";
import { isPublic } from "@/lib/copyright";

export default function ShelfPage() {
  const { shelf } = useApp();
  const { t } = useI18n();
  const allBooks = useAllBooks();
  const books = shelf.map((id) => allBooks.find((b) => b.id === id)).filter((b) => b && isPublic(b));

  return (
    <LoginGate>
      <h1 className="text-2xl font-bold">{t("shelf.title")}</h1>
      <p className="mb-5 mt-1 text-sm text-neutral-500">{t("shelf.subtitle")}</p>
      <h2 className="mb-3 text-lg font-semibold">{t("shelf.reading", { n: books.length })}</h2>
      {books.length ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">{books.map((b) => <BookCard key={b!.id} book={b!} />)}</div>
      ) : (
        <div className="py-14 text-center text-neutral-500">{t("shelf.empty")}</div>
      )}
      <h2 className="mb-3 mt-8 text-lg font-semibold">{t("shelf.lists")}</h2>
      <div className="flex items-center gap-2 rounded-xl border border-neutral-200 p-4 text-sm dark:border-neutral-700"><Icon name="shelf" size={16} className="text-neutral-400" /> {t("shelf.default")} <span className="text-neutral-500">{t("shelf.count", { n: 0 })}</span></div>
    </LoginGate>
  );
}
