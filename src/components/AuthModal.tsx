"use client";

import { useState } from "react";
import { useApp } from "./StoreProvider";
import { getSupabase, isSupabaseEnabled } from "@/lib/supabase";

export default function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { setUser } = useApp();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) return null;
  const sb = getSupabase();
  const enabled = isSupabaseEnabled();

  const submit = async (isReg: boolean) => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setError("请输入正确的邮箱地址"); return; }
    if (!pwd) { setError("请输入密码"); return; }
    setError(""); setNotice(""); setBusy(true);
    try {
      if (enabled && sb) {
        /* Supabase Auth：注册发送验证邮件；登录走邮箱+密码 */
        if (isReg) {
          const { error: e } = await sb.auth.signUp({ email, password: pwd });
          if (e) { setError(e.message); return; }
          setNotice("验证邮件已发送，请到邮箱完成验证后再登录。");
          return;
        }
        const { data, error: e } = await sb.auth.signInWithPassword({ email, password: pwd });
        if (e) { setError(e.message.includes("Email not confirmed") ? "邮箱尚未验证，请先查收验证邮件" : e.message); return; }
        setUser({ id: data.user.id, email: data.user.email ?? email, nick: data.user.user_metadata?.nick ?? "乌鸦读者", verified: true });
        onClose();
      } else {
        /* 本地演示模式（未配置 Supabase） */
        const users = JSON.parse(localStorage.getItem("crow:users") ?? "{}");
        if (isReg) {
          if (users[email]) { setError("该邮箱已注册，请直接登录"); return; }
          users[email] = { pwd, verified: true };
          localStorage.setItem("crow:users", JSON.stringify(users));
        } else if (!users[email] || users[email].pwd !== pwd) {
          setError("账号不存在或密码错误"); return;
        }
        setUser({ email, nick: "乌鸦读者", verified: true });
        onClose();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-[min(400px,92vw)] rounded-2xl bg-white p-6 dark:bg-neutral-800" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold">邮箱登录 / 注册</h3>
        <p className="mt-1 text-sm text-neutral-500">
          {enabled ? "已连接 Supabase：注册将发送验证邮件。" : "本地演示模式：注册即视为已验证。配置 .env.local 后启用 Supabase 邮箱验证。"}
        </p>
        <input className="mt-4 w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2.5 outline-none dark:border-neutral-600 dark:bg-neutral-700"
          type="email" placeholder="邮箱，例如 test@crow.lib" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="mt-3 w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2.5 outline-none dark:border-neutral-600 dark:bg-neutral-700"
          type="password" placeholder="密码" value={pwd} onChange={(e) => setPwd(e.target.value)} />
        <div className="mt-2 min-h-[18px] text-sm text-red-600">{error}</div>
        {notice && <div className="text-sm text-green-600">{notice}</div>}
        <div className="mt-2 flex justify-end gap-3">
          <button disabled={busy} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-neutral-600" onClick={() => submit(true)}>注册并验证</button>
          <button disabled={busy} className="rounded-lg bg-accent px-4 py-2 text-sm text-white disabled:opacity-50" onClick={() => submit(false)}>登录</button>
        </div>
      </div>
    </div>
  );
}
