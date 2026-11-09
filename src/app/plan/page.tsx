"use client";

import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/Icon";
import LoginGate from "@/components/LoginGate";
import { useApp } from "@/components/StoreProvider";
import type { PlanDetail } from "@/lib/types";

export default function PlanPage() {
  const { plan, setPlan, planDetail, setPlanDetail, ready } = useApp();
  const [goal, setGoal] = useState(planDetail?.goal ?? "通识阅读");
  const [days, setDays] = useState(planDetail?.days ?? 14);
  const [dailyMinutes, setDailyMinutes] = useState(planDetail?.dailyMinutes ?? plan.daily);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setBusy(true); setError("");
    try {
      const resp = await fetch("/api/plan", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, days, dailyMinutes }),
      });
      const data = await resp.json();
      if (data.error) { setError(data.error); return; }
      setPlanDetail({
        goal, days, dailyMinutes,
        source: data.source === "ai" ? "ai" : "local",
        summary: data.summary,
        items: data.items,
        generatedAt: Date.now(),
      } as PlanDetail);
    } catch {
      setError("生成失败，请稍后重试");
    } finally {
      setBusy(false);
    }
  };

  const toggleDone = (idx: number) => {
    if (!planDetail) return;
    const items = planDetail.items.map((it, i) => (i === idx ? { ...it, done: !it.done } : it));
    setPlanDetail({ ...planDetail, items });
  };

  const byDay = new Map<number, { task: PlanDetail["items"][number]; idx: number }[]>();
  planDetail?.items.forEach((task, idx) => {
    if (!byDay.has(task.day)) byDay.set(task.day, []);
    byDay.get(task.day)!.push({ task, idx });
  });
  const doneCount = planDetail?.items.filter((i) => i.done).length ?? 0;
  const totalCount = planDetail?.items.length ?? 0;

  return (
    <LoginGate>
      <h1 className="text-2xl font-bold">阅读计划</h1>
      <p className="mb-5 mt-1 text-sm text-neutral-500">设定目标，由 AI 按书库内容自动生成可执行的每日阅读安排</p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-700">
          <div className="mb-3 text-sm font-semibold">基础目标</div>
          <label className="mb-1 block text-sm text-neutral-500">每日阅读时长（分钟）</label>
          <input type="number" min={5} value={plan.daily} onChange={(e) => setPlan({ ...plan, daily: Number(e.target.value) || 30 })}
            className="mb-3 w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2.5 outline-none dark:border-neutral-600 dark:bg-neutral-800" />
          <label className="mb-1 block text-sm text-neutral-500">每月阅读目标（本）</label>
          <input type="number" min={1} value={plan.monthly} onChange={(e) => setPlan({ ...plan, monthly: Number(e.target.value) || 10 })}
            className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2.5 outline-none dark:border-neutral-600 dark:bg-neutral-800" />
          <div className="mt-2 text-sm text-green-600">修改即自动保存 ✓</div>
        </div>

        <div className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-700">
          <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold"><Icon name="sparkles" size={15} /> 自动生成计划</div>
          <label className="mb-1 block text-sm text-neutral-500">阅读方向 / 目标</label>
          <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="例如：中国哲学入门、兵家思想、修身"
            className="mb-3 w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2.5 outline-none dark:border-neutral-600 dark:bg-neutral-800" />
          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-neutral-500">天数</label>
              <input type="number" min={1} max={90} value={days} onChange={(e) => setDays(Number(e.target.value) || 14)}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2.5 outline-none dark:border-neutral-600 dark:bg-neutral-800" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-neutral-500">每日分钟</label>
              <input type="number" min={10} max={240} value={dailyMinutes} onChange={(e) => setDailyMinutes(Number(e.target.value) || 30)}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2.5 outline-none dark:border-neutral-600 dark:bg-neutral-800" />
            </div>
          </div>
          <button disabled={busy} onClick={generate}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm text-white disabled:opacity-50">
            <Icon name="sparkles" size={15} /> {busy ? "生成中…" : "生成计划"}
          </button>
          <div className="mt-2 text-xs text-neutral-400">配置 AI 密钥后由大模型生成；未配置时按书库章节智能排程。</div>
          {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        </div>
      </div>

      {ready && planDetail && (
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">我的计划</h2>
            <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500 dark:bg-neutral-800">
              {planDetail.source === "ai" ? "AI 生成" : "本地排程"}
            </span>
            <span className="text-xs text-neutral-400">完成 {doneCount}/{totalCount}</span>
            <div className="flex-1" />
            <button className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-600"
              onClick={() => setPlanDetail(null)}>清除计划</button>
          </div>
          <p className="mt-2 text-sm text-neutral-500">{planDetail.summary}</p>

          <div className="mt-4 space-y-4">
            {[...byDay.entries()].sort((a, b) => a[0] - b[0]).map(([day, list]) => (
              <div key={day} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                <div className="mb-2 text-sm font-semibold">第 {day} 天</div>
                <div className="space-y-1.5">
                  {list.map(({ task, idx }) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <button onClick={() => toggleDone(idx)}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${task.done ? "border-accent bg-accent text-white" : "border-neutral-300 dark:border-neutral-600"}`}>
                        {task.done && <Icon name="check" size={13} />}
                      </button>
                      <Link href={`/read/${task.bookId}?ch=${task.chapterIndex}`} className={`hover:underline ${task.done ? "text-neutral-400 line-through" : ""}`}>
                        《{task.bookTitle}》「{task.chapterTitle}」
                      </Link>
                      <span className="text-xs text-neutral-400">{task.minutes} 分钟</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </LoginGate>
  );
}
