import type { Book, CopyrightStatus } from "./types";

/** 管理员对书籍的运营调整（覆盖静态示例数据，本地持久化；接数据库后写入 books 表） */
export interface BookOverride {
  reviewState?: CopyrightStatus;
  aiAllowed?: boolean;
  heat?: number;
  reviewer?: string;
  reviewedAt?: string;
  note?: string;
}

export function mergeBooks(books: Book[], overrides: Record<string, BookOverride>): Book[] {
  return books.map((b) => {
    const o = overrides[b.id];
    if (!o) return b;
    return {
      ...b,
      aiAllowed: o.aiAllowed ?? b.aiAllowed,
      heat: o.heat ?? b.heat,
      copyright: {
        ...b.copyright,
        status: o.reviewState ?? b.copyright.status,
        reviewedBy: o.reviewer ?? b.copyright.reviewedBy,
        reviewedAt: o.reviewedAt ?? b.copyright.reviewedAt,
      },
    };
  });
}
