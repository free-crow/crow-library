import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase 客户端（认证 + 数据库）。
 * 未配置 NEXT_PUBLIC_SUPABASE_URL / ANON_KEY 时返回 null，应用以“本地演示模式”运行。
 */
let client: SupabaseClient | null = null;

export function isSupabaseEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseEnabled()) return null;
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}
