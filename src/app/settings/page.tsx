"use client";

import { useApp } from "@/components/StoreProvider";

const THEMES = [["light", "浅色"], ["dark", "深色"], ["system", "跟随系统"], ["custom", "自定义"]] as const;
const SWATCHES = ["#3b5bfd", "#8b5cf6", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];

export default function SettingsPage() {
  const { theme, setTheme, accent, setAccent, reader, setReader } = useApp();

  return (
    <div>
      <h1 className="text-2xl font-bold">主题设置</h1>
      <p className="mb-5 mt-1 text-sm text-neutral-500">网站主题与阅读器主题分别保存</p>
      <div className="max-w-lg space-y-5 rounded-xl border border-neutral-200 p-5 dark:border-neutral-700">
        <div>
          <div className="mb-2 text-sm text-neutral-500">网站主题</div>
          <div className="flex flex-wrap gap-2">
            {THEMES.map(([v, n]) => (
              <button key={v} onClick={() => setTheme(v)}
                className={`rounded-lg border px-4 py-2 text-sm ${theme === v ? "border-accent bg-accent text-white" : "border-neutral-300 dark:border-neutral-600"}`}>{n}</button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm text-neutral-500">自定义主题颜色</div>
          <div className="flex gap-2.5">
            {SWATCHES.map((c) => (
              <button key={c} aria-label={c} onClick={() => { setAccent(c); setTheme("custom"); }}
                className={`h-9 w-9 rounded-full border-2 ${accent === c ? "border-neutral-900 dark:border-white" : "border-transparent"}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm text-neutral-500">阅读器字体大小（{reader.size}px）</div>
          <input type="range" min={12} max={28} value={reader.size} onChange={(e) => setReader({ ...reader, size: Number(e.target.value) })} className="w-full" />
        </div>
        <div>
          <div className="mb-2 text-sm text-neutral-500">阅读器字体</div>
          <select value={reader.font} onChange={(e) => setReader({ ...reader, font: e.target.value as typeof reader.font })}
            className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2.5 dark:border-neutral-600">
            <option value="serif">衬线（宋体系）</option>
            <option value="sans">无衬线（黑体系）</option>
          </select>
        </div>
      </div>
    </div>
  );
}
