"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useBookToc } from "@/components/useBookChapters";
import Cover from "@/components/Cover";
import Icon from "@/components/Icon";
import { useApp, useAuth } from "@/components/StoreProvider";
import { useAllBooks } from "@/components/useBooks";
import { useI18n } from "@/components/useI18n";
import { isPublic, STATUS_TEXT } from "@/lib/copyright";

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, favorites, setFavorites, shelf, setShelf, progress, ready } = useApp();
  const { openAuth } = useAuth();
  const { t, cat: catName } = useI18n();
  const allBooks = useAllBooks();
  
  const book = allBooks.find((b) => b.id === id);
  const { titles, loading: tocLoading, error: tocError, retry: retryToc } = useBookToc(book);

  useEffect(() => {
    if (book?.id) router.prefetch(`/read/${book.id}`);
  }, [book?.id, router]);

  if (!ready) return <div className="py-16 text-center text-neutral-500">{t("common.loading")}</div>;
  if (!book || !isPublic(book)) {
    return <div className="py-16 text-center text-neutral-500">{t("book.notPublic")}</div>;
  }

  const c = book.copyright;
  const st = STATUS_TEXT[c.status];
  const stLabel = t(`status.${c.status}`);
  const fav = favorites.includes(book.id);
  const inShelf = shelf.includes(book.id);
  const prog = progress[book.id];
  const chapterTitles = titles ?? [];

  const toggle = (list: string[], set: (v: string[]) => void) =>
    user ? set(list.includes(book.id) ? list.filter((x) => x !== book.id) : [...list, book.id]) : openAuth();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-6">
        <div className="w-36 shrink-0 md:w-44"><Cover book={book} /></div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold md:text-2xl">
            {book.title} <span className={`ml-2 rounded-md px-2 py-0.5 text-xs font-medium ${st.cls}`}>{stLabel}</span>
          </h1>
          <div className="mt-1 text-sm text-neutral-500">{book.author} · {catName(book.categoryId)} · {book.format}</div>
          <p className="mt-3 max-w-2xl">{book.intro}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {book.tags.map((tag) => <span key={tag} className="rounded-full border border-neutral-300 px-2.5 py-0.5 text-xs text-neutral-500 dark:border-neutral-600">{tag}</span>)}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`/read/${book.id}`} className="rounded-lg bg-accent px-5 py-2.5 text-sm text-white">{prog ? t("book.continue") : t("book.start")}</Link>
            <button className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm dark:border-neutral-600" onClick={() => toggle(favorites, setFavorites)}>{fav ? t("book.faved") : t("book.fav")}</button>
            <button className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm dark:border-neutral-600" onClick={() => toggle(shelf, setShelf)}>{inShelf ? t("book.inShelf") : t("book.addShelf")}</button>
          </div>
          {book.aiAllowed && <div className="mt-3 flex items-center gap-1.5 text-sm text-neutral-500"><Icon name="sparkles" size={15} /> {t("book.aiAllowed")}</div>}
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">{t("book.copyrightTitle")}</h2>
        <dl className="grid gap-x-8 gap-y-2 rounded-xl border border-neutral-200 p-4 text-sm dark:border-neutral-700 md:grid-cols-[110px_1fr]">
          <dt className="text-neutral-500">{t("book.status")}</dt><dd>{stLabel}（{c.basis}）</dd>
          <dt className="text-neutral-500">{t("book.holder")}</dt><dd>{c.rightsHolder}</dd>
          <dt className="text-neutral-500">{t("book.license")}</dt><dd>{c.licenseName}{c.licenseUrl ? `（${c.licenseUrl}）` : ""}</dd>
          <dt className="text-neutral-500">{t("book.scope")}</dt><dd>{c.permissionScope}</dd>
          {c.territory && <><dt className="text-neutral-500">{t("book.territory")}</dt><dd>{c.territory}</dd></>}
          {c.validUntil && <><dt className="text-neutral-500">{t("book.valid")}</dt><dd>{c.validUntil}</dd></>}
          <dt className="text-neutral-500">{t("book.attribution")}</dt><dd className="min-w-0 break-words [overflow-wrap:anywhere]">{c.attributionText}</dd>
          <dt className="text-neutral-500">{t("book.source")}</dt><dd className="min-w-0 break-words [overflow-wrap:anywhere]">{c.sourceUrl}{c.sourceDate ? ` · ${t("book.sourceAt", { date: c.sourceDate })}` : ""}</dd>
          <dt className="text-neutral-500">{t("book.review")}</dt><dd>{c.reviewedBy} · {c.reviewedAt}</dd>
        </dl>
      </section>

      <section>
        {tocLoading ? (
          <p role="status" className="text-sm text-neutral-500">{t("common.loading")}</p>
        ) : tocError ? (
          <div role="alert" className="text-sm text-neutral-500">
            {t("read.fileMissing")}
            <button className="ml-3 rounded-lg border px-3 py-1.5" onClick={retryToc}>重试</button>
          </div>
        ) : chapterTitles.length ? (
          <>
            <h2 className="mb-3 text-lg font-semibold">{t("book.toc", { n: chapterTitles.length })}</h2>
            <div className="max-h-96 divide-y divide-neutral-200 overflow-y-auto rounded-xl border border-neutral-200 dark:divide-neutral-700 dark:border-neutral-700">
              {chapterTitles.map((title, i) => (
                <button key={i} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  onClick={() => router.push(`/read/${book.id}?ch=${i}`)}>
                  <Icon name="book" size={16} className="shrink-0 text-neutral-400" /> {title}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="mb-3 text-lg font-semibold">{t("book.readMode")}</h2>
            <div className="rounded-xl border border-neutral-200 p-4 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
              {t("book.readModeText", { format: book.format, reader: book.format === "EPUB" ? "EPUB.js" : "PDF.js" })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
