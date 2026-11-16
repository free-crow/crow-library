"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { useApp } from "./StoreProvider";

type PdfDoc = {
  numPages: number;
  getPage: (n: number) => Promise<{
    getViewport: (o: { scale: number }) => { width: number; height: number };
    render: (p: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void>; cancel: () => void };
  }>;
};

const LOAD_TIMEOUT = 25000;

/**
 * PDF 阅读器（PDF.js legacy 构建 + canvas 渲染）。
 * - 用 legacy 构建并补齐 Promise.withResolvers / structuredClone，兼容学校等场景的老浏览器；
 * - 加载超时、失败都有明确提示和“重试”，不会一直停在加载中。
 */
export default function PdfReader({ fileUrl, title, onProgress }: {
  fileUrl: string; title: string; onProgress: (percent: number, label: string) => void;
}) {
  const { reader } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const docRef = useRef<PdfDoc | null>(null);
  const taskRef = useRef<{ destroy: () => Promise<void> } | null>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  /* 老浏览器兜底：pdf.js v6 依赖这些 API */
  const loadPdfjs = useCallback(async () => {
    const P = Promise as unknown as { withResolvers?: () => unknown };
    if (typeof P.withResolvers !== "function") {
      P.withResolvers = function withResolvers() {
        let resolve!: (v: unknown) => void;
        let reject!: (e: unknown) => void;
        const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
        return { promise, resolve, reject };
      };
    }
    if (typeof globalThis.structuredClone !== "function") {
      globalThis.structuredClone = ((obj: unknown) => JSON.parse(JSON.stringify(obj))) as typeof structuredClone;
    }
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.min.mjs");
    /* 用 .js 后缀：部分 CDN 会把 .mjs 返回成 application/octet-stream，
       module worker 要求 JavaScript MIME，否则浏览器直接拒绝加载导致 PDF 打不开。 */
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
    return pdfjs;
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setTotal(0);
    taskRef.current?.destroy().catch(() => {});
    taskRef.current = null;
    docRef.current = null;

    (async () => {
      try {
        const pdfjs = await loadPdfjs();
        const task = pdfjs.getDocument({ url: fileUrl });
        taskRef.current = task as unknown as { destroy: () => Promise<void> };
        const doc = await Promise.race([
          task.promise,
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), LOAD_TIMEOUT)),
        ]);
        if (cancelled) { task.destroy().catch(() => {}); return; }
        docRef.current = doc as unknown as PdfDoc;
        setTotal(doc.numPages);
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "";
        setError(
          msg === "timeout"
            ? "PDF 加载超时，请检查网络后重试"
            : "PDF 加载失败，请刷新或重试"
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
      renderTaskRef.current = null;
      taskRef.current?.destroy().catch(() => {});
      taskRef.current = null;
      docRef.current = null;
    };
  }, [fileUrl, reloadKey, loadPdfjs]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const doc = docRef.current;
      const canvas = canvasRef.current;
      if (!doc || !canvas || page < 1 || page > doc.numPages) return;
      try {
        renderTaskRef.current?.cancel();
        renderTaskRef.current = null;
        const pg = await doc.getPage(page);
        if (cancelled) return;
        const scale = reader.size / 17;
        const viewport = pg.getViewport({ scale: 1.4 * scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const renderTask = pg.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        if (!cancelled) onProgress(Math.round((page / doc.numPages) * 100), `第 ${page} 页`);
      } catch (e) {
        /* 换页时旧任务被取消属于正常情况 */
        const name = (e as { name?: string })?.name;
        if (!cancelled && name !== "RenderingCancelledException") setError("这一页渲染失败，请翻到其他页或重试");
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, total, reader.size]);

  return (
    <div>
      <div className="reader-content overflow-x-auto rounded-2xl border border-neutral-200 p-4 dark:border-neutral-700">
        {loading && !error && <div className="py-24 text-center text-neutral-500">正在加载《{title}》…</div>}
        {error && (
          <div className="py-24 text-center text-sm text-red-500">
            {error}
            <button className="ml-3 rounded-lg border border-neutral-300 px-3 py-1.5 text-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
              onClick={() => setReloadKey((v) => v + 1)}>重试</button>
          </div>
        )}
        <canvas ref={canvasRef} className={`mx-auto max-w-full ${error ? "hidden" : ""}`} />
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
