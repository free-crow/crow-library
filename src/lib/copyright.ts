import type { Book, CopyrightStatus } from "./types";

/** 只有“审核通过”的书才会向公众开放（版权审核状态要求） */
export function isPublic(book: Book): boolean {
  return book.copyright.status === "approved";
}

export const STATUS_TEXT: Record<CopyrightStatus, { label: string; cls: string }> = {
  approved:  { label: "审核通过", cls: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  pending:   { label: "待审核",   cls: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  disputed:  { label: "授权存疑", cls: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  suspended: { label: "收到投诉（临时下架）", cls: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  removed:   { label: "审核撤销（永久移除）", cls: "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" },
};
