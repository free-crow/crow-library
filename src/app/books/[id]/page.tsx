"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Cover from "@/components/Cover";
import Icon from "@/components/Icon";
import { useApp, useAuth } from "@/components/StoreProvider";
import { useAllBooks } from "@/components/useBooks";
import { useBookChapters } from "@/components/useBookChapters";
import { categoryName } from "@/lib/data";
import { isPublic, STATUS_TEXT } from "@/lib/copyright";

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, favorites, setFavorites, shelf, setShelf, progress, ready } = useApp();
  const { openAuth } = useAuth();
  const allBooks = useAllBooks();
  const book = allBooks.find((b) => b.id === id);
  const chapters = useBookChapters(book);

  if (!ready) return <div className="py-16 text-center text-neutral-500">加载中…</div>;
  if (!book || !isPublic(book)) {
    return <div className="py-16 text-center text-neutral-500">该书籍尚未通过版权审核，暂不公开。</div>;
  }

  const c = book.copyright;
  const st = STATUS_TEXT[c.status];
  const fav = favorites.includes(book.id);
  const inShelf = shelf.includes(book.id);
  const prog = progress[book.id];

  const toggle = (list: string[], set: (v: string[]) => void) =>
    user ? set(list.includes(book.id) ? list.filter((x) => x !== book.id) : [...list, book.id]) : openAuth();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-6">
        <div className="w-36 shrink-0 md:w-44"><Cover book={book} /></div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold md:text-2xl">
            {book.title} <span className={`ml-2 rounded-md px-2 py-0.5 text-xs font-medium ${st.cls}`}>{st.label}</span>
          </h1>
          <div className="mt-1 text-sm text-neutral-500">{book.author} · {categoryName(book.categoryId)} · {book.format}</div>
          <p className="mt-3 max-w-2xl">{book.intro}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {book.tags.map((t) => <span key={t} className="rounded-full border border-neutral-300 px-2.5 py-0.5 text-xs text-neutral-500 dark:border-neutral-600">{t}</span>)}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`/read/${book.id}`} className="rounded-lg bg-accent px-5 py-2.5 text-sm text-white">{prog ? "继续阅读" : "开始阅读"}</Link>
            <button className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm dark:border-neutral-600" onClick={() => toggle(favorites, setFavorites)}>{fav ? "★ 已收藏" : "☆ 收藏"}</button>
            <button className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm dark:border-neutral-600" onClick={() => toggle(shelf, setShelf)}>{inShelf ? "已在书架" : "加入书架"}</button>
          </div>
          {book.aiAllowed && <div className="mt-3 flex items-center gap-1.5 text-sm text-neutral-500"><Icon name="sparkles" size={15} /> 本书已授权 AI 处理，可在阅读中使用 AI 助手</div>}
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">版权与来源信息</h2>
        <dl className="grid gap-x-8 gap-y-2 rounded-xl border border-neutral-200 p-4 text-sm dark:border-neutral-700 md:grid-cols-[110px_1fr]">
          <dt className="text-neutral-500">版权状态</dt><dd>{st.label}（{c.basis}）</dd>
          <dt className="text-neutral-500">权利人</dt><dd>{c.rightsHolder}</dd>
          <dt className="text-neutral-500">许可</dt><dd>{c.licenseName}{c.licenseUrl ? `（${c.licenseUrl}）` : ""}</dd>
          <dt className="text-neutral-500">许可范围</dt><dd>{c.permissionScope}</dd>
          {c.territory && <><dt className="text-neutral-500">地域</dt><dd>{c.territory}</dd></>}
          {c.validUntil && <><dt className="text-neutral-500">期限</dt><dd>{c.validUntil}</dd></>}
          <dt className="text-neutral-500">署名要求</dt><dd>{c.attributionText}</dd>
          <dt className="text-neutral-500">来源</dt><dd>{c.sourceUrl}{c.sourceDate ? ` · 获取于 ${c.sourceDate}` : ""}</dd>
          <dt className="text-neutral-500">审核</dt><dd>{c.reviewedBy} · {c.reviewedAt}</dd>
        </dl>
      </section>

      <section>
        {chapters.length ? (
          <>
            <h2 className="mb-3 text-lg font-semibold">目录（{chapters.length} 章）</h2>
            <div className="max-h-96 divide-y divide-neutral-200 overflow-y-auto rounded-xl border border-neutral-200 dark:divide-neutral-700 dark:border-neutral-700">
              {chapters.map((ch, i) => (
                <button key={i} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  onClick={() => router.push(`/read/${book.id}?ch=${i}`)}>
                  <Icon name="book" size={16} className="shrink-0 text-neutral-400" /> {ch.title}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="mb-3 text-lg font-semibold">阅读方式</h2>
            <div className="rounded-xl border border-neutral-200 p-4 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
              本书为 {book.format} 格式，点击“开始阅读”进入在线阅读器（{book.format === "EPUB" ? "EPUB.js" : "PDF.js"}）。
            </div>
          </>
        )}
      </section>
    </div>
  );
}
