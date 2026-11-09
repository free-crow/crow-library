"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Icon from "./Icon";
import { useApp } from "./StoreProvider";

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const router = useRouter();
  const { theme, setTheme, user } = useApp();
  const [q, setQ] = useState("");

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-neutral-200 bg-white px-4 dark:border-neutral-700 dark:bg-neutral-900 md:left-56">
      <button className="md:hidden" aria-label="菜单" onClick={onMenu}><Icon name="menu" size={22} /></button>
      <div className="max-w-md flex-1">
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"><Icon name="search" size={16} /></span>
          <input
            className="w-full rounded-full border border-neutral-300 bg-neutral-100 py-2 pl-10 pr-4 text-sm outline-none dark:border-neutral-600 dark:bg-neutral-800"
            type="search" placeholder="搜索书籍 / 作者…" value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && q.trim()) router.push(`/library?q=${encodeURIComponent(q.trim())}`); }}
          />
        </div>
      </div>
      <button
        className="rounded-lg border border-neutral-300 p-2 dark:border-neutral-600"
        title="切换浅色/深色"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      ><Icon name="theme" size={17} /></button>
      <button
        className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white"
        title={user ? user.email : "未登录"}
        onClick={() => router.push("/profile")}
      >{user ? user.nick.slice(0, 1) : <Icon name="user" size={16} />}</button>
    </header>
  );
}
