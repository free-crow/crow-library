"use client";

import { useEffect, useState } from "react";
import AdminGate from "@/components/AdminGate";
import Icon from "@/components/Icon";
import { useApp } from "@/components/StoreProvider";
import { useAllBooks } from "@/components/useBooks";

export default function AdminAi() {
  const { aiUsage, setAiUsage, bookOverrides, setBookOverrides } = useApp();
  const books = useAllBooks();
  const [status, setStatus] = useState<{ ai: string; aiModel: string | null; supabase: string } | null>(null);
  const [quota, setQuota] = useState(aiUsage.quota);

  useEffect(() => {
    fetch("/api/status").then((r) => r.json()).then(setStatus).catch(() => setStatus(null));
  }, []);

  return (
    <AdminGate>
      <h1 className="text-2xl font-bold">AI 管理</h1>
      <p className="mb-4 mt-1 text-sm text-neutral-500">模型状态、书籍 AI 授权、用量与额度</p>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
          <div className="text-xs text-neutral-500">AI 服务</div>
          <div className="mt-1 flex items-center gap-1.5 font-semibold">
            <Icon name="sparkles" size={16} />
            {status?.ai === "live" ? "真实模型已连接" : "演示模式（未配置密钥）"}
          </div>
          <div className="mt-1 text-xs text-neutral-400">{status?.aiModel ?? "在 .env.local 填入 AI_API_KEY / AI_API_BASE / AI_MODEL"}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
          <div className="text-xs text-neutral-500">数据库</div>
          <div className="mt-1 font-semibold">{status?.supabase === "on" ? "Supabase 已连接" : "本地存储（演示）"}</div>
          <div className="mt-1 text-xs text-neutral-400">配置 NEXT_PUBLIC_SUPABASE_URL / ANON_KEY 后自动切换</div>
        </div>
        <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
          <div className="text-xs text-neutral-500">今日额度（当前账号）</div>
          <div className="mt-1 font-semibold">{aiUsage.used} / {aiUsage.quota} 次</div>
          <div className="mt-2 flex items-center gap-2">
            <input type="number" min={1} value={quota} onChange={(e) => setQuota(Number(e.target.value) || 50)}
              className="w-20 rounded-lg border border-neutral-300 bg-neutral-50 px-2 py-1 text-sm outline-none dark:border-neutral-600 dark:bg-neutral-800" />
            <button className="rounded-lg border border-neutral-300 px-2.5 py-1 text-xs dark:border-neutral-600"
              onClick={() => setAiUsage({ ...aiUsage, quota })}>保存额度</button>
          </div>
        </div>
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">书籍 AI 授权</h2>
        <p className="mb-3 text-sm text-neutral-500">只有开启授权的书才会被发送给模型（版权边界要求）</p>
        <div className="space-y-1.5">
          {books.map((b) => {
            const publicBook = b.copyright.status === "approved";
            return (
              <div key={b.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-700">
                <span className="font-medium">《{b.title}》</span>
                <span className="text-xs text-neutral-400">{b.format}</span>
                {!publicBook && <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-[11px] text-yellow-700">未公开</span>}
                <div className="flex-1" />
                <button
                  disabled={!publicBook}
                  onClick={() => setBookOverrides({ ...bookOverrides, [b.id]: { ...bookOverrides[b.id], aiAllowed: !b.aiAllowed } })}
                  className={`rounded-md px-2.5 py-1 text-xs disabled:opacity-40 ${b.aiAllowed ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>
                  {b.aiAllowed ? "AI 已授权" : "AI 未授权"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-6 rounded-xl border border-neutral-200 p-4 text-sm text-neutral-500 dark:border-neutral-700">
        <div className="mb-1 flex items-center gap-1.5 font-medium text-neutral-600 dark:text-neutral-300"><Icon name="shield" size={15} /> 成本与边界</div>
        AI 调用按次数记录并受额度限制；回答只做摘要、解释与不超过 90 字的短引用；用户要求整章输出时会被拒绝。
      </div>
    </AdminGate>
  );
}
