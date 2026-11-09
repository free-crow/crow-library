"use client";

import BookCard from "@/components/BookCard";
import Icon from "@/components/Icon";
import LoginGate from "@/components/LoginGate";
import { useApp } from "@/components/StoreProvider";
import { useAllBooks } from "@/components/useBooks";
import { isPublic } from "@/lib/copyright";

export default function ShelfPage() {
  const { shelf } = useApp();
  const allBooks = useAllBooks();
  const books = shelf.map((id) => allBooks.find((b) => b.id === id)).filter((b) => b && isPublic(b));

  return (
    <LoginGate>
      <h1 className="text-2xl font-bold">个人书架</h1>
      <p className="mb-5 mt-1 text-sm text-neutral-500">正在阅读 · 已读完 · 自建书单</p>
      <h2 className="mb-3 text-lg font-semibold">正在阅读（{books.length}）</h2>
      {books.length ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">{books.map((b) => <BookCard key={b!.id} book={b!} />)}</div>
      ) : (
        <div className="py-14 text-center text-neutral-500">书架还是空的，去图书馆挑一本吧</div>
      )}
      <h2 className="mb-3 mt-8 text-lg font-semibold">我的书单</h2>
      <div className="flex items-center gap-2 rounded-xl border border-neutral-200 p-4 text-sm dark:border-neutral-700"><Icon name="shelf" size={16} className="text-neutral-400" /> 默认书单 <span className="text-neutral-500">（0 本）</span></div>
    </LoginGate>
  );
}
