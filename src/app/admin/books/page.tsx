"use client";

import { useState } from "react";
import AdminGate from "@/components/AdminGate";
import Icon from "@/components/Icon";
import { useApp } from "@/components/StoreProvider";
import { useAllBooks } from "@/components/useBooks";
import { STATUS_TEXT } from "@/lib/copyright";
import type { CopyrightStatus } from "@/lib/types";

const STATUS_OPTIONS: { value: CopyrightStatus; label: string }[] = [
  { value: "approved", label: "审核通过" },
  { value: "pending", label: "待审核" },
  { value: "disputed", label: "授权存疑" },
  { value: "suspended", label: "收到投诉（下架）" },
  { value: "removed", label: "审核撤销（移除）" },
];

const today = () => new Date().toISOString().slice(0, 10);

export default function AdminBooks() {
  const { user, bookOverrides, setBookOverrides, aiUsage, setAiUsage } = useApp();
  const books = useAllBooks();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const list = books.filter((b) => {
    const st = b.copyright.status;
    if (filter === "pending" && !["pending", "disputed"].includes(st)) return false;
    if (filter === "down" && !["suspended", "removed"].includes(st)) return false;
    if (filter === "approved" && st !== "approved") return false;
    if (!q.trim()) return true;
    const kw = q.trim().toLowerCase();
    return b.title.toLowerCase().includes(kw) || b.author.toLowerCase().includes(kw);
  });

  const update = (id: string, patch: Record<string, unknown>) =>
    setBookOverrides({
      ...bookOverrides,
      [id]: { ...bookOverrides[id], ...(patch as object), reviewer: user?.email, reviewedAt: today() },
    });

  const reset = (id: string) => {
    const next = { ...bookOverrides };
    delete next[id];
    setBookOverrides(next);
  };

  return (
    <AdminGate>
      <h1 className="text-2xl font-bold">书籍与版权管理</h1>
      <p className="mb-4 mt-1 text-sm text-neutral-500">修改审核状态即全站生效：仅“审核通过”的书会出现在图书馆与智能问答中</p>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"><Icon name="search" size={15} /></span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索书名 / 作者"
            className="rounded-lg border border-neutral-300 bg-neutral-50 py-2 pl-9 pr-3 text-sm outline-none dark:border-neutral-600 dark:bg-neutral-800" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-600">
          <option value="all">全部状态</option>
          <option value="approved">仅已通过</option>
          <option value="pending">待处理</option>
          <option value="down">已下架/移除</option>
        </select>
        <span className="text-sm text-neutral-500">共 {list.length} 本</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-700">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-neutral-50 text-left text-xs text-neutral-500 dark:bg-neutral-800">
            <tr>
              <th className="px-3 py-2.5">书籍</th>
              <th className="px-3 py-2.5">作者</th>
              <th className="px-3 py-2.5">格式</th>
              <th className="px-3 py-2.5">审核状态</th>
              <th className="px-3 py-2.5">AI 授权</th>
              <th className="px-3 py-2.5">热度</th>
              <th className="px-3 py-2.5">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {list.map((b) => (
              <tr key={b.id}>
                <td className="px-3 py-2.5">
                  <div className="font-medium">《{b.title}》</div>
                  <div className="text-xs text-neutral-400">{b.copyright.basis}</div>
                </td>
                <td className="px-3 py-2.5 text-neutral-500">{b.author}</td>
                <td className="px-3 py-2.5 text-neutral-500">{b.format}</td>
                <td className="px-3 py-2.5">
                  <select value={b.copyright.status} onChange={(e) => update(b.id, { reviewState: e.target.value })}
                    className={`rounded-md border border-neutral-300 bg-transparent px-2 py-1 text-xs dark:border-neutral-600`}>
                    {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <div className="mt-1"><span className={`rounded-md px-1.5 py-0.5 text-[11px] ${STATUS_TEXT[b.copyright.status].cls}`}>{STATUS_TEXT[b.copyright.status].label}</span></div>
                </td>
                <td className="px-3 py-2.5">
                  <button onClick={() => update(b.id, { aiAllowed: !b.aiAllowed })}
                    className={`rounded-md px-2 py-1 text-xs ${b.aiAllowed ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>
                    {b.aiAllowed ? "已授权" : "未授权"}
                  </button>
                </td>
                <td className="px-3 py-2.5 text-neutral-500">{b.heat}</td>
                <td className="px-3 py-2.5">
                  {bookOverrides[b.id] ? (
                    <button onClick={() => reset(b.id)} className="text-xs text-neutral-500 underline">恢复默认</button>
                  ) : (
                    <span className="text-xs text-neutral-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 p-4 text-sm dark:border-neutral-700">
        <span className="text-neutral-500">当前管理员 AI 调用：{aiUsage.used}/{aiUsage.quota}</span>
        <button onClick={() => setAiUsage({ ...aiUsage, used: 0 })} className="rounded-lg border border-neutral-300 px-3 py-1.5 dark:border-neutral-600">重置额度</button>
      </div>
    </AdminGate>
  );
}
