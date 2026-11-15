"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import { useApp } from "./StoreProvider";
import { useI18n } from "./useI18n";
import { LANGS } from "@/lib/i18n";

export default function Topbar({ onMenu, sidebarOpen }: { onMenu: () => void; sidebarOpen: boolean }) {
  const router = useRouter();
  const { theme, setTheme, user, lang, setLang } = useApp();
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  /* 点击语言菜单外部时收起 */
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-neutral-200 bg-white px-4 transition-[left] duration-200 dark:border-neutral-700 dark:bg-neutral-900 ${sidebarOpen ? "md:left-56" : "md:left-0"}`}>
      {/* 返回上一页：和浏览器后退一致，没有可回退的历史时回到首页 */}
      <button
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-600"
        aria-label={t("top.back")}
        title={t("top.back")}
        onClick={() => { if (window.history.length > 1) router.back(); else router.push("/"); }}
      ><Icon name="chevron-left" size={18} /></button>
      <button data-menu-btn="1" aria-label={t("top.menu")} onClick={onMenu}><Icon name="menu" size={22} /></button>
      <div className="max-w-md flex-1">
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"><Icon name="search" size={16} /></span>
          <input
            className="w-full rounded-full border border-neutral-300 bg-neutral-100 py-2 pl-10 pr-4 text-sm outline-none dark:border-neutral-600 dark:bg-neutral-800"
            type="search" placeholder={t("top.search")} value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && q.trim()) router.push(`/library?q=${encodeURIComponent(q.trim())}`); }}
          />
        </div>
      </div>

      {/* 语言切换：月亮左边，点开选语言，选完当前页立即切换 */}
      <div className="relative" ref={langRef}>
        <button
          className="flex items-center gap-1 rounded-lg border border-neutral-300 px-2 py-2 text-sm dark:border-neutral-600"
          title={t("set.language")}
          aria-haspopup="listbox" aria-expanded={langOpen}
          onClick={() => setLangOpen((v) => !v)}
        >
          <Icon name="globe" size={17} />
          <span className="hidden text-[11px] font-semibold uppercase sm:inline">{lang}</span>
        </button>
        {langOpen && (
          <div role="listbox" className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
            {LANGS.map((l) => (
              <button key={l.code} role="option" aria-selected={lang === l.code}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 ${lang === l.code ? "font-semibold text-accent" : ""}`}
                onClick={() => { setLang(l.code); setLangOpen(false); }}
              >
                <span>{l.label}</span>
                {lang === l.code && <Icon name="check" size={15} />}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        className="rounded-lg border border-neutral-300 p-2 dark:border-neutral-600"
        title={t("top.theme")}
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      ><Icon name="theme" size={17} /></button>
      <button
        className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white"
        title={user ? user.email : t("top.guest")}
        onClick={() => router.push("/profile")}
      >{user ? user.nick.slice(0, 1) : <Icon name="user" size={16} />}</button>
    </header>
  );
}
