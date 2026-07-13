"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useSession } from "@/lib/client-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CardSkeleton } from "@/components/loading";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { toast } from "sonner";
import { safeJsonFetch } from "@/lib/safe-json";
import {
  Search,
  ShoppingCart,
  BookOpen,
  Tag,
  PackageOpen,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

/**
 * KatalogPage — landing page / katalog buku utama.
 * Fitur: search, filter kategori (chips), grid buku, add to cart.
 */
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function KatalogPage() {
  const { user } = useSession();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch categories
  const { data: categories } = useSWR("/api/categories", fetcher);

  // Fetch books dengan filter
  const params = new URLSearchParams();
  if (debouncedSearch) params.set("q", debouncedSearch);
  if (selectedCategory) params.set("category", selectedCategory);
  const queryString = params.toString();
  const {
    data: books,
    isLoading: isLoadingBooks,
    mutate: mutateBooks,
  } = useSWR(`/api/books${queryString ? `?${queryString}` : ""}`, fetcher);

  /** Tambah buku ke keranjang */
  const addToCart = async (bookId: string, title: string) => {
    if (!user) {
      toast.error("Silakan login terlebih dahulu.");
      return;
    }
    const res = await safeJsonFetch("/api/cart", "POST", { bookId, qty: 1 });
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || "Gagal menambah ke keranjang.");
      return;
    }
    toast.success(`"${title}" ditambahkan ke keranjang.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Hero / Header */}
      <div className="text-center space-y-3 py-8">
        <div className="inline-flex items-center gap-2 text-primary">
          <BookOpen className="h-10 w-10" />
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
          Katalog Buku
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Temukan buku favoritmu dari berbagai kategori. Cari, pilih, dan beli
          dengan mudah.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="space-y-4">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari judul atau penulis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge
            variant={selectedCategory === "" ? "default" : "outline"}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setSelectedCategory("")}
          >
            <Tag className="h-3 w-3 mr-1" />
            Semua
          </Badge>
          {(categories || []).map(
            (cat: { id: string; name: string; _count?: { books: number } }) => (
              <Badge
                key={cat.id}
                variant={
                  selectedCategory === cat.id ? "default" : "outline"
                }
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === cat.id ? "" : cat.id
                  )
                }
              >
                {cat.name}
                {cat._count && (
                  <span className="ml-1 text-xs opacity-70">
                    ({cat._count.books})
                  </span>
                )}
              </Badge>
            )
          )}
        </div>
      </div>

      <Separator />

      {/* Books Grid */}
      {isLoadingBooks ? (
        <CardSkeleton count={6} />
      ) : !books || books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <PackageOpen className="h-16 w-16 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">
            Buku tidak ditemukan
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {debouncedSearch || selectedCategory
              ? "Coba ubah kata kunci atau filter kategori."
              : "Belum ada buku yang ditambahkan."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map(
            (book: {
              id: string;
              title: string;
              author: string;
              price: number;
              stock: number;
              imageUrl?: string;
              category?: { name: string };
            }) => (
              <Card
                key={book.id}
                className="group flex flex-col overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                {/* Book image */}
                <Link href={`/books/${book.id}`} className="overflow-hidden">
                  <div className="relative h-48 bg-muted">
                    {book.imageUrl ? (
                      <Image
                        src={book.imageUrl}
                        alt={book.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                </Link>

                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/books/${book.id}`}
                      className="font-semibold leading-tight hover:text-primary transition-colors line-clamp-2"
                    >
                      {book.title}
                    </Link>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {book.author}
                  </p>
                </CardHeader>

                <CardContent className="pb-2 flex-1">
                  {book.category && (
                    <Badge variant="secondary" className="text-xs">
                      {book.category.name}
                    </Badge>
                  )}
                  <p className="text-lg font-bold text-primary mt-2">
                    Rp {book.price.toLocaleString("id-ID")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Stok: {book.stock}
                  </p>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full gap-2"
                    disabled={book.stock === 0}
                    onClick={() => addToCart(book.id, book.title)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {book.stock === 0 ? "Stok Habis" : "Tambah ke Keranjang"}
                  </Button>
                </CardFooter>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}
