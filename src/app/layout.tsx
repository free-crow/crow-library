import type { Metadata } from "next";
import "./globals.css";
import Shell from "@/components/Shell";

export const metadata: Metadata = {
  title: "乌鸦的图书馆 Crow Library",
  description: "免费、开放的数字图书馆：在线阅读、个人书架、阅读记忆与 AI 阅读助手。让阅读更自由，让知识更容易被理解。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
