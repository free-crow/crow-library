"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import EpubReader from "@/components/EpubReader";
import Icon from "@/components/Icon";
import PdfReader from "@/components/PdfReader";
import { useApp, useAuth } from "@/components/StoreProvider";
import { useBookChapters } from "@/components/useBookChapters";
import { useAllBooks } from "@/components/useBooks";
import { isPublic } from "@/lib/copyright";
import type { Book } from "@/lib/types";

const AI_ACTIONS = ["解释这段文字", "总结这一章节", "翻译这段内容", "深入理解这个概念", "向 AI 提问"] as const;

function ReaderInner() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const allBooks = useAllBooks();
  const book = allBooks.find((b) => b.id === id);
  const chapters = useBookChapters(book);
  const { user, progress, setProgress, history, setHistory, shelf, setShelf, reader, setReader, aiUsage, setAiUsage, ready } = useApp();
  const { openAuth } = useAuth();
  const [chIdx, setChIdx] = useState<number | null>(null);
  const [pop, setPop] = useState<{ x: number; y: number; text: string } | null>(null);
  const [aiReply, setAiReply] = useState<{ action: string; text: string; reply: string } | null>(null);
  const [fileLabel, setFileLabel] = useState("");

  const isTxt = book?.format === "TXT";

  useEffect(() => {
    if (!ready || !book || !isTxt || !chapters.length) return;
    const fromUrl = search.get("ch");
    const init = fromUrl !== null ? Number(fromUrl) : progress[book.id]?.chapterIndex ?? 0;
    setChIdx(Math.max(0, Math.min(init, chapters.length - 1)));
  }, [ready, book, search, progress, isTxt, chapters.length]);

  /* 阅读记忆：TXT 按章节保存 */
  useEffect(() => {
    if (!book || !isTxt || chIdx === null || !chapters.length) return;
    const percent = Math.round(((chIdx + 1) / chapters.length) * 100);
    setProgress({ ...progress, [book.id]: { bookId: book.id, chapterIndex: chIdx, chapterTitle: chapters[chIdx].title, percent, updatedAt: Date.now() } });
    setHistory([{ bookId: book.id, chapterIndex: chIdx, percent, time: Date.now() }, ...history.filter((h) => h.bookId !== book.id)].slice(0, 50));
    if (!shelf.includes(book.id)) setShelf([...shelf, book.id]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chIdx]);

  function saveFileProgress(b: Book, pct: number, label: string) {
    setProgress({ ...progress, [b.id]: { bookId: b.id, chapterIndex: 0, chapterTitle: label, percent: pct, updatedAt: Date.now() } });
    setHistory([{ bookId: b.id, chapterIndex: 0, percent: pct, time: Date.now() }, ...history.filter((h) => h.bookId !== b.id)].slice(0, 50));
    if (!shelf.includes(b.id)) setShelf([...shelf, b.id]);
  }

  if (!ready) return <div className="py-16 text-center text-neutral-500">加载中…</div>;
  if (!book || !isPublic(book)) return <div className="py-16 text-center text-neutral-500">该书籍不可读（未通过版权审核）。</div>;

  const runAI = async (action: string, text: string, chapterTitle: string) => {
    setPop(null);
    if (!user) { openAuth(); return; }
    if (aiUsage.used >= aiUsage.quota) { alert("AI 使用额度已用完"); return; }
    setAiUsage({ ...aiUsage, used: aiUsage.used + 1 });
    setAiReply({ action, text, reply: "AI 思考中…" });
    try {
      const resp = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, bookTitle: book.title, chapterTitle, text }),
      });
      const data = await resp.json();
      /* 版权边界：回答以摘要/解释/短引用为主，不提供整章逐字输出 */
      setAiReply({ action, text, reply: data.reply ?? data.error ?? "AI 暂时不可用" });
    } catch {
      setAiReply({ action, text, reply: "AI 服务连接失败，请稍后重试。" });
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
      <button className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-sm dark:border-neutral-600" aria-label="减小字号"
        onClick={() => setReader({ ...reader, size: Math.max(12, reader.size - 1) })}><Icon name="minus" size={15} /></button>
      <button className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-sm dark:border-neutral-600" aria-label="增大字号"
        onClick={() => setReader({ ...reader, size: Math.min(28, reader.size + 1) })}><Icon name="plus" size={15} /></button>
      <select className="rounded-lg border border-neutral-300 bg-transparent px-2 py-1.5 text-sm dark:border-neutral-600"
        value={reader.bg} onChange={(e) => setReader({ ...reader, bg: e.target.value as typeof reader.bg })}>
        <option value="paper">白纸</option><option value="eye">护眼绿</option><option value="night">夜间</option>
      </select>
    </div>
  );

  const aiPanel = (
    <>
      {aiReply && (
        <div className="mt-5 whitespace-pre-wrap rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm dark:border-neutral-700 dark:bg-neutral-800">
          <b>{aiReply.action}</b>（选段：{aiReply.text.length > 80 ? aiReply.text.slice(0, 80) + "…" : aiReply.text}）
          <br /><br />{aiReply.reply}
          <br /><br /><span className="text-neutral-500">仅做摘要/解释/短引用，不提供整章逐字输出。额度 {aiUsage.used}/{aiUsage.quota}</span>
        </div>
      )}
      {pop && (
        <div className="fixed z-50 flex gap-1 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl dark:border-neutral-600 dark:bg-neutral-800"
          style={{ left: pop.x, top: pop.y }}>
          {AI_ACTIONS.map((a) => (
            <button key={a} className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-700"
              onClick={() => runAI(a, pop.text, fileLabel || (isTxt && chIdx !== null ? chapters[chIdx]?.title ?? "" : ""))}>{a}</button>
          ))}
        </div>
      )}
    </>
  );

  /* ===== EPUB / PDF ===== */
  if (!isTxt) {
    if (!book.fileUrl) return <div className="py-16 text-center text-neutral-500">文件缺失</div>;
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
  if (chIdx === null || !chapters.length) return <div className="py-16 text-center text-neutral-500">加载中…</div>;
  const chap = chapters[chIdx];
  const percent = Math.round(((chIdx + 1) / chapters.length) * 100);

  return (
    <div className="mx-auto max-w-3xl">
      {toolbar}
      <select className="mb-4 rounded-lg border border-neutral-300 bg-transparent px-2 py-1.5 text-sm dark:border-neutral-600"
        value={chIdx} onChange={(e) => setChIdx(Number(e.target.value))}>
        {chapters.map((c, i) => <option key={i} value={i}>{c.title}</option>)}
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
          disabled={chIdx === 0} onClick={() => setChIdx(chIdx - 1)}><Icon name="chevron-left" size={15} /> 上一章</button>
        <span className="text-sm text-neutral-500">{chIdx + 1} / {chapters.length} · {percent}%</span>
        <button className="flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-neutral-600"
          disabled={chIdx === chapters.length - 1} onClick={() => setChIdx(chIdx + 1)}>下一章 <Icon name="chevron-right" size={15} /></button>
      </div>
      {aiPanel}
    </div>
  );
}

export default function ReaderPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-neutral-500">加载中…</div>}>
      <ReaderInner />
    </Suspense>
  );
}
