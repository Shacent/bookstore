"use client";

import { use } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/client-session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { safeJsonFetch } from "@/lib/safe-json";
import {
  ShoppingCart,
  ArrowLeft,
  BookOpen,
  Package,
  Tag,
  User,
  FileText,
} from "lucide-react";
import Image from "next/image";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * BookDetailPage — halaman detail buku.
 * Menampilkan info lengkap + tombol add to cart.
 */
export default function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useSession();
  const router = useRouter();
  const { data: book, isLoading } = useSWR(`/api/books/${id}`, fetcher);

  const addToCart = async () => {
    if (!user) {
      toast.error("Silakan login terlebih dahulu.");
      return;
    }
    const res = await safeJsonFetch("/api/cart", "POST", {
      bookId: book.id,
      qty: 1,
    });
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || "Gagal menambah ke keranjang.");
      return;
    }
    toast.success(`"${book.title}" ditambahkan ke keranjang.`);
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
        <Skeleton className="h-6 w-24 mb-6" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-80 w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-16 text-center">
        <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Buku tidak ditemukan</h2>
        <Button variant="link" onClick={() => router.push("/")}>
          Kembali ke katalog
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
      {/* Back button */}
      <Button
        variant="ghost"
        className="mb-6 gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Book image */}
        <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden">
          {book.imageUrl ? (
            <Image
              src={book.imageUrl}
              alt={book.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <BookOpen className="h-24 w-24 text-muted-foreground/20" />
            </div>
          )}
        </div>

        {/* Book info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {book.title}
            </h1>
            <p className="text-lg text-muted-foreground flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {book.author}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {book.category && (
              <Badge variant="secondary" className="gap-1">
                <Tag className="h-3 w-3" />
                {book.category.name}
              </Badge>
            )}
            <Badge
              variant={book.stock > 0 ? "outline" : "destructive"}
              className="gap-1"
            >
              <Package className="h-3 w-3" />
              {book.stock > 0 ? `Stok: ${book.stock}` : "Stok Habis"}
            </Badge>
          </div>

          <div>
            <p className="text-3xl font-bold text-primary">
              Rp {book.price.toLocaleString("id-ID")}
            </p>
          </div>

          <Separator />

          {/* Description */}
          {book.description && (
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                Deskripsi
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {book.description}
              </p>
            </div>
          )}

          <Separator />

          <Button
            size="lg"
            className="w-full gap-2"
            disabled={book.stock === 0}
            onClick={addToCart}
          >
            <ShoppingCart className="h-5 w-5" />
            {book.stock === 0
              ? "Stok Habis"
              : "Tambah ke Keranjang"}
          </Button>
        </div>
      </div>
    </div>
  );
}
