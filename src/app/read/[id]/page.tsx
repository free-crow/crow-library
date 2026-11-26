"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Icon from "@/components/Icon";
import { useApp, useAuth } from "@/components/StoreProvider";
import { useBookChapters } from "@/components/useBookChapters";
import { useAllBooks } from "@/components/useBooks";
import { useI18n } from "@/components/useI18n";
import { isPublic } from "@/lib/copyright";
import type { Book } from "@/lib/types";

/* 阅读器按需加载：TXT 书籍不下载 PDF.js / EPUB.js，首屏更轻、打开更快 */
const EpubReader = dynamic(() => import("@/components/EpubReader"), { ssr: false });
const PdfReader = dynamic(() => import("@/components/PdfReader"), { ssr: false });

/* 送给 AI 的指令保持中文（后端按中文识别），界面按钮文字按当前语言显示 */
const AI_ACTIONS = ["ai.act.0", "ai.act.1", "ai.act.2", "ai.act.3", "ai.act.4"] as const;
const ACTION_PROMPTS = ["解释这段文字", "总结这一章节", "翻译这段内容", "深入理解这个概念", "向 AI 提问"] as const;

function ReaderInner() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const { t } = useI18n();
  const allBooks = useAllBooks();
  const book = allBooks.find((b) => b.id === id);
  const { user, progress, setProgress, history, setHistory, shelf, setShelf, reader, setReader, aiUsage, setAiUsage, ready } = useApp();
  const { openAuth } = useAuth();
  const [chIdx, setChIdx] = useState<number | null>(null);
  const [pop, setPop] = useState<{ x: number; y: number; text: string } | null>(null);
  const [aiReply, setAiReply] = useState<{ action: string; text: string; reply: string } | null>(null);
  const [fileLabel, setFileLabel] = useState("");

  const isTxt = book?.format === "TXT";

  const requested = chIdx ?? Number(search.get("ch") ?? progress[id]?.chapterIndex ?? 0);
  const { titles, index: idx, chapter: chap, error: chaptersError, retry: retryChapters } = useBookChapters(book, requested, ready);

  useEffect(() => {
    if (!ready || !book || !isTxt || !chap || !titles?.length) return;
    const percent = Math.round(((idx + 1) / titles.length) * 100);
    setProgress({ ...progress, [book.id]: { bookId: book.id, chapterIndex: idx, chapterTitle: chap.title, percent, updatedAt: Date.now() } });
    setHistory([{ bookId: book.id, chapterIndex: idx, percent, time: Date.now() }, ...history.filter((h) => h.bookId !== book.id)].slice(0, 50));
    if (!shelf.includes(book.id)) setShelf([...shelf, book.id]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, id, idx, chap?.title, titles?.length]);

  function saveFileProgress(b: Book, pct: number, label: string) {
    setProgress({ ...progress, [b.id]: { bookId: b.id, chapterIndex: 0, chapterTitle: label, percent: pct, updatedAt: Date.now() } });
    setHistory([{ bookId: b.id, chapterIndex: 0, percent: pct, time: Date.now() }, ...history.filter((h) => h.bookId !== b.id)].slice(0, 50));
    if (!shelf.includes(b.id)) setShelf([...shelf, b.id]);
  }

  if (!ready) return <div className="py-16 text-center text-neutral-500">{t("common.loading")}</div>;
  if (!book || !isPublic(book)) return <div className="py-16 text-center text-neutral-500">{t("read.noRead")}</div>;

  const runAI = async (action: string, text: string, chapterTitle: string) => {
    setPop(null);
    if (!user) { openAuth(); return; }
    if (aiUsage.used >= aiUsage.quota) { alert(t("read.aiQuota")); return; }
    setAiUsage({ ...aiUsage, used: aiUsage.used + 1 });
    setAiReply({ action, text, reply: t("read.aiThinking") });
    try {
      const resp = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, bookId: book.id, chapterIndex: isTxt ? idx : undefined, text }),
      });
      const data = await resp.json();
      /* 版权边界：回答以摘要/解释/短引用为主，不提供整章逐字输出 */
      setAiReply({ action, text, reply: data.reply ?? data.error ?? t("read.aiNA") });
    } catch {
      setAiReply({ action, text, reply: t("read.aiFail") });
    }
  };

  const onSelect = (chapterTitle: string) => {
    if (!book.aiAllowed) return;
    const sel = window.getSelection();
    const text = sel?.toString().trim() ?? "";
    if (text.length < 2) { setPop(null); return; }
    const rect = sel!.getRangeAt(0).getBoundingClientRect();
    setPop({ x: Math.min(rect.left, window.innerWidth - 340), y: rect.bottom + 8, text });
  };

  const toolbar = (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <Link href={`/books/${book.id}`} className="flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-600">
        <Icon name="chevron-left" size={15} /> {book.title}
      </Link>
      <span className="rounded-md bg-neutral-100 px-2 py-1 text-xs text-neutral-500 dark:bg-neutral-800">{book.format}</span>
      <div className="flex-1" />
      <button className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-sm dark:border-neutral-600" aria-label={t("read.smaller")}
        onClick={() => setReader({ ...reader, size: Math.max(12, reader.size - 1) })}><Icon name="minus" size={15} /></button>
      <button className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-sm dark:border-neutral-600" aria-label={t("read.larger")}
        onClick={() => setReader({ ...reader, size: Math.min(28, reader.size + 1) })}><Icon name="plus" size={15} /></button>
      <select className="rounded-lg border border-neutral-300 bg-transparent px-2 py-1.5 text-sm dark:border-neutral-600"
        value={reader.bg} onChange={(e) => setReader({ ...reader, bg: e.target.value as typeof reader.bg })}>
        <option value="paper">{t("read.bgPaper")}</option><option value="eye">{t("read.bgEye")}</option><option value="night">{t("read.bgNight")}</option>
      </select>
    </div>
  );

  const aiPanel = (
    <>
      {aiReply && (
        <div className="mt-5 whitespace-pre-wrap rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm dark:border-neutral-700 dark:bg-neutral-800">
          <b>{aiReply.action}</b>（{t("read.aiSel")}{aiReply.text.length > 80 ? aiReply.text.slice(0, 80) + "…" : aiReply.text}）
          <br /><br />{aiReply.reply}
          <br /><br /><span className="text-neutral-500">{t("read.aiNote", { used: aiUsage.used, quota: aiUsage.quota })}</span>
        </div>
      )}
      {pop && (
        <div className="fixed z-50 flex gap-1 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl dark:border-neutral-600 dark:bg-neutral-800"
          style={{ left: pop.x, top: pop.y }}>
          {AI_ACTIONS.map((k, i) => (
            <button key={k} className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-700"
              onClick={() => runAI(ACTION_PROMPTS[i], pop.text, fileLabel || (chap?.title ?? ""))}>{t(k)}</button>
          ))}
        </div>
      )}
    </>
  );

  /* ===== EPUB / PDF ===== */
  if (!isTxt) {
    if (!book.fileUrl) return <div className="py-16 text-center text-neutral-500">{t("read.fileMissing")}</div>;
    return (
      <div className="mx-auto max-w-4xl">
        {toolbar}
        {book.format === "EPUB" ? (
          <EpubReader fileUrl={book.fileUrl} title={book.title}
            onProgress={(pct, label) => { setFileLabel(label); if (pct > 0) saveFileProgress(book, pct, label); }} />
        ) : (
          <PdfReader fileUrl={book.fileUrl} title={book.title}
            onProgress={(pct, label) => { setFileLabel(label); if (pct > 0) saveFileProgress(book, pct, label); }} />
        )}
        {aiPanel}
      </div>
    );
  }

  /* ===== TXT ===== */
  if (chaptersError) {
    return (
      <div className="py-16 text-center text-sm text-neutral-500">
        {t("read.fileMissing")}
        <button className="ml-3 rounded-lg border border-neutral-300 px-3 py-1.5 text-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
          onClick={retryChapters}>重试</button>
      </div>
    );
  }
  if (!chap || !titles?.length) return <div className="py-16 text-center text-neutral-500">{t("common.loading")}</div>;
  const percent = Math.round(((idx + 1) / titles.length) * 100);

  return (
    <div className="mx-auto max-w-3xl">
      {toolbar}
      <select className="mb-4 rounded-lg border border-neutral-300 bg-transparent px-2 py-1.5 text-sm dark:border-neutral-600"
        value={idx} onChange={(e) => setChIdx(Number(e.target.value))}>
        {titles.map((title, i) => <option key={i} value={i}>{title}</option>)}
      </select>
      <div onMouseUp={() => onSelect(chap.title)}
        className="reader-content min-h-[55vh] rounded-2xl border border-neutral-200 p-6 dark:border-neutral-700 md:p-9"
        style={{ fontSize: reader.size, fontFamily: reader.font === "serif" ? "Georgia,'Songti SC',serif" : "system-ui,sans-serif" }}>
        <h3 className="mb-5 text-lg font-semibold">{chap.title}</h3>
        {chap.paras.map((p, i) => <p key={i} className="mb-4 indent-[2em]">{p}</p>)}
      </div>
      <div className="mt-4 h-1 overflow-hidden rounded bg-neutral-200 dark:bg-neutral-700">
        <div className="h-full bg-accent" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button className="flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-neutral-600"
          disabled={idx === 0} onClick={() => setChIdx(idx - 1)}><Icon name="chevron-left" size={15} /> {t("read.prev")}</button>
        <span className="text-sm text-neutral-500">{idx + 1} / {titles.length} · {percent}%</span>
        <button className="flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-neutral-600"
          disabled={idx === titles.length - 1} onClick={() => setChIdx(idx + 1)}>{t("read.next")} <Icon name="chevron-right" size={15} /></button>
      </div>
      {aiPanel}
    </div>
  );
}

export default function ReaderPage() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  return (
    <Suspense fallback={<div className="py-16 text-center text-neutral-500">{t("common.loading")}</div>}>
      <ReaderInner key={id} />
    </Suspense>
  );
}
