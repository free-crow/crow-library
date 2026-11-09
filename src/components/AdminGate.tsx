"use client";

import { useApp, useAuth } from "./StoreProvider";
import { ADMIN_EMAILS, isAdminEmail } from "@/lib/admin";

/** 后台权限门：仅管理员邮箱可进入；未登录时引导登录 */
export default function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, ready } = useApp();
  const { openAuth } = useAuth();

  if (!ready) return <div className="py-16 text-center text-neutral-500">加载中…</div>;

  if (!user) {
    return (
      <div className="py-16 text-center">
        <div className="text-neutral-500">后台管理需要登录。</div>
        <div className="mt-1 text-sm text-neutral-400">请使用管理员邮箱 {ADMIN_EMAILS.join(" / ")} 注册/登录</div>
        <button className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm text-white" onClick={openAuth}>去登录</button>
      </div>
    );
  }

  if (!isAdminEmail(user.email)) {
    return (
      <div className="py-16 text-center">
        <div className="text-neutral-500">当前账号（{user.email}）没有后台权限。</div>
        <div className="mt-1 text-sm text-neutral-400">仅管理员邮箱 {ADMIN_EMAILS.join(" / ")} 可进入后台。</div>
      </div>
    );
  }

  return <>{children}</>;
}
