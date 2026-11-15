"use client";

import { useApp } from "@/components/StoreProvider";
import { useI18n } from "@/components/useI18n";
import { LANGS } from "@/lib/i18n";

const THEMES = [["light", "theme.light"], ["dark", "theme.dark"], ["system", "theme.system"], ["custom", "theme.custom"]] as const;
const SWATCHES = ["#3b5bfd", "#8b5cf6", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];

export default function SettingsPage() {
  const { lang, setLang, theme, setTheme, accent, setAccent, reader, setReader } = useApp();
  const { t } = useI18n();

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("set.title")}</h1>
      <p className="mb-5 mt-1 text-sm text-neutral-500">{t("set.subtitle")}</p>
      <div className="max-w-lg space-y-5 rounded-xl border border-neutral-200 p-5 dark:border-neutral-700">
        <div>
          <div className="mb-2 text-sm text-neutral-500">{t("set.language")}</div>
          <div className="grid grid-cols-2 gap-2">
            {LANGS.map((l) => (
              <button key={l.code} onClick={() => setLang(l.code)}
                className={`rounded-lg border px-4 py-2 text-sm ${lang === l.code ? "border-accent bg-accent text-white" : "border-neutral-300 dark:border-neutral-600"}`}>{l.label}</button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm text-neutral-500">{t("set.siteTheme")}</div>
          <div className="flex flex-wrap gap-2">
            {THEMES.map(([v, k]) => (
              <button key={v} onClick={() => setTheme(v)}
                className={`rounded-lg border px-4 py-2 text-sm ${theme === v ? "border-accent bg-accent text-white" : "border-neutral-300 dark:border-neutral-600"}`}>{t(k)}</button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm text-neutral-500">{t("set.accent")}</div>
          <div className="flex gap-2.5">
            {SWATCHES.map((c) => (
              <button key={c} aria-label={c} onClick={() => { setAccent(c); setTheme("custom"); }}
                className={`h-9 w-9 rounded-full border-2 ${accent === c ? "border-neutral-900 dark:border-white" : "border-transparent"}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm text-neutral-500">{t("set.fontSize", { size: reader.size })}</div>
          <input type="range" min={12} max={28} value={reader.size} onChange={(e) => setReader({ ...reader, size: Number(e.target.value) })} className="w-full" />
        </div>
        <div>
          <div className="mb-2 text-sm text-neutral-500">{t("set.font")}</div>
          <select value={reader.font} onChange={(e) => setReader({ ...reader, font: e.target.value as typeof reader.font })}
            className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2.5 dark:border-neutral-600">
            <option value="serif">{t("font.serif")}</option>
            <option value="sans">{t("font.sans")}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
