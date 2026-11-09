import { NextRequest, NextResponse } from "next/server";
import { BOOKS } from "@/lib/data";
import { isPublic } from "@/lib/copyright";

/** 检索到的书内片段（只来自“审核通过”的书籍） */
interface Source {
  bookId: string;
  title: string;
  author: string;
  chapterIndex: number;
  chapterTitle: string;
  excerpt: string;
  score: number;
}

const STOP = /[，。！？、；：,.!?;:"“”'‘’（）()\s]/;

/** 中文无空格，用 2-gram 做简单相关性打分 */
function bigrams(q: string): string[] {
  const s = q.replace(STOP, "").replace(STOP, "");
  const out = new Set<string>();
  for (let i = 0; i < s.length - 1; i++) out.add(s.slice(i, i + 2));
  if (s.length === 1) out.add(s);
  return [...out];
}

function count(hay: string, gs: string[]): number {
  const h = hay.toLowerCase();
  let n = 0;
  for (const g of gs) {
    let i = h.indexOf(g);
    while (i !== -1) { n++; i = h.indexOf(g, i + g.length); }
  }
  return n;
}

function excerptAround(text: string, gs: string[], max = 200): string {
  const lower = text.toLowerCase();
  let at = -1;
  for (const g of gs) { at = lower.indexOf(g); if (at !== -1) break; }
  if (at === -1) return text.slice(0, max);
  const start = Math.max(0, at - 40);
  return (start > 0 ? "…" : "") + text.slice(start, start + max) + (start + max < text.length ? "…" : "");
}

function retrieve(query: string): Source[] {
  const gs = bigrams(query);
  const results: { src: Source }[] = [];

  for (const book of BOOKS.filter(isPublic)) {
    const base = count(`${book.title} ${book.author} ${book.intro} ${book.tags.join(" ")}`, gs);
    if (!book.chapters.length) {
      if (base > 0) {
        results.push({
          src: { bookId: book.id, title: book.title, author: book.author, chapterIndex: 0, chapterTitle: book.format, excerpt: book.intro.slice(0, 200), score: base },
        });
      }
      continue;
    }
    let best: Source | null = null;
    book.chapters.forEach((ch, idx) => {
      const body = ch.paras.join("\n");
      const s = base + count(`${ch.title} ${body}`, gs) * 2;
      if (!best || s > best.score) {
        best = {
          bookId: book.id, title: book.title, author: book.author, chapterIndex: idx,
          chapterTitle: ch.title, excerpt: excerptAround(body, gs), score: s,
        };
      }
    });
    if (best && (best as Source).score > 0) results.push({ src: best as Source });
  }

  const sorted = results.map((r) => r.src).sort((a, b) => b.score - a.score);
  if (sorted.length) return sorted.slice(0, 3);

  /* 没有命中词时，回退到热度最高的书，避免空结果 */
  return BOOKS.filter(isPublic)
    .sort((a, b) => b.heat - a.heat)
    .slice(0, 2)
    .map((b) => ({
      bookId: b.id, title: b.title, author: b.author, chapterIndex: 0,
      chapterTitle: b.chapters[0]?.title ?? b.format, excerpt: b.intro.slice(0, 160), score: 0,
    }));
}

const SYSTEM_PROMPT = `你是“乌鸦的图书馆”的检索问答助手。规则：
1. 只基于给定的书内片段回答，不得编造书中没有的内容；
2. 回答时用书名与章节名标明出处，例如《论语》「学而第一」；
3. 引用原文不超过90字，绝不输出整章或整本；
4. 用简体中文回答，200字以内，条理清晰。`;

export async function POST(req: NextRequest) {
  let body: { question?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "请求格式错误" }, { status: 400 }); }
  const question = (body.question ?? "").trim();
  if (question.length < 2) return NextResponse.json({ error: "请输入问题" }, { status: 400 });

  const sources = retrieve(question);
  const context = sources
    .map((s, i) => `[${i + 1}] 《${s.title}》（${s.author}）「${s.chapterTitle}」：${s.excerpt}`)
    .join("\n");

  const key = process.env.AI_API_KEY;
  const base = process.env.AI_API_BASE || "https://api.openai.com/v1";
  const model = process.env.AI_MODEL || "gpt-4o-mini";

  if (!key) {
    const hit = sources.filter((s) => s.score > 0);
    const answer = hit.length
      ? `根据书库检索，与“${question}”最相关的内容：\n` +
        hit.map((s, i) => `${i + 1}. 《${s.title}》「${s.chapterTitle}」：${s.excerpt.slice(0, 90)}${s.excerpt.length > 90 ? "…" : ""}`).join("\n") +
        `\n\n建议进入对应章节阅读完整上下文。`
      : `书库里暂时没有直接命中“${question}”的内容。可以换个说法，或先看看《${sources[0]?.title ?? "论语"}》等热门书籍。`;
    return NextResponse.json({ answer, sources, mode: "demo" });
  }

  try {
    const resp = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `问题：${question}\n\n书内片段：\n${context}` },
        ],
        max_tokens: 500,
        temperature: 0.2,
      }),
    });
    if (!resp.ok) return NextResponse.json({ answer: "AI 服务暂时不可用。", sources, mode: "error" }, { status: 502 });
    const data = await resp.json();
    return NextResponse.json({ answer: data.choices?.[0]?.message?.content ?? "（AI 未返回内容）", sources, mode: "live" });
  } catch {
    return NextResponse.json({ answer: "AI 服务连接失败。", sources, mode: "error" }, { status: 502 });
  }
}
