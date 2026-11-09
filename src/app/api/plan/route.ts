import { NextRequest, NextResponse } from "next/server";
import { BOOKS, categoryName } from "@/lib/data";
import { isPublic } from "@/lib/copyright";
import type { PlanTask } from "@/lib/types";

/** 阅读计划自动生成：优先按目标关键词选题，不足时按热度补齐 */

interface CatalogEntry { id: string; title: string; chapters: { title: string; chapterIndex: number }[] }

function pickBooks(goal: string, limit = 6) {
  const publicBooks = BOOKS.filter(isPublic);
  const g = goal.trim().toLowerCase();
  if (!g) return [...publicBooks].sort((a, b) => b.heat - a.heat).slice(0, limit);
  const scored = publicBooks.map((b) => {
    const hay = `${b.title} ${b.author} ${b.intro} ${b.tags.join(" ")} ${categoryName(b.categoryId)}`.toLowerCase();
    let s = 0;
    for (const w of g.split(/[\s，。、]+/).filter((x) => x.length >= 1)) if (hay.includes(w)) s += 2;
    for (let i = 0; i < g.length - 1; i++) if (hay.includes(g.slice(i, i + 2))) s++;
    return { b, s };
  });
  const hit = scored.filter((x) => x.s > 0).sort((a, b) => b.s - a.s);
  const rest = scored.filter((x) => x.s === 0).sort((a, b) => b.b.heat - a.b.heat);
  return [...hit, ...rest].slice(0, limit).map((x) => x.b);
}

function buildCatalog(goal: string): CatalogEntry[] {
  return pickBooks(goal).map((b) => ({
    id: b.id,
    title: b.title,
    chapters: b.chapters.map((c, i) => ({ title: c.title, chapterIndex: i })),
  }));
}

/** 本地生成：按每日时长把章节依次排进天数 */
function localPlan(goal: string, days: number, dailyMinutes: number, catalog: CatalogEntry[]) {
  const perChapter = 15;
  const chaptersPerDay = Math.max(1, Math.floor(dailyMinutes / perChapter));
  const items: PlanTask[] = [];
  const flattened = catalog.flatMap((c) =>
    c.chapters.length
      ? c.chapters.map((ch) => ({ bookId: c.id, bookTitle: c.title, chapterIndex: ch.chapterIndex, chapterTitle: ch.title }))
      : [{ bookId: c.id, bookTitle: c.title, chapterIndex: 0, chapterTitle: "整本阅读" }]
  );
  let p = 0;
  for (let day = 1; day <= days; day++) {
    for (let k = 0; k < chaptersPerDay && p < flattened.length; k++, p++) {
      items.push({ day, ...flattened[p], minutes: Math.min(perChapter, dailyMinutes), done: false });
    }
  }
  const used = new Set(items.map((i) => i.bookId)).size;
  const summary = items.length
    ? `围绕“${goal || "通识阅读"}”安排了 ${days} 天、每天 ${dailyMinutes} 分钟的计划，涉及 ${used} 本书、共 ${items.length} 个章节。按天完成，读不完可顺延。`
    : `书库里可安排的内容不足，请扩大选题范围或减少天数。`;
  return { summary, items };
}

const PLAN_PROMPT = `你是阅读计划生成器。根据用户目标和可用书目，输出严格 JSON（不要输出任何解释文字），格式：
{"summary":"一句话计划说明","items":[{"day":1,"bookId":"lunyu","chapterIndex":0,"chapterTitle":"学而第一","minutes":20}]}
要求：1) 只能使用书目中存在的 bookId 和 chapterIndex；2) day 从 1 递增，覆盖全部天数；3) 每天总分钟数不超过用户每日时长；4) 标点用中文。`;

export async function POST(req: NextRequest) {
  let body: { goal?: string; days?: number; dailyMinutes?: number };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "请求格式错误" }, { status: 400 }); }

  const goal = (body.goal ?? "").trim();
  const days = Math.max(1, Math.min(90, Number(body.days) || 14));
  const dailyMinutes = Math.max(10, Math.min(240, Number(body.dailyMinutes) || 30));
  const catalog = buildCatalog(goal);

  const key = process.env.AI_API_KEY;
  const base = process.env.AI_API_BASE || "https://api.openai.com/v1";
  const model = process.env.AI_MODEL || "gpt-4o-mini";

  if (key) {
    try {
      const resp = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: PLAN_PROMPT },
            {
              role: "user",
              content: `目标：${goal || "通识阅读"}\n天数：${days}\n每日时长：${dailyMinutes} 分钟\n可用书目：\n` +
                catalog.map((c) => `${c.id} 《${c.title}》：${c.chapters.map((x) => `${x.chapterIndex}:${x.title}`).join("；") || "整本"}`).join("\n"),
            },
          ],
          max_tokens: 1200,
          temperature: 0.3,
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        const raw = (data.choices?.[0]?.message?.content ?? "").replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(raw) as { summary?: string; items?: { day: number; bookId: string; chapterIndex: number; chapterTitle?: string; minutes?: number }[] };
        const items: PlanTask[] = (parsed.items ?? []).flatMap((it) => {
          const c = catalog.find((x) => x.id === it.bookId);
          const ch = (c?.chapters ?? []).find((x) => x.chapterIndex === it.chapterIndex);
          if (!c) return [];
          return [{
            day: Math.max(1, Number(it.day) || 1), bookId: c.id, bookTitle: c.title,
            chapterIndex: ch?.chapterIndex ?? 0, chapterTitle: ch?.title ?? it.chapterTitle ?? "整本阅读",
            minutes: Math.max(5, Math.min(dailyMinutes, Number(it.minutes) || 20)), done: false,
          }];
        });
        if (items.length) return NextResponse.json({ summary: parsed.summary ?? "已生成阅读计划", items, source: "ai" });
      }
    } catch {
      /* AI 生成失败时回退本地生成 */
    }
  }

  const local = localPlan(goal, days, dailyMinutes, catalog);
  return NextResponse.json({ ...local, source: "local" });
}
