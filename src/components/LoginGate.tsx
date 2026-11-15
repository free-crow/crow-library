"use client";

import { createContext, useContext } from "react";
import { useApp, useAuth } from "./StoreProvider";
import { useI18n } from "./useI18n";

const Ctx = createContext(false);

/** 未登录用户可浏览公开书籍；书架、收藏、阅读记忆等功能需要登录 */
export default function LoginGate({ children }: { children: React.ReactNode }) {
  const { user, ready } = useApp();
  const { openAuth } = useAuth();
  const { t } = useI18n();

  if (!ready) return <div className="py-16 text-center text-neutral-500">{t("common.loading")}</div>;
  if (!user) {
    return (
      <div className="py-16 text-center text-neutral-500">
        {t("gate.need")}
        <button className="ml-3 rounded-lg bg-accent px-4 py-2 text-sm text-white" onClick={openAuth}>{t("gate.login")}</button>
      </div>
    );
  }
  return <Ctx.Provider value={true}>{children}</Ctx.Provider>;
}

export const useLoggedIn = () => useContext(Ctx);
