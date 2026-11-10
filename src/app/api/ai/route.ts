import { NextRequest, NextResponse } from "next/server";
import { BOOKS } from "@/lib/data";

const MAX_SELECTION_CHARS = 500;
const MAX_REPLY_CHARS = 1200;
const MAX_COMPLETION_TOKENS = 350;

/**
 * AI 阅读助手接口（第 7 阶段）。
 * - 配置 AI_API_KEY / AI_API_BASE / AI_MODEL 后调用真实大模型（OpenAI 兼容协议）。
 * - 未配置时返回本地模拟回答（演示模式）。
 * 版权边界：系统提示强制“摘要、解释、必要的短引用”，拒绝整章/整本逐字输出。
 */

const SYSTEM_PROMPT = `你是“乌鸦的图书馆”的 AI 阅读助手。规则：
1. 回答必须基于用户提供的书籍选段与章节信息，减少无依据生成；
2. 只提供摘要、解释和必要的短引用（引用不超过90字），绝不输出整章或整本原文；
3. 用户要求整章/整本逐字输出时，拒绝并转为摘要或解释；
4. 用简体中文回答，简洁清晰。`;

function mockReply(action: string, bookTitle: string, chapterTitle: string, text: string) {
  const t = text.slice(0, 30);
  const replies: Record<string, string> = {
    "解释这段文字": `这段话出自《${bookTitle}》「${chapterTitle}」。大意是：${t}……它体现了书中的核心观点，建议结合上下文连贯理解。`,
    "总结这一章节": `「${chapterTitle}」的核心内容围绕本章主要论述展开，脉络为：提出观点 → 举例阐发 → 归结要义。`,
    "翻译这段内容": `（白话大意）${t}……——可理解为：做事应当持之以恒、反求诸己，与人相处保持真诚与分寸。`,
    "深入理解这个概念": `该选段涉及本书核心概念。理解要点：1）时代背景；2）与其他章节的呼应；3）现代意义。`,
    "向 AI 提问": `基于《${bookTitle}》「${chapterTitle}」的内容：这是一个值得结合全章理解的问题，建议先阅读本章前后的论述。`,
  };
  return replies[action] ?? replies["向 AI 提问"];
}

export async function POST(req: NextRequest) {
  let body: { action?: unknown; bookId?: unknown; chapterIndex?: unknown; text?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }
  const bookId = typeof body.bookId === "string" ? body.bookId : "";
  const book = BOOKS.find((candidate) => candidate.id === bookId);
  if (!book) return NextResponse.json({ error: "未找到这本书" }, { status: 404 });
  if (book.copyright.status !== "approved" || !book.aiAllowed) {
    return NextResponse.json({ error: "这本书未通过 AI 使用授权审核" }, { status: 403 });
  }

  if (typeof body.text !== "string" || !body.text.trim()) {
    return NextResponse.json({ error: "缺少选段内容" }, { status: 400 });
  }
  const text = body.text.trim().slice(0, MAX_SELECTION_CHARS);
  const action = typeof body.action === "string" ? body.action.slice(0, 80) : "向 AI 提问";
  const chapterIndex = typeof body.chapterIndex === "number" ? body.chapterIndex : -1;
  const chapterTitle = Number.isInteger(chapterIndex) && chapterIndex >= 0
    ? book.chapters[chapterIndex]?.title ?? "选段"
    : "选段";
  const bookTitle = book.title;

  const key = process.env.AI_API_KEY;
  const base = process.env.AI_API_BASE || "https://api.openai.com/v1";
  const model = process.env.AI_MODEL || "gpt-4o-mini";

  /* 演示模式：未配置密钥 */
  if (!key) {
    const reply = mockReply(action, bookTitle, chapterTitle, text).slice(0, MAX_REPLY_CHARS);
    return NextResponse.json({ reply, mode: "demo" });
  }

  try {
    const resp = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `书籍：《${bookTitle}》\n章节：${chapterTitle}\n操作：${action}\n选段：${text}` },
        ],
        max_tokens: MAX_COMPLETION_TOKENS,
        temperature: 0.3,
      }),
    });
    if (!resp.ok) return NextResponse.json({ error: `AI 服务错误（${resp.status}）` }, { status: 502 });
    const data = await resp.json();
    const reply = String(data.choices?.[0]?.message?.content ?? "（AI 未返回内容）").slice(0, MAX_REPLY_CHARS);
    return NextResponse.json({ reply, mode: "live", usage: data.usage });
  } catch {
    return NextResponse.json({ error: "AI 服务连接失败" }, { status: 502 });
  }
}
