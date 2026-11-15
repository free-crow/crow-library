import type { Book } from "../types";
import { zh, type DictKey } from "./dict.zh";
import { en } from "./dict.en";
import { de } from "./dict.de";
import { fr } from "./dict.fr";
import { km } from "./dict.km";
import { ru } from "./dict.ru";
import { ms } from "./dict.ms";
import { BOOK_META, ROMANIZED_TITLE } from "./bookMeta";
import { DEFAULT_LANG, htmlLangOf, LANGS, type Lang } from "./lang";

export type { DictKey, Lang };
export { DEFAULT_LANG, htmlLangOf, LANGS };

const DICTS: Record<Lang, Record<DictKey, string>> = { zh, en, de, fr, km, ru, ms };

/** 取界面文字；{name} 形式的占位符会被 vars 替换 */
export function translate(lang: Lang, key: DictKey, vars?: Record<string, string | number>): string {
  const raw = DICTS[lang]?.[key] ?? zh[key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/** 分类名称：有对应语言包时翻译，否则回落到中文分类名 */
export function translateCategory(lang: Lang, id: string): string {
  const key = `cat.${id}` as DictKey;
  return key in zh ? translate(lang, key) : id;
}

/** 只翻译书名/作者这类元信息；正文与章节标题保持原文 */
export function localizeBook(book: Book, lang: Lang): Book {
  if (lang === "zh") return book;
  const meta = BOOK_META[book.id]?.[lang];
  if (meta) return { ...book, title: meta.title, author: meta.author ?? book.author };
  const roman = ROMANIZED_TITLE[book.id];
  return roman ? { ...book, title: roman } : book;
}
