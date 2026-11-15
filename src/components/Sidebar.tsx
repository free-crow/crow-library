"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import { useApp } from "./StoreProvider";
import { useI18n } from "./useI18n";
import { isAdminEmail } from "@/lib/admin";

const NAV = [
  { href: "/", icon: "home", key: "nav.home" },
  { href: "/library", icon: "library", key: "nav.library" },
  { href: "/ask", icon: "chat", key: "nav.ask" },
  { href: "/ai", icon: "ai", key: "nav.ai" },
  { href: "/shelf", icon: "shelf", key: "nav.shelf" },
  { href: "/history", icon: "history", key: "nav.history" },
  { href: "/favorites", icon: "star", key: "nav.favorites" },
  { href: "/plan", icon: "calendar", key: "nav.plan" },
  { href: "/profile", icon: "user", key: "nav.profile" },
  { href: "/settings", icon: "palette", key: "nav.settings" },
] as const;

const ADMIN_NAV = [
  { href: "/admin", icon: "dashboard", key: "nav.adminOverview" },
  { href: "/admin/books", icon: "book", key: "nav.adminBooks" },
  { href: "/admin/users", icon: "users", key: "nav.adminUsers" },
  { href: "/admin/ai", icon: "sliders", key: "nav.adminAi" },
] as const;

export default function Sidebar({ open, desktopOpen, onClose }: { open: boolean; desktopOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { user } = useApp();
  const { t } = useI18n();
  const admin = isAdminEmail(user?.email);

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-neutral-200 bg-white px-3 py-4 transition-transform dark:border-neutral-700 dark:bg-neutral-900 ${open ? "translate-x-0" : "-translate-x-full"} ${desktopOpen ? "md:translate-x-0" : "md:-translate-x-full"}`}>
      <Link href="/" className="flex items-center gap-2 px-2 pb-4" onClick={onClose}>
        <img src="/images/crow.jpg" alt={t("brand.crow")} className="h-8 w-8 rounded-full object-cover" />
        <span className="text-base font-bold">{t("brand.name")}</span>
      </Link>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} onClick={onClose}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${pathname === n.href ? "bg-accent text-white" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
            <Icon name={n.icon} size={19} /><span>{t(n.key)}</span>
          </Link>
        ))}

        {admin && (
          <>
            <div className="mt-3 flex items-center gap-1.5 border-t border-neutral-200 px-3 pb-1 pt-3 text-xs text-neutral-400 dark:border-neutral-700">
              <Icon name="shield" size={13} /> {t("nav.admin")}
            </div>
            {ADMIN_NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={onClose}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${pathname === n.href ? "bg-accent text-white" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
                <Icon name={n.icon} size={19} /><span>{t(n.key)}</span>
              </Link>
            ))}
          </>
        )}
      </nav>
      <div className="mt-2 hidden px-2 md:block">
        <img src="/images/crow.jpg" alt={t("brand.mascot")} className="w-full rounded-xl object-cover opacity-95" />
      </div>
      <div className="flex gap-3 px-3 pt-2 text-xs text-neutral-500"><Link href="/copyright" onClick={onClose} className="hover:underline">{t("footer.copyright")}</Link><Link href="/privacy" onClick={onClose} className="hover:underline">{t("footer.privacy")}</Link></div>
      <div className="px-3 pt-1 text-xs text-neutral-400">{t("footer.slogan")}</div>
    </aside>
  );
}
