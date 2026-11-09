"use client";

/**
 * 本地演示数据层（第 3 阶段将替换为 Supabase Auth + PostgreSQL，保证用户数据按账号隔离）。
 * 所有键按用户邮箱隔离存储，模拟“每个用户只能读取自己的数据”。
 */
import { useCallback, useEffect, useState } from "react";
import type { HistoryItem, PlanDetail, ReadingProgress, User } from "./types";
import type { BookOverride } from "./overrides";

export interface ReaderPrefs { size: number; font: "serif" | "sans"; bg: "paper" | "eye" | "night"; }
export interface Plan { daily: number; monthly: number; }
export interface AiUsage { used: number; quota: number; }

interface Persist {
  user: User | null;
  progress: Record<string, ReadingProgress>;
  history: HistoryItem[];
  favorites: string[];
  shelf: string[];
  plan: Plan;
  planDetail: PlanDetail | null;
  aiUsage: AiUsage;
  theme: "light" | "dark" | "system" | "custom";
  accent: string;
  reader: ReaderPrefs;
  bookOverrides: Record<string, BookOverride>;   // 管理员调整（全站共享）
}

const DEFAULTS: Persist = {
  user: null,
  progress: {},
  history: [],
  favorites: [],
  shelf: [],
  plan: { daily: 30, monthly: 10 },
  planDetail: null,
  aiUsage: { used: 0, quota: 50 },
  theme: "light",
  accent: "#3b5bfd",
  reader: { size: 17, font: "serif", bg: "paper" },
  bookOverrides: {},
};

function key(email: string | null, k: string) {
  return `crow:${email ?? "guest"}:${k}`;
}

function load<K extends keyof Persist>(email: string | null, k: K): Persist[K] {
  if (typeof window === "undefined") return DEFAULTS[k];
  try {
    const raw = localStorage.getItem(key(email, k));
    return raw ? JSON.parse(raw) : DEFAULTS[k];
  } catch {
    return DEFAULTS[k];
  }
}

export function useStore() {
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<Persist["progress"]>({});
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [shelf, setShelf] = useState<string[]>([]);
  const [plan, setPlan] = useState<Plan>(DEFAULTS.plan);
  const [planDetail, setPlanDetail] = useState<PlanDetail | null>(null);
  const [aiUsage, setAiUsage] = useState<AiUsage>(DEFAULTS.aiUsage);
  const [theme, setTheme] = useState<Persist["theme"]>("light");
  const [accent, setAccent] = useState(DEFAULTS.accent);
  const [reader, setReader] = useState<ReaderPrefs>(DEFAULTS.reader);
  const [bookOverrides, setBookOverrides] = useState<Record<string, BookOverride>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const u = load(null, "user");
    const email = u?.email ?? null;
    setUser(u);
    setProgress(load(email, "progress"));
    setHistory(load(email, "history"));
    setFavorites(load(email, "favorites"));
    setShelf(load(email, "shelf"));
    setPlan(load(email, "plan"));
    setPlanDetail(load(email, "planDetail"));
    setAiUsage(load(email, "aiUsage"));
    setTheme(load(null, "theme"));
    setAccent(load(null, "accent"));
    setReader(load(null, "reader"));
    setBookOverrides(load(null, "bookOverrides"));
    setReady(true);
  }, []);

  const persist = useCallback(<K extends keyof Persist>(k: K, v: Persist[K]) => {
    const email = k === "theme" || k === "accent" || k === "reader" || k === "user" || k === "bookOverrides"
      ? null
      : (load(null, "user")?.email ?? null);
    localStorage.setItem(key(email, k), JSON.stringify(v));
  }, []);

  const wrap = useCallback(<K extends keyof Persist>(
    setter: React.Dispatch<React.SetStateAction<Persist[K]>>, k: K
  ) => (v: Persist[K]) => { setter(v); persist(k, v); }, [persist]);

  return {
    ready,
    user, setUser: wrap(setUser, "user"),
    progress, setProgress: wrap(setProgress, "progress"),
    history, setHistory: wrap(setHistory, "history"),
    favorites, setFavorites: wrap(setFavorites, "favorites"),
    shelf, setShelf: wrap(setShelf, "shelf"),
    plan, setPlan: wrap(setPlan, "plan"),
    planDetail, setPlanDetail: wrap(setPlanDetail, "planDetail"),
    aiUsage, setAiUsage: wrap(setAiUsage, "aiUsage"),
    theme, setTheme: wrap(setTheme, "theme"),
    accent, setAccent: wrap(setAccent, "accent"),
    reader, setReader: wrap(setReader, "reader"),
    bookOverrides, setBookOverrides: wrap(setBookOverrides, "bookOverrides"),
  };
}

export type Store = ReturnType<typeof useStore>;
