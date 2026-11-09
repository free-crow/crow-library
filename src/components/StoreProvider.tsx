"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useStore, type Store } from "@/lib/store";
import { isSupabaseEnabled } from "@/lib/supabase";
import { loadFavoritesFromCloud, loadProgressFromCloud, syncFavoritesToCloud, syncProgressToCloud } from "@/lib/sync";
import AuthModal from "./AuthModal";

const StoreCtx = createContext<Store | null>(null);
export const useApp = () => {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useApp must be used within StoreProvider");
  return ctx;
};

const AuthCtx = createContext<{ openAuth: () => void }>({ openAuth: () => {} });
export const useAuth = () => useContext(AuthCtx);

const BG_MAP = { paper: "#ffffff", eye: "#e8f5e9", night: "#1b1e24" } as const;
const TX_MAP = { paper: "#1c1f24", eye: "#1b5e20", night: "#d7dae0" } as const;

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const store = useStore();
  const [authOpen, setAuthOpen] = useState(false);
  const cloudLoaded = useRef<string | null>(null);

  /* 登录后从云端拉取阅读数据；变更后防抖推送（跨设备同步） */
  useEffect(() => {
    const uid = store.user?.id;
    if (!isSupabaseEnabled() || !uid || cloudLoaded.current === uid) return;
    cloudLoaded.current = uid;
    (async () => {
      const [cloudProg, cloudFav] = await Promise.all([loadProgressFromCloud(uid), loadFavoritesFromCloud(uid)]);
      if (Object.keys(cloudProg).length) store.setProgress({ ...store.progress, ...cloudProg });
      if (cloudFav.length) store.setFavorites([...new Set([...store.favorites, ...cloudFav])]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.user?.id]);

  useEffect(() => {
    const uid = store.user?.id;
    if (!isSupabaseEnabled() || !uid || !store.ready) return;
    const t = setTimeout(() => { syncProgressToCloud(uid, store.progress); }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.progress]);

  useEffect(() => {
    const uid = store.user?.id;
    if (!isSupabaseEnabled() || !uid || !store.ready) return;
    const t = setTimeout(() => { syncFavoritesToCloud(uid, store.favorites); }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.favorites]);

  /* 网站主题与阅读器主题分别保存 */
  useEffect(() => {
    const sysDark = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const t = store.theme === "system" ? (sysDark.matches ? "dark" : "light") : store.theme;
      document.documentElement.classList.toggle("dark", t === "dark");
      document.documentElement.style.setProperty("--accent", store.accent);
      document.documentElement.style.setProperty("--reader-bg", BG_MAP[store.reader.bg]);
      document.documentElement.style.setProperty("--reader-text", TX_MAP[store.reader.bg]);
    };
    apply();
    sysDark.addEventListener("change", apply);
    return () => sysDark.removeEventListener("change", apply);
  }, [store.theme, store.accent, store.reader]);

  return (
    <StoreCtx.Provider value={store}>
      <AuthCtx.Provider value={{ openAuth: () => setAuthOpen(true) }}>
        {children}
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </AuthCtx.Provider>
    </StoreCtx.Provider>
  );
}
