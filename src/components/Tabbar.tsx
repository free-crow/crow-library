"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import { useI18n } from "./useI18n";

const TABS = [
  { href: "/", icon: "home", key: "tab.home" },
  { href: "/library", icon: "library", key: "tab.library" },
  { href: "/ai", icon: "ai", key: "tab.ai" },
  { href: "/shelf", icon: "shelf", key: "tab.shelf" },
  { href: "/profile", icon: "user", key: "tab.profile" },
] as const;

/* 手机端：导航栏转换为底部标签栏 */
export default function Tabbar() {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-14 border-t border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900 md:hidden">
      {TABS.map((tab) => (
        <Link key={tab.href} href={tab.href}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] ${pathname === tab.href ? "text-accent" : "text-neutral-500"}`}>
          <Icon name={tab.icon} size={21} /><span>{t(tab.key)}</span>
        </Link>
      ))}
    </nav>
  );
}
