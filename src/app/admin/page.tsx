"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminGate from "@/components/AdminGate";
import Icon from "@/components/Icon";
import { useApp } from "@/components/StoreProvider";
import { useAllBooks } from "@/components/useBooks";
import { STATUS_TEXT } from "@/lib/copyright";
import type { CopyrightStatus } from "@/lib/types";

const today = () => new Date().toISOString().slice(0, 10);

export default function AdminHome() {
  const { user, aiUsage, bookOverrides, setBookOverrides } = useApp();
  const books = useAllBooks();
  const [userCount, setUserCount] = useState(0);
  const [status, setStatus] = useState<{ ai: string; supabase: string } | null>(null);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("crow:users") ?? "{}");
    setUserCount(Object.keys(users).length + (localStorage.getItem("crow:guest:user") ? 1 : 0));
    fetch("/api/status").then((r) => r.json()).then(setStatus).catch(() => setStatus(null));
  }, []);

  const counts = {
    total: books.length,
    approved: books.filter((b) => b.copyright.status === "approved").length,
    pending: books.filter((b) => b.copyright.status === "pending" || b.copyright.status === "disputed").length,
    down: books.filter((b) => b.copyright.status === "suspended" || b.copyright.status === "removed").length,
  };
  const queue = books.filter((b) => ["pending", "disputed", "suspended"].includes(b.copyright.status));

  const change = (id: string, s: CopyrightStatus) =>
    setBookOverrides({ ...bookOverrides, [id]: { ...bookOverrides[id], reviewState: s, reviewer: user?.email, reviewedAt: today() } });

  return (
    <AdminGate>
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">后台概览</h1>
          <p className="mt-1 text-sm text-neutral-500">书籍与版权 · 用户 · AI 使用情况</p>
        </div>
        <div className="flex flex-1 justify-end gap-2 text-xs">
          <span className={`rounded-md px-2 py-1 ${status?.ai === "live" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
            AI：{status?.ai === "live" ? "已接真实模型" : "演示模式"}
          </span>
          <span className={`rounded-md px-2 py-1 ${status?.supabase === "on" ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-600"}`}>
            数据库：{status?.supabase === "on" ? "Supabase 已连接" : "本地存储"}
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "书籍总数", value: counts.total, icon: "book" },
          { label: "已通过", value: counts.approved, icon: "check" },
          { label: "待处理", value: counts.pending, icon: "shield" },
          { label: "已下架/移除", value: counts.down, icon: "close" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500"><Icon name={s.icon as never} size={14} /> {s.label}</div>
            <div className="mt-1 text-2xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-sm text-neutral-500">
        <span>注册用户：{userCount}</span>
        <span>我的 AI 调用：{aiUsage.used}/{aiUsage.quota}</span>
        <span>管理员：{user?.email}</span>
      </div>

      <section className="mt-7">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-semibold">版权审核队列</h2>
          <span className="rounded-md bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">{queue.length} 本待处理</span>
        </div>
        {queue.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700">没有待处理的书籍</div>
        ) : (
          <div className="space-y-2">
            {queue.map((b) => {
              const st = STATUS_TEXT[b.copyright.status];
              return (
                <div key={b.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-700">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">《{b.title}》</span>
                      <span className={`rounded-md px-1.5 py-0.5 text-xs ${st.cls}`}>{st.label}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-neutral-500">
                      {b.author} · {b.copyright.basis} · 来源：{b.copyright.sourceUrl}
                    </div>
                  </div>
                  <button className="rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white" onClick={() => change(b.id, "approved")}>审核通过</button>
                  <button className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs dark:border-neutral-600" onClick={() => change(b.id, "disputed")}>标记存疑</button>
                  <button className="rounded-lg border border-red-300 px-3 py-1.5 text-xs text-red-600" onClick={() => change(b.id, "suspended")}>下架</button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-lg font-semibold">审核与调整记录</h2>
        {Object.keys(bookOverrides).length === 0 ? (
          <div className="rounded-xl border border-neutral-200 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700">暂无调整记录</div>
        ) : (
          <div className="space-y-1.5 text-sm">
            {books.filter((b) => bookOverrides[b.id]).map((b) => (
              <div key={b.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2 dark:bg-neutral-800">
                <span className="font-medium">《{b.title}》</span>
                <span className={`rounded-md px-1.5 py-0.5 text-xs ${STATUS_TEXT[b.copyright.status].cls}`}>{STATUS_TEXT[b.copyright.status].label}</span>
                <span className="text-xs text-neutral-400">{b.copyright.reviewedBy} · {b.copyright.reviewedAt}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/admin/books" className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-600">前往书籍管理</Link>
          <Link href="/admin/users" className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-600">用户管理</Link>
          <Link href="/admin/ai" className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-600">AI 管理</Link>
        </div>
      </section>
    </AdminGate>
  );
}
