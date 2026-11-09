"use client";

import { useEffect, useState } from "react";
import AdminGate from "@/components/AdminGate";
import Icon from "@/components/Icon";
import { useApp } from "@/components/StoreProvider";
import { ADMIN_EMAILS, isAdminEmail } from "@/lib/admin";

export default function AdminUsers() {
  const { user } = useApp();
  const [users, setUsers] = useState<{ email: string; verified: boolean }[]>([]);

  useEffect(() => {
    const raw = JSON.parse(localStorage.getItem("crow:users") ?? "{}") as Record<string, { verified?: boolean }>;
    const list = Object.entries(raw).map(([email, v]) => ({ email, verified: !!v.verified }));
    setUsers(list);
  }, []);

  return (
    <AdminGate>
      <h1 className="text-2xl font-bold">用户管理</h1>
      <p className="mb-4 mt-1 text-sm text-neutral-500">本地演示模式的注册用户；接入 Supabase 后由 profiles 表提供</p>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-700">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-neutral-50 text-left text-xs text-neutral-500 dark:bg-neutral-800">
            <tr>
              <th className="px-3 py-2.5">邮箱</th>
              <th className="px-3 py-2.5">邮箱验证</th>
              <th className="px-3 py-2.5">角色</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {users.length === 0 && (
              <tr><td colSpan={3} className="px-3 py-8 text-center text-neutral-500">暂无注册用户</td></tr>
            )}
            {users.map((u) => (
              <tr key={u.email}>
                <td className="px-3 py-2.5">{u.email}{u.email === user?.email && <span className="ml-1 text-xs text-accent">（当前）</span>}</td>
                <td className="px-3 py-2.5 text-neutral-500">{u.verified ? "已验证 ✓" : "未验证"}</td>
                <td className="px-3 py-2.5">
                  {isAdminEmail(u.email)
                    ? <span className="flex items-center gap-1 text-green-700"><Icon name="shield" size={14} /> 管理员</span>
                    : <span className="text-neutral-500">普通用户</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-xl border border-neutral-200 p-4 text-sm text-neutral-500 dark:border-neutral-700">
        管理员邮箱列表：{ADMIN_EMAILS.join("、")}（代码内配置 src/lib/admin.ts）。上传与发布权限分离，普通用户无法进入后台。
      </div>
    </AdminGate>
  );
}
