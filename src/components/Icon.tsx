import React from "react";

/** 线条风格 SVG 图标（stroke 风格，统一 1.8px 线宽） */
const PATHS: Record<string, React.ReactNode> = {
  home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9 21v-6h6v6" /></>,
  library: <><path d="M4 19.5V5a2 2 0 0 1 2-2h13v16H6.5a2.5 2.5 0 0 0 0 5H19" /><path d="M8 7h7" /></>,
  ai: <><rect x="5" y="7" width="14" height="11" rx="3" /><path d="M12 7V4" /><circle cx="12" cy="3" r="1" /><circle cx="9.5" cy="12" r=".6" fill="currentColor" /><circle cx="14.5" cy="12" r=".6" fill="currentColor" /><path d="M9.5 15.5h5" /></>,
  shelf: <><path d="M4 4h4v16H4z" /><path d="M10 4h4v16h-4z" /><path d="m15.5 5 4 1-3.8 14.5-4-1z" /></>,
  history: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  star: <path d="m12 3 2.7 5.6 6.3.9-4.5 4.4 1 6.1-5.5-2.9L6.5 20l1-6.1L3 9.5l6.3-.9z" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" /></>,
  palette: <><path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2s.5-2 2-2h2a3.5 3.5 0 0 0 3.5-3.5C21 8 17 3 12 3z" /><circle cx="7.5" cy="10.5" r=".8" fill="currentColor" /><circle cx="11" cy="7.5" r=".8" fill="currentColor" /><circle cx="15.5" cy="9" r=".8" fill="currentColor" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.8-3.8" /></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  theme: <><path d="M20 13.5A8.5 8.5 0 0 1 10.5 4 7 7 0 1 0 20 13.5z" /></>,
  bookmark: <path d="M6 3h12v18l-6-4.5L6 21z" />,
  "chevron-left": <path d="m15 5-7 7 7 7" />,
  "chevron-right": <path d="m9 5 7 7-7 7" />,
  book: <><path d="M2 5.5A2.5 2.5 0 0 1 4.5 3H20v15H4.5A2.5 2.5 0 0 0 2 20.5z" /><path d="M2 20.5A2.5 2.5 0 0 1 4.5 18H20" /></>,
  sparkles: <><path d="M12 4l1.7 4.3L18 10l-4.3 1.7L12 16l-1.7-4.3L6 10l4.3-1.7z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></>,
  minus: <path d="M5 12h14" />,
  plus: <path d="M12 5v14M5 12h14" />,
  logout: <><path d="M15 4h4v16h-4" /><path d="m10 8-4 4 4 4M6 12h9" /></>,
  chat: <><path d="M4 5h16v11H9l-5 4z" /><circle cx="9" cy="10.5" r=".6" fill="currentColor" /><circle cx="12" cy="10.5" r=".6" fill="currentColor" /><circle cx="15" cy="10.5" r=".6" fill="currentColor" /></>,
  shield: <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="m8.5 11.5 2.5 2.5 4.5-4.5" /></>,
  check: <path d="m5 12 5 5 9-9" />,
  close: <path d="M7 7l10 10M17 7 7 17" />,
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2 21c1.2-3 3.8-4.5 7-4.5s5.8 1.5 7 4.5" /><path d="M17 8.5a3 3 0 1 0 0-5" /><path d="M18 16c1.8.6 3 1.8 4 4" /></>,
  sliders: <><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h10M18 18h2" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="16" cy="18" r="2" /></>,
};

export default function Icon({ name, size = 20, className = "" }: { name: keyof typeof PATHS; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {PATHS[name]}
    </svg>
  );
}
