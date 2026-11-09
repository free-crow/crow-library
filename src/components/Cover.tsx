import type { Book } from "@/lib/types";

/** 自制排版封面：书名 + 作者 + 分类配色 + 篆印元素，全部由代码绘制，无第三方图片版权 */
const PALETTE: Record<string, [string, string, string]> = {
  "phil-cn": ["#134e4a", "#0f766e", "#f0fdfa"],
  "lit-classic-novel": ["#7f1d1d", "#b91c1c", "#fef2f2"],
  "lit-classic-poem": ["#1e3a8a", "#3730a3", "#eff6ff"],
  "lit-classic": ["#3f2a14", "#6b4423", "#fdf6e3"],
  "hist-ancient": ["#3b2f2f", "#7c5c3e", "#fdf4e7"],
  "lit-world": ["#1f2937", "#374151", "#f8fafc"],
  "lit-modern": ["#0c4a6e", "#0369a1", "#f0f9ff"],
};

function palette(book: Book): [string, string, string] {
  const key = book.categoryId;
  return PALETTE[key] ?? (key.startsWith("lit-classic") ? PALETTE["lit-classic"] : PALETTE["hist-ancient"]);
}

export default function Cover({ book, small = false }: { book: Book; small?: boolean }) {
  const [bg1, bg2, ink] = palette(book);
  if (small) {
    return (
      <div
        className="flex h-14 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md px-1 text-center shadow-sm"
        style={{ background: `linear-gradient(160deg, ${bg1}, ${bg2})`, color: ink }}
        aria-label={book.title}
      >
        <span className="text-[8px] font-medium leading-tight [writing-mode:vertical-rl]">{book.title.slice(0, 8)}</span>
      </div>
    );
  }
  return (
    <div
      className="relative flex aspect-[3/4] flex-col overflow-hidden rounded-xl shadow-md"
      style={{ background: `linear-gradient(155deg, ${bg1} 0%, ${bg2} 100%)`, color: ink }}
      aria-label={`${book.title}封面`}
    >
      <span className="pointer-events-none absolute inset-[6px] rounded-lg border border-white/20" />
      <span className="pointer-events-none absolute inset-y-0 left-[44%] w-px bg-white/10" />
      <span className="absolute left-2.5 top-2 text-[9px] tracking-[0.22em] opacity-70">乌鸦的图书馆</span>
      <div className="relative flex flex-1 items-start justify-end p-3 pl-8 pt-6">
        <h3
          className="max-h-full text-[15px] font-semibold leading-snug [writing-mode:vertical-rl] [text-shadow:0_1px_2px_rgba(0,0,0,.35)]"
          style={{ fontFamily: "'Songti SC','Noto Serif SC',serif", letterSpacing: "0.12em" }}
        >
          {book.title}
        </h3>
      </div>
      <div className="relative flex items-end justify-between gap-1 px-2.5 pb-2.5">
        <span className="truncate text-[10px] opacity-85">{book.author}</span>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-[8px] opacity-80">
          烏
        </span>
      </div>
    </div>
  );
}
