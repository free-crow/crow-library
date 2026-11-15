import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * 服务端数据库客户端（账号 / 验证码）。
 * 优先用 SUPABASE_SERVICE_ROLE_KEY（可绕过 RLS，最安全）；
 * 没有时退回 anon key —— 需要在 Supabase 里给 crow_* 表放开 RLS 策略（见 supabase/accounts.sql）。
 */
let cached: SupabaseClient | null = null;

export function serverDb(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!cached) cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}

export const ACCOUNT_TABLE = "crow_accounts";
export const CODE_TABLE = "crow_codes";
