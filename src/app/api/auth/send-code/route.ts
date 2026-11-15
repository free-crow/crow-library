import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { findAccount, isValidEmail, issueCode, normalizeEmail } from "@/lib/server/accounts";

export const runtime = "nodejs";

/**
 * 发送注册验证码。
 * 支持任意收件邮箱（QQ / 163 / Gmail / Outlook / 学校邮箱…），只要配一个发件服务：
 * 1) SMTP（推荐用你自己的 QQ 邮箱）：SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS(授权码) / MAIL_FROM
 * 2) Resend：RESEND_API_KEY
 * 都没配时降级为“本地演示”，验证码直接显示在页面上。
 */
async function sendBySMTP(email: string, code: string): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return false;
  try {
    const port = Number(process.env.SMTP_PORT || 465);
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
      auth: { user, pass },
      connectionTimeout: 15000,
    });
    await transporter.sendMail({
      from: process.env.MAIL_FROM || `乌鸦的图书馆 <${user}>`,
      to: email,
      subject: "【乌鸦的图书馆】注册验证码",
      html: `<div style="font-family:system-ui,sans-serif">
        <h2>乌鸦的图书馆 · 注册验证码</h2>
        <p>你的验证码是：</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:6px;color:#3b5bfd">${code}</p>
        <p style="color:#666">10 分钟内有效。如果不是你本人操作，请忽略本邮件。</p>
      </div>`,
    });
    return true;
  } catch {
    return false;
  }
}

async function sendByResend(email: string, code: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const from = process.env.MAIL_FROM || "Crow Library <onboarding@resend.dev>";
  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "【乌鸦的图书馆】注册验证码",
        html: `<p>你的注册验证码是：</p><p style="font-size:24px;font-weight:700;letter-spacing:4px">${code}</p><p>10 分钟内有效。</p>`,
      }),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  let body: { email?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "请求格式错误" }, { status: 400 }); }
  const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
  if (!isValidEmail(email)) return NextResponse.json({ error: "请输入正确的邮箱地址" }, { status: 400 });

  if (await findAccount(email)) {
    return NextResponse.json({ error: "该邮箱已注册，请直接登录", code: "EMAIL_TAKEN" }, { status: 409 });
  }

  const { code, retryAfter } = await issueCode(email);
  if (retryAfter) {
    return NextResponse.json({ error: `请 ${retryAfter} 秒后再试`, retryAfter }, { status: 429 });
  }

  if (await sendBySMTP(email, code)) return NextResponse.json({ ok: true, mode: "email" });
  if (await sendByResend(email, code)) return NextResponse.json({ ok: true, mode: "email" });

  /* 没有配置任何发件服务：把验证码回给前端做本地演示 */
  return NextResponse.json({ ok: true, mode: "demo", demoCode: code });
}
