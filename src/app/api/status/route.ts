import { NextResponse } from "next/server";

/** 运行时配置状态（不含任何密钥内容，只返回是否已配置） */
export async function GET() {
  const hasSMTP = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  return NextResponse.json({
    version: "1.2",
    ai: process.env.AI_API_KEY ? "live" : "demo",
    aiModel: process.env.AI_API_KEY ? (process.env.AI_MODEL || "gpt-4o-mini") : null,
    supabase: process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "on" : "off",
    /* 注册验证码：smtp=会发邮件，demo=只显示在页面上 */
    mail: hasSMTP ? "smtp" : process.env.RESEND_API_KEY ? "resend" : "demo",
    accountStore: process.env.NEXT_PUBLIC_SUPABASE_URL ? "supabase" : "file",
  });
}
