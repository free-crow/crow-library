\uFEFF"use client";

import { useRouter } from "next/navigation";
import LoginGate from "@/components/LoginGate";
import { useApp } from "@/components/StoreProvider";

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useApp();

  const logout = () => { setUser(null); router.push("/"); };
  const clearLocalData = () => {
    if (!confirm("确定清除本浏览器保存的图书馆数据？这不会删除 Supabase 云端账号或数据。")) return;
    Object.keys(localStorage).filter((key) => key.startsWith("crow:")).forEach((key) => localStorage.removeItem(key));
    location.reload();
  };

  return (
    <LoginGate>
      <h1 className="text-2xl font-bold">个人中心</h1>
      <p className="mb-5 mt-1 text-sm text-neutral-500">邮箱账号 · 昵称 · 账号安全</p>
      <div className="max-w-md rounded-xl border border-neutral-200 p-5 dark:border-neutral-700">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg font-semibold text-white">{user?.nick.slice(0, 1)}</div>
          <div>
            <div className="font-semibold">{user?.email}</div>
            <div className="text-sm text-neutral-500">邮箱已验证 ✓</div>
          </div>
        </div>
        <label className="mb-1 block text-sm text-neutral-500">昵称</label>
        <input value={user?.nick ?? ""} onChange={(e) => user && setUser({ ...user, nick: e.target.value })}
          className="mb-4 w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2.5 outline-none dark:border-neutral-600 dark:bg-neutral-800" />
        <div className="flex gap-3">
          <button className="rounded-lg border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-600" onClick={logout}>退出登录</button>
          <button className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600" onClick={clearLocalData}>清除本地数据</button>
        </div>
      </div>
    </LoginGate>
  );
}


\n