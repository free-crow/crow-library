/** 支持的语言：与需求一致（中文、英语、德语、法语、柬埔寨语/高棉语、俄语、马来西亚语） */
export type Lang = "zh" | "en" | "de" | "fr" | "km" | "ru" | "ms";

export const LANGS: { code: Lang; label: string; htmlLang: string }[] = [
  { code: "zh", label: "简体中文", htmlLang: "zh-CN" },
  { code: "en", label: "English", htmlLang: "en" },
  { code: "de", label: "Deutsch", htmlLang: "de" },
  { code: "fr", label: "Français", htmlLang: "fr" },
  { code: "km", label: "ខ្មែរ (高棉语)", htmlLang: "km" },
  { code: "ru", label: "Русский", htmlLang: "ru" },
  { code: "ms", label: "Bahasa Melayu", htmlLang: "ms" },
];

export const DEFAULT_LANG: Lang = "zh";

export function htmlLangOf(lang: Lang): string {
  return LANGS.find((l) => l.code === lang)?.htmlLang ?? "zh-CN";
}
