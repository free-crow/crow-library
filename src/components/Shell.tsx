"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Tabbar from "./Tabbar";
import StoreProvider from "./StoreProvider";

export default function Shell({ children }: { children: React.ReactNode }) {
  /* 手机端默认收起、电脑端默认展开；两边都支持“点别处收起” */
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);

  const isDesktop = () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;
  const toggle = () => (isDesktop() ? setDesktopOpen((v) => !v) : setMobileOpen((v) => !v));
  const closeAll = () => { setMobileOpen(false); setDesktopOpen(false); };

  /* 点侧边栏以外的地方 / 按 Esc 都收起 */
  useEffect(() => {
    if (!mobileOpen && !desktopOpen) return;
    const onDown = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el) return;
      if (el.closest("aside")) return;
      if (el.closest('[data-menu-btn="1"]')) return;
      closeAll();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeAll(); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen, desktopOpen]);

  /* 手机端抽屉打开时锁住背景滚动 */
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen]);

  return (
    <StoreProvider>
      {mobileOpen && (
        <div className="fixed inset-0 z-[45] bg-black/40 md:hidden" aria-hidden onClick={() => setMobileOpen(false)} />
      )}
      {/* 侧边栏内的链接只收起手机抽屉，电脑端保持展开 */}
      <Sidebar open={mobileOpen} desktopOpen={desktopOpen} onClose={() => setMobileOpen(false)} />
      <Topbar onMenu={toggle} sidebarOpen={desktopOpen} />
      <main className={`ml-0 mt-14 min-h-[calc(100vh-3.5rem)] p-4 pb-20 transition-[margin] duration-200 md:p-6 md:pb-6 ${desktopOpen ? "md:ml-56" : "md:ml-0"}`}>{children}</main>
      <Tabbar />
    </StoreProvider>
  );
}
