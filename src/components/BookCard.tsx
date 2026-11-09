"use client";

import Link from "next/link";
import type { Book } from "@/lib/types";
import Cover from "./Cover";

export default function BookCard({ book }: { book: Book }) {
  return (
    <Link href={`/books/${book.id}`} className="group block transition-transform hover:-translate-y-1">
      <Cover book={book} />
      <div className="mt-2 truncate text-sm font-medium">{book.title}</div>
      <div className="truncate text-xs text-neutral-500">{book.author}</div>
    </Link>
  );
}
