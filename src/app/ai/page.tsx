"use client";

import Link from "next/link";
import Cover from "@/components/Cover";
import { useApp } from "@/components/StoreProvider";
import { useBooks } from "@/components/useBooks";
import { isPublic } from "@/lib/copyright";

export default function AiPage() {
  const { aiUsage, setAiUsage } = useApp();
  const allBooks = useBooks();
  const aiBooks = allBooks.filter((b) => isPublic(b) && b.aiAllowed);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI 阅读室</h1>
        <p className="mt-1 text-sm text-neutral-500">AI 阅读助手 · 书籍问答 · 章节总结 · 段落解释 · 段落翻译 · 学习计划（仅对已授权 AI 的书籍开放）</p>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
        <div className="text-sm">今日额度：{aiUsage.used} / {aiUsage.quota} 次（额度控制，记录调用量并控制 API 成本）</div>
        <div className="flex-1" />
        <button className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-600"
          onClick={() => setAiUsage({ ...aiUsage, used: 0 })}>重置额度</button>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">可提问的书籍（已授权 AI 处理）</h2>
        <div className="space-y-2">
          {aiBooks.map((b) => (
            <div key={b.id} className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-700">
              <Cover book={b} small />
              <div className="min-w-0"><div className="truncate font-medium">{b.title}</div><div className="text-sm text-neutral-500">{b.author}</div></div>
              <div className="flex-1" />
              <Link href={`/read/${b.id}`} className="rounded-lg bg-accent px-4 py-2 text-sm text-white">开始阅读并使用 AI</Link>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">功能说明（版权边界）</h2>
        <ul className="list-disc space-y-1.5 rounded-xl border border-neutral-200 p-5 pl-9 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
          <li>只对授权明确允许 AI 处理的书籍建立索引或发送给模型；</li>
          <li>AI 回答以摘要、解释和必要的短引用为主，不提供整章或整本逐字输出；</li>
          <li>用户反复要求全文输出时应拒绝并转为摘要或解释；</li>
          <li>记录调用量并控制 API 成本。</li>
        </ul>
      </section>
    </div>
  );
}
