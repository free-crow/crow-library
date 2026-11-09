"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

const TABS = [
  { href: "/", icon: "home", label: "首页" },
  { href: "/library", icon: "library", label: "图书馆" },
  { href: "/ai", icon: "ai", label: "AI" },
  { href: "/shelf", icon: "shelf", label: "书架" },
  { href: "/profile", icon: "user", label: "我的" },
] as const;

/* 手机端：导航栏转换为底部标签栏 */
export default function Tabbar() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-14 border-t border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900 md:hidden">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] ${pathname === t.href ? "text-accent" : "text-neutral-500"}`}>
          <Icon name={t.icon} size={21} /><span>{t.label}</span>
        </Link>
      ))}
    </nav>
  );
}
