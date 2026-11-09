"use client";

import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/Icon";
import { useApp, useAuth } from "@/components/StoreProvider";

interface Source {
  bookId: string; title: string; author: string;
  chapterIndex: number; chapterTitle: string; excerpt: string; score: number;
}

export default function AskPage() {
  const { user, aiUsage, setAiUsage } = useApp();
  const { openAuth } = useAuth();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ answer: string; sources: Source[]; mode: string; question: string } | null>(null);
  const [error, setError] = useState("");

  const ask = async () => {
    if (q.trim().length < 2) { setError("请输入至少 2 个字的问题"); return; }
    if (!user) { openAuth(); return; }
    if (aiUsage.used >= aiUsage.quota) { setError("AI 使用额度已用完"); return; }
    setError(""); setBusy(true);
    try {
      const resp = await fetch("/api/ask", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q.trim() }),
      });
      const data = await resp.json();
      if (data.error) { setError(data.error); return; }
      setResult({ ...data, question: q.trim() });
      setAiUsage({ ...aiUsage, used: aiUsage.used + 1 });
    } catch {
      setError("请求失败，请稍后重试");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">智能问答</h1>
      <p className="mb-5 mt-1 text-sm text-neutral-500">
        用自然语言提问，先从书库检索相关段落，再由 AI 结合原文回答（仅检索“审核通过”的书籍，回答标注出处）
      </p>

      <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
        <textarea
          className="min-h-[90px] w-full resize-y rounded-lg border border-neutral-300 bg-neutral-50 p-3 text-sm outline-none dark:border-neutral-600 dark:bg-neutral-800"
          placeholder="例如：孔子怎么看待学习和思考的关系？"
          value={q} onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) ask(); }}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button disabled={busy} className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm text-white disabled:opacity-50" onClick={ask}>
            <Icon name="search" size={15} /> {busy ? "检索中…" : "提问"}
          </button>
          <span className="text-xs text-neutral-400">今日额度 {aiUsage.used}/{aiUsage.quota} · Ctrl/⌘+Enter 提交</span>
          <div className="flex flex-1" />
          <span className="text-xs text-neutral-400">示例：
            <button className="ml-1 underline" onClick={() => setQ("上善若水是什么意思")}>上善若水</button>
            <button className="ml-1 underline" onClick={() => setQ("孙子怎么讲不战而胜")}>不战而胜</button>
          </span>
        </div>
        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      </div>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
            <div className="mb-2 flex items-center gap-2 text-xs text-neutral-500">
              <Icon name="sparkles" size={14} />
              <span>{result.mode === "live" ? "AI 实时回答" : "本地检索回答（未配置 AI 密钥）"}</span>
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{result.answer}</div>
            <div className="mt-3 text-xs text-neutral-400">回答仅做摘要与短引用，不提供整章原文。</div>
          </div>

          {result.sources.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-semibold text-neutral-500">检索来源</h2>
              <div className="space-y-2">
                {result.sources.map((s) => (
                  <Link key={s.bookId + s.chapterIndex} href={`/read/${s.bookId}?ch=${s.chapterIndex}`}
                    className="block rounded-xl border border-neutral-200 p-3 transition-colors hover:border-accent dark:border-neutral-700">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Icon name="book" size={15} className="text-neutral-400" />
                      <span className="font-medium">{s.title}</span>
                      <span className="text-neutral-400">「{s.chapterTitle}」</span>
                      <span className="text-xs text-neutral-400">{s.author}</span>
                      {s.score > 0 && <span className="ml-auto text-xs text-accent">相关度 {s.score}</span>}
                    </div>
                    <div className="mt-1.5 line-clamp-2 text-sm text-neutral-500">{s.excerpt}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 rounded-xl border border-neutral-200 p-4 text-sm text-neutral-500 dark:border-neutral-700">
        <div className="mb-1 flex items-center gap-1.5 font-medium text-neutral-600 dark:text-neutral-300"><Icon name="shield" size={15} /> 版权边界</div>
        只检索审核通过的书籍；回答以摘要、解释和不超过 90 字的短引用为主；不提供整章或整本逐字输出。
      </div>
    </div>
  );
}
