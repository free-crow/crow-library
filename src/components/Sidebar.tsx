"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import { useApp } from "./StoreProvider";
import { isAdminEmail } from "@/lib/admin";

const NAV = [
  { href: "/", icon: "home", label: "首页" },
  { href: "/library", icon: "library", label: "图书馆" },
  { href: "/ask", icon: "chat", label: "智能问答" },
  { href: "/ai", icon: "ai", label: "AI 阅读室" },
  { href: "/shelf", icon: "shelf", label: "个人书架" },
  { href: "/history", icon: "history", label: "阅读历史" },
  { href: "/favorites", icon: "star", label: "我的收藏" },
  { href: "/plan", icon: "calendar", label: "阅读计划" },
  { href: "/profile", icon: "user", label: "个人中心" },
  { href: "/settings", icon: "palette", label: "主题设置" },
] as const;

const ADMIN_NAV = [
  { href: "/admin", icon: "dashboard", label: "后台概览" },
  { href: "/admin/books", icon: "book", label: "书籍与版权" },
  { href: "/admin/users", icon: "users", label: "用户管理" },
  { href: "/admin/ai", icon: "sliders", label: "AI 管理" },
] as const;

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { user } = useApp();
  const admin = isAdminEmail(user?.email);

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-neutral-200 bg-white px-3 py-4 transition-transform dark:border-neutral-700 dark:bg-neutral-900 md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <Link href="/" className="flex items-center gap-2 px-2 pb-4" onClick={onClose}>
        <img src="/images/crow.jpg" alt="乌鸦" className="h-8 w-8 rounded-full object-cover" />
        <span className="text-base font-bold">乌鸦的图书馆</span>
      </Link>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} onClick={onClose}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${pathname === n.href ? "bg-accent text-white" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
            <Icon name={n.icon} size={19} /><span>{n.label}</span>
          </Link>
        ))}

        {admin && (
          <>
            <div className="mt-3 flex items-center gap-1.5 border-t border-neutral-200 px-3 pb-1 pt-3 text-xs text-neutral-400 dark:border-neutral-700">
              <Icon name="shield" size={13} /> 管理后台
            </div>
            {ADMIN_NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={onClose}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${pathname === n.href ? "bg-accent text-white" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
                <Icon name={n.icon} size={19} /><span>{n.label}</span>
              </Link>
            ))}
          </>
        )}
      </nav>
      <div className="mt-2 hidden px-2 md:block">
        <img src="/images/crow.jpg" alt="乌鸦吉祥物" className="w-full rounded-xl object-cover opacity-95" />
      </div>
      <div className="px-3 pt-2 text-xs text-neutral-400">V1.1 · 让阅读更自由</div>
    </aside>
  );
}
