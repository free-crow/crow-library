"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Tabbar from "./Tabbar";
import StoreProvider from "./StoreProvider";

export default function Shell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <StoreProvider>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Topbar onMenu={() => setMenuOpen((v) => !v)} />
      <main className="ml-0 mt-14 min-h-[calc(100vh-3.5rem)] p-4 pb-20 md:ml-56 md:p-6 md:pb-6">{children}</main>
      <Tabbar />
    </StoreProvider>
  );
}
