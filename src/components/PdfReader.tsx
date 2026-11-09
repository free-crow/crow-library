"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { useApp } from "./StoreProvider";

/** PDF 阅读器（PDF.js，canvas 渲染） */
export default function PdfReader({ fileUrl, title, onProgress }: {
  fileUrl: string; title: string; onProgress: (percent: number, label: string) => void;
}) {
  const { reader } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const docRef = useRef<{ numPages: number; getPage: (n: number) => Promise<{ getViewport: (o: { scale: number }) => { width: number; height: number }; render: (p: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> } }> } | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const doc = await pdfjs.getDocument({ url: fileUrl }).promise;
        if (cancelled) return;
        docRef.current = doc as unknown as typeof docRef.current;
        setTotal(doc.numPages);
      } catch {
        if (!cancelled) setError("PDF 加载失败");
      }
    })();
    return () => { cancelled = true; };
  }, [fileUrl]);

  useEffect(() => {
    (async () => {
      const doc = docRef.current;
      const canvas = canvasRef.current;
      if (!doc || !canvas || page < 1 || page > doc.numPages) return;
      const pg = await doc.getPage(page);
      const scale = reader.size / 17;
      const viewport = pg.getViewport({ scale: 1.4 * scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (ctx) await pg.render({ canvasContext: ctx, viewport }).promise;
      onProgress(Math.round((page / doc.numPages) * 100), `第 ${page} 页`);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, total, reader.size]);

  return (
    <div>
      <div className="reader-content overflow-x-auto rounded-2xl border border-neutral-200 p-4 dark:border-neutral-700">
        {!total && !error && <div className="py-24 text-center text-neutral-500">正在加载《{title}》…</div>}
        {error && <div className="py-24 text-center text-red-500">{error}</div>}
        <canvas ref={canvasRef} className="mx-auto max-w-full" />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button disabled={page <= 1} className="flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-neutral-600"
          onClick={() => setPage((p) => Math.max(1, p - 1))}><Icon name="chevron-left" size={15} /> 上一页</button>
        <span className="text-sm text-neutral-500">{page} / {total || "…"}</span>
        <div className="flex-1" />
        <button disabled={page >= total} className="flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-neutral-600"
          onClick={() => setPage((p) => Math.min(total, p + 1))}>下一页 <Icon name="chevron-right" size={15} /></button>
      </div>
    </div>
  );
}
