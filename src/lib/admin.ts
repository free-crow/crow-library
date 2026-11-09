/** 后台权限：公开发布与上传权限分离，仅管理员邮箱可进入后台。
 * 可通过 NEXT_PUBLIC_ADMIN_EMAILS 配置（逗号分隔），未配置时使用默认演示账号。 */
const DEFAULT_ADMIN_EMAILS = ["admin@crow.lib"];

export const ADMIN_EMAILS = (() => {
  const list = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(/[,，;\s]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.length ? list : DEFAULT_ADMIN_EMAILS;
})();

export function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}
