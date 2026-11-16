"use client";

import { useEffect, useState } from "react";
import { useApp } from "./StoreProvider";
import { useI18n } from "./useI18n";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

type Mode = "login" | "register" | "reset";

/**
 * 登录 / 注册 / 重置密码弹窗。
 * - 登录：邮箱 + 上次设置的密码；登录状态会保存在本地，下次打开自动登录。
 * - 注册：邮箱 → 发送验证码 → 填验证码 → 自定义密码；一个邮箱只能注册一次。
 * - 重置密码：邮箱 → 发送验证码 → 新密码；成功后直接登录。
 */
export default function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { setUser } = useApp();
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [code, setCode] = useState("");
  const [demoCode, setDemoCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { setError(""); setNotice(""); }, [open, mode]);
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  if (!open) return null;

  const sendCode = async () => {
    if (!EMAIL_RE.test(email.trim())) { setError(t("auth.errEmail")); return; }
    setBusy(true); setError(""); setNotice("");
    try {
      const resp = await fetch("/api/auth/send-code", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), purpose: mode === "reset" ? "reset" : "register" }),
      });
      const data = await resp.json();
      if (!resp.ok) { setError(data.error ?? t("auth.codeFail")); return; }
      setDemoCode(data.demoCode ?? "");
      setCountdown(60);
      setNotice(t("auth.codeSent", { email: email.trim() }));
    } catch {
      setError(t("auth.codeFail"));
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    setError(""); setNotice("");
    if (!EMAIL_RE.test(email.trim())) { setError(t("auth.errEmail")); return; }
    if (!pwd) { setError(t("auth.errPwd")); return; }
    if (mode !== "login") {
      if (pwd.length < 6) { setError(t("auth.errPwdShort")); return; }
      if (!/^\d{6}$/.test(code.trim())) { setError(t("auth.errCode")); return; }
    }
    setBusy(true);
    try {
      const url = mode === "login" ? "/api/auth/login" : mode === "register" ? "/api/auth/register" : "/api/auth/reset-password";
      const payload = mode === "login"
        ? { email: email.trim(), password: pwd }
        : { email: email.trim(), code: code.trim(), password: pwd };
      const resp = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await resp.json();
      if (!resp.ok) { setError(data.error ?? t("auth.errBad")); return; }
      setUser({ email: data.user.email, nick: data.user.nick, verified: true });
      onClose();
    } catch {
      setError(t("auth.errBad"));
    } finally {
      setBusy(false);
    }
  };

  const title = mode === "login" ? t("auth.titleLogin") : mode === "register" ? t("auth.titleRegister") : t("auth.titleReset");
  const hint = mode === "reset" ? t("auth.hintReset") : t("auth.remember");
  const submitLabel = mode === "login" ? t("auth.login") : mode === "register" ? t("auth.submitRegister") : t("auth.submitReset");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-[min(420px,92vw)] rounded-2xl bg-white p-6 dark:bg-neutral-800" onClick={(e) => e.stopPropagation()}>
        {/* 登录 / 注册切换；重置密码从登录页进入 */}
        <div className="mb-4 flex rounded-lg bg-neutral-100 p-1 text-sm dark:bg-neutral-700">
          {(["login", "register"] as const).map((m) => (
            <button key={m}
              className={`flex-1 rounded-md px-3 py-1.5 ${mode !== "reset" && mode === m ? "bg-white font-semibold shadow-sm dark:bg-neutral-900" : "text-neutral-500"}`}
              onClick={() => setMode(m)}>{m === "login" ? t("auth.tabLogin") : t("auth.tabRegister")}</button>
          ))}
        </div>

        <h3 className="text-lg font-bold">{title}</h3>
        <p className="mt-1 text-sm text-neutral-500">{hint}</p>

        <input className="mt-4 w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2.5 outline-none dark:border-neutral-600 dark:bg-neutral-700"
          type="email" placeholder={t("auth.email")} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />

        {mode !== "login" && (
          <>
            <div className="mt-3 flex gap-2">
              <input className="min-w-0 flex-1 rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2.5 outline-none dark:border-neutral-600 dark:bg-neutral-700"
                inputMode="numeric" placeholder={t("auth.code")} value={code} maxLength={6}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
              <button disabled={busy || countdown > 0}
                className="shrink-0 rounded-lg border border-neutral-300 px-3 py-2.5 text-sm disabled:opacity-50 dark:border-neutral-600"
                onClick={sendCode}>
                {countdown > 0 ? t("auth.resendIn", { s: countdown }) : t("auth.sendCode")}
              </button>
            </div>
            {demoCode && (
              <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                {t("auth.demoCode", { code: demoCode })}
              </div>
            )}
          </>
        )}

        <input className="mt-3 w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2.5 outline-none dark:border-neutral-600 dark:bg-neutral-700"
          type="password" placeholder={mode === "login" ? t("auth.password") : t("auth.pwdRule")} value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          autoComplete={mode === "login" ? "current-password" : "new-password"} />

        {mode === "login" && (
          <div className="mt-2 text-right">
            <button className="text-xs text-neutral-500 underline hover:text-accent" onClick={() => setMode("reset")}>
              {t("auth.forgot")}
            </button>
          </div>
        )}

        <div className="mt-2 min-h-[18px] text-sm text-red-600">{error}</div>
        {notice && <div className="text-sm text-green-600">{notice}</div>}

        <div className="mt-3 flex justify-end gap-3">
          <button disabled={busy} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-neutral-600" onClick={onClose}>{t("auth.cancel")}</button>
          <button disabled={busy} className="rounded-lg bg-accent px-5 py-2 text-sm text-white disabled:opacity-50" onClick={submit}>
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
