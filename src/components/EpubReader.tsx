"use client";

import { useEffect, useRef, useState } from "react";
import ePub, { type Book as EpubBook, type Rendition } from "epubjs";
import Icon from "./Icon";
import { useApp } from "./StoreProvider";

/** EPUB 阅读器（EPUB.js） */
export default function EpubReader({ fileUrl, title, onProgress }: {
  fileUrl: string; title: string; onProgress: (percent: number, label: string) => void;
}) {
  const { reader } = useApp();
  const boxRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<EpubBook | null>(null);
  const rendRef = useRef<Rendition | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const book = ePub(fileUrl);
        bookRef.current = book;
        await book.ready;
        await book.locations.generate(800);  // 生成定位点以计算阅读百分比
        if (cancelled || !boxRef.current) return;
        const rendition = book.renderTo(boxRef.current, { width: "100%", height: "62vh", spread: "none" });
        rendRef.current = rendition;
        rendition.themes.register("crow", {
          body: { color: "#333", "font-size": "17px", "line-height": "1.8", padding: "0 12px" },
        });
        rendition.themes.select("crow");
        await rendition.display();
        rendition.on("relocated", (loc: { start?: { cfi?: string } }) => {
          try {
            const locs = book.locations as unknown as { percentageFromCfi?: (c: string) => number } | undefined;
            const cfi = loc?.start?.cfi;
            const raw = locs?.percentageFromCfi && cfi ? locs.percentageFromCfi(cfi) : undefined;
            onProgress(typeof raw === "number" ? Math.round(raw * 100) : 0, "EPUB");
          } catch {
            onProgress(0, "EPUB");
          }
        });
        setLoading(false);
      } catch {
        if (!cancelled) { setError("EPUB 加载失败"); setLoading(false); }
      }
    })();
    return () => { cancelled = true; bookRef.current?.destroy(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileUrl]);

  useEffect(() => {
    rendRef.current?.themes.register("crow", {
      body: { color: reader.bg === "night" ? "#d7dae0" : "#333", "font-size": `${reader.size}px`, "line-height": "1.8", padding: "0 12px" },
    });
    rendRef.current?.themes.select("crow");
  }, [reader.size, reader.bg]);

  return (
    <div>
      <div className="reader-content rounded-2xl border border-neutral-200 p-2 dark:border-neutral-700">
        {loading && <div className="py-24 text-center text-neutral-500">正在加载《{title}》…</div>}
        {error && <div className="py-24 text-center text-red-500">{error}</div>}
        <div ref={boxRef} />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button className="flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-600"
          onClick={() => rendRef.current?.prev()}><Icon name="chevron-left" size={15} /> 上一页</button>
        <div className="flex-1" />
        <button className="flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-600"
          onClick={() => rendRef.current?.next()}>下一页 <Icon name="chevron-right" size={15} /></button>
      </div>
    </div>
  );
}
