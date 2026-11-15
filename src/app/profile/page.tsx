"use client";

import { useRouter } from "next/navigation";
import LoginGate from "@/components/LoginGate";
import { useApp } from "@/components/StoreProvider";
import { useI18n } from "@/components/useI18n";

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useApp();
  const { t } = useI18n();

  const logout = () => { setUser(null); router.push("/"); };
  const clearLocalData = () => {
    if (!confirm(t("prof.confirmClear"))) return;
    Object.keys(localStorage).filter((key) => key.startsWith("crow:")).forEach((key) => localStorage.removeItem(key));
    location.reload();
  };

  return (
    <LoginGate>
      <h1 className="text-2xl font-bold">{t("prof.title")}</h1>
      <p className="mb-5 mt-1 text-sm text-neutral-500">{t("prof.subtitle")}</p>
      <div className="max-w-md rounded-xl border border-neutral-200 p-5 dark:border-neutral-700">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg font-semibold text-white">{user?.nick.slice(0, 1)}</div>
          <div>
            <div className="font-semibold">{user?.email}</div>
            <div className="text-sm text-neutral-500">{t("prof.verified")}</div>
          </div>
        </div>
        <label className="mb-1 block text-sm text-neutral-500">{t("prof.nick")}</label>
        <input value={user?.nick ?? ""} onChange={(e) => user && setUser({ ...user, nick: e.target.value })}
          className="mb-4 w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2.5 outline-none dark:border-neutral-600 dark:bg-neutral-800" />
        <div className="flex gap-3">
          <button className="rounded-lg border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-600" onClick={logout}>{t("prof.logout")}</button>
          <button className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600" onClick={clearLocalData}>{t("prof.clear")}</button>
        </div>
      </div>
    </LoginGate>
  );
}
