import { NextRequest, NextResponse } from "next/server";
import { consumeCode, createAccount, findAccount, isValidEmail, normalizeEmail } from "@/lib/server/accounts";

export const runtime = "nodejs";

/** 注册：校验邮箱验证码 → 自定义密码 → 建号（一个邮箱只能注册一次） */
export async function POST(req: NextRequest) {
  let body: { email?: unknown; code?: unknown; password?: unknown; nick?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "请求格式错误" }, { status: 400 }); }

  const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
  const code = typeof body.code === "string" ? body.code : "";
  const password = typeof body.password === "string" ? body.password : "";
  const nick = typeof body.nick === "string" ? body.nick : undefined;

  if (!isValidEmail(email)) return NextResponse.json({ error: "请输入正确的邮箱地址" }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "密码至少 6 位" }, { status: 400 });
  if (!/^\d{6}$/.test(code)) return NextResponse.json({ error: "请输入 6 位验证码" }, { status: 400 });

  if (await findAccount(email)) {
    return NextResponse.json({ error: "该邮箱已注册，请直接登录", code: "EMAIL_TAKEN" }, { status: 409 });
  }
  if (!(await consumeCode(email, code))) {
    return NextResponse.json({ error: "验证码错误或已过期", code: "CODE_INVALID" }, { status: 400 });
  }

  try {
    const account = await createAccount(email, password, nick);
    return NextResponse.json({ user: { email: account.email, nick: account.nick, verified: true } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "EMAIL_TAKEN") return NextResponse.json({ error: "该邮箱已注册，请直接登录", code: "EMAIL_TAKEN" }, { status: 409 });
    return NextResponse.json({ error: "注册失败，请稍后重试" }, { status: 500 });
  }
}
