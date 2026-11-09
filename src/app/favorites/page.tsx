"use client";

import BookCard from "@/components/BookCard";
import LoginGate from "@/components/LoginGate";
import { useApp } from "@/components/StoreProvider";
import { useAllBooks } from "@/components/useBooks";
import { isPublic } from "@/lib/copyright";

export default function FavoritesPage() {
  const { favorites } = useApp();
  const allBooks = useAllBooks();
  const books = favorites.map((id) => allBooks.find((b) => b.id === id)).filter((b) => b && isPublic(b));

  return (
    <LoginGate>
      <h1 className="text-2xl font-bold">我的收藏</h1>
      <p className="mb-5 mt-1 text-sm text-neutral-500">收藏管理</p>
      {books.length ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">{books.map((b) => <BookCard key={b!.id} book={b!} />)}</div>
      ) : (
        <div className="py-14 text-center text-neutral-500">暂无收藏</div>
      )}
    </LoginGate>
  );
}
