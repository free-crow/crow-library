import { NextRequest, NextResponse } from "next/server";
import { consumeCode, findAccount, isValidEmail, normalizeEmail, updatePassword } from "@/lib/server/accounts";

export const runtime = "nodejs";

/** 重置密码：邮箱验证码校验通过后，写入新密码并直接登录 */
export async function POST(req: NextRequest) {
  let body: { email?: unknown; code?: unknown; password?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "请求格式错误" }, { status: 400 }); }

  const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
  const code = typeof body.code === "string" ? body.code : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!isValidEmail(email)) return NextResponse.json({ error: "请输入正确的邮箱地址" }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "密码至少 6 位" }, { status: 400 });
  if (!/^\d{6}$/.test(code)) return NextResponse.json({ error: "请输入 6 位验证码" }, { status: 400 });

  const account = await findAccount(email);
  if (!account) {
    return NextResponse.json({ error: "该邮箱尚未注册，请先注册", code: "EMAIL_NOT_FOUND" }, { status: 404 });
  }
  if (!(await consumeCode(email, code))) {
    return NextResponse.json({ error: "验证码错误或已过期", code: "CODE_INVALID" }, { status: 400 });
  }

  const ok = await updatePassword(email, password);
  if (!ok) return NextResponse.json({ error: "重置失败，请稍后重试" }, { status: 500 });

  return NextResponse.json({ user: { email: account.email, nick: account.nick, verified: true } });
}
