import { NextResponse } from "next/server";

/** 运行时配置状态（不含任何密钥内容，只返回是否已配置） */
export async function GET() {
  return NextResponse.json({
    ai: process.env.AI_API_KEY ? "live" : "demo",
    aiModel: process.env.AI_API_KEY ? (process.env.AI_MODEL || "gpt-4o-mini") : null,
    supabase: process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "on" : "off",
  });
}
