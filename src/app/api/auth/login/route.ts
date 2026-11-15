import { NextRequest, NextResponse } from "next/server";
import { isValidEmail, normalizeEmail, verifyPassword } from "@/lib/server/accounts";

export const runtime = "nodejs";

/** 登录：邮箱 + 上次设置的密码 */
export async function POST(req: NextRequest) {
  let body: { email?: unknown; password?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "请求格式错误" }, { status: 400 }); }

  const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!isValidEmail(email)) return NextResponse.json({ error: "请输入正确的邮箱地址" }, { status: 400 });
  if (!password) return NextResponse.json({ error: "请输入密码" }, { status: 400 });

  const account = await verifyPassword(email, password);
  if (!account) {
    return NextResponse.json({ error: "账号不存在或密码错误", code: "BAD_CREDENTIALS" }, { status: 401 });
  }
  return NextResponse.json({ user: { email: account.email, nick: account.nick, verified: true } });
}
