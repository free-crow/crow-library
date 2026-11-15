"use client";

import { useCallback } from "react";
import { useApp } from "./StoreProvider";
import { translate, translateCategory, type DictKey } from "@/lib/i18n";

/** 界面文字翻译：t("nav.home") / t("home.count", { n: 6 }) */
export function useI18n() {
  const { lang } = useApp();
  const t = useCallback(
    (key: DictKey, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang]
  );
  const cat = useCallback((id: string) => translateCategory(lang, id), [lang]);
  return { t, cat, lang };
}
