/**
 * 阅读数据云端同步（启用 Supabase 后生效）。
 * 用户数据按账号隔离由 RLS 保证（见 supabase/schema.sql）。
 */
import type { ReadingProgress, HistoryItem } from "./types";
import { getSupabase } from "./supabase";

export async function syncProgressToCloud(userId: string, items: Record<string, ReadingProgress>) {
  const sb = getSupabase();
  if (!sb) return;
  const rows = Object.values(items).map((p) => ({
    user_id: userId, book_id: p.bookId, chapter_idx: p.chapterIndex, percent: p.percent, updated_at: new Date(p.updatedAt).toISOString(),
  }));
  if (rows.length) await sb.from("reading_progress").upsert(rows, { onConflict: "user_id,book_id" });
}

export async function loadProgressFromCloud(userId: string): Promise<Record<string, ReadingProgress>> {
  const sb = getSupabase();
  if (!sb) return {};
  const { data } = await sb.from("reading_progress").select("*").eq("user_id", userId);
  const out: Record<string, ReadingProgress> = {};
  for (const r of data ?? []) {
    out[r.book_id] = { bookId: r.book_id, chapterIndex: r.chapter_idx, chapterTitle: "", percent: Number(r.percent), updatedAt: new Date(r.updated_at).getTime() };
  }
  return out;
}

export async function syncFavoritesToCloud(userId: string, bookIds: string[]) {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("user_collections").delete().eq("user_id", userId);
  if (bookIds.length) await sb.from("user_collections").insert(bookIds.map((b) => ({ user_id: userId, book_id: b })));
}

export async function loadFavoritesFromCloud(userId: string): Promise<string[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb.from("user_collections").select("book_id").eq("user_id", userId);
  return (data ?? []).map((r) => r.book_id);
}

export async function pushHistoryToCloud(userId: string, item: HistoryItem) {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("reading_history").insert({
    user_id: userId, book_id: item.bookId, chapter_idx: item.chapterIndex, percent: item.percent, read_at: new Date(item.time).toISOString(),
  });
}
