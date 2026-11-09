/** 全局类型定义（对应数据库规划，见 supabase/schema.sql） */

/** 版权审核状态：只有“审核通过”的书才会向公众开放 */
export type CopyrightStatus =
  | "approved"   // 审核通过 → 允许上线
  | "pending"    // 待审核 → 不可公开
  | "disputed"   // 授权存疑 → 不可公开
  | "suspended"  // 收到投诉 → 临时下架
  | "removed";   // 审核撤销 → 永久移除

/** 版权字段（对应《版权合规计划》第六章） */
export interface CopyrightInfo {
  status: CopyrightStatus;
  basis: string;            // 权利依据（公版 / 开放许可 / 直接授权 / 仅外链…）
  rightsHolder: string;     // 权利人或授权主体
  licenseName: string;      // 许可名称
  licenseUrl?: string;      // 原始许可页面
  permissionScope: string;  // 允许的用途：在线阅读 / 下载 / 转换 / AI 索引等
  territory?: string;       // 许可地域
  validUntil?: string;      // 许可到期日
  attributionText: string;  // 规定的署名、版权声明文本
  sourceUrl: string;        // 原始来源
  sourceDate?: string;      // 获取日期
  reviewedBy: string;       // 审核人
  reviewedAt: string;       // 审核时间
}

export interface Chapter {
  title: string;
  paras: string[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  translator?: string;
  categoryId: string;       // 支持多级分类（一/二/三级）
  tags: string[];
  intro: string;
  originalLanguage: string;
  format: "EPUB" | "PDF" | "TXT";
  copyright: CopyrightInfo;
  aiAllowed: boolean;       // 授权是否覆盖 AI 处理
  heat: number;
  updatedAt: string;
  chapters: Chapter[];      // 内置章节（API/计划备用）；正式版由 book_files/chapters 表提供
  hasFullText?: boolean;    // 是否提供 public/books/text/<id>.json 全文
  fileUrl?: string;         // EPUB/PDF 文件地址（受控存储）
}

export interface Category {
  id: string;
  name: string;
  children?: Category[];
}

export interface ReadingProgress {
  bookId: string;
  chapterIndex: number;
  chapterTitle: string;
  percent: number;
  updatedAt: number;
}

export interface HistoryItem {
  bookId: string;
  chapterIndex: number;
  percent: number;
  time: number;
}

export interface User {
  email: string;
  nick: string;
  verified: boolean;
  id?: string;  // Supabase user id（本地演示模式无此字段）
}

/** AI 自动生成的阅读计划 */
export interface PlanTask {
  day: number;
  bookId: string;
  bookTitle: string;
  chapterIndex: number;
  chapterTitle: string;
  minutes: number;
  done: boolean;
}

export interface PlanDetail {
  goal: string;
  days: number;
  dailyMinutes: number;
  source: "ai" | "local";
  summary: string;
  items: PlanTask[];
  generatedAt: number;
}
