"use client";

import { useState, useCallback } from "react";
import useSWR, { mutate } from "swr";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/client-session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { safeJsonFetch } from "@/lib/safe-json";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  PackageOpen,
} from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * CartPage — halaman keranjang belanja user.
 * Menampilkan list item, kontrol qty, total harga, dan tombol checkout.
 *
 * Menggunakan useRef untuk mencegah race condition saat update qty —
 * hanya satu operasi per item dalam satu waktu.
 */
export default function CartPage() {
  const { user, isLoading: isLoadingSession } = useSession();
  const router = useRouter();
  /** Set item ID yang sedang diproses (PATCH / DELETE) — state agar reaktif */
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());

  const lock = useCallback((id: string) => {
    setLoadingItems((prev) => new Set(prev).add(id));
  }, []);
  const unlock = useCallback((id: string) => {
    setLoadingItems((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const { data: cartItems, isLoading } = useSWR(
    user ? "/api/cart" : null,
    fetcher
  );

  useEffect(() => {
    if (!isLoadingSession && !user) {
      toast.error("Silakan login terlebih dahulu.");
      router.push("/login");
    }
  }, [user, isLoadingSession, router]);

  /** Update qty item — cegah concurrent call untuk item yang sama */
  const updateQty = useCallback(async (itemId: string, newQty: number) => {
    lock(itemId);
    try {
      if (newQty < 1) {
        await removeItem(itemId);
        return;
      }
      const res = await safeJsonFetch(`/api/cart/${itemId}`, "PATCH", {
        qty: newQty,
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Gagal update quantity.");
        return;
      }
      mutate("/api/cart");
    } finally {
      unlock(itemId);
    }
  }, [lock, unlock]);

  /** Hapus item dari keranjang */
  const removeItem = useCallback(async (itemId: string) => {
    lock(itemId);
    try {
      const res = await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
      if (!res.ok) {
        // 404 = sudah dihapus, refresh saja
        if (res.status === 404) {
          mutate("/api/cart");
          return;
        }
        toast.error("Gagal menghapus item.");
        return;
      }
      mutate("/api/cart");
      toast.success("Item dihapus dari keranjang.");
    } finally {
      unlock(itemId);
    }
  }, [lock, unlock]);

  if (isLoadingSession || !user) return null;

  const totalPrice =
    cartItems?.reduce(
      (sum: number, item: { qty: number; book: { price: number } }) =>
        sum + item.book.price * item.qty,
      0
    ) || 0;

  const totalItems =
    cartItems?.reduce(
      (sum: number, item: { qty: number }) => sum + item.qty,
      0
    ) || 0;

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <ShoppingCart className="h-6 w-6" />
        Keranjang Belanja
      </h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border rounded-lg">
              <Skeleton className="h-20 w-16 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : !cartItems || cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <PackageOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">
            Keranjang kosong
          </h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Tambahkan buku dari katalog untuk mulai berbelanja.
          </p>
          <Button onClick={() => router.push("/")}>
            Lihat Katalog
          </Button>
        </div>
      ) : (
        <>
          {/* Cart items */}
          <div className="space-y-4">
            {cartItems.map(
              (item: {
                id: string;
                qty: number;
                book: {
                  id: string;
                  title: string;
                  author: string;
                  price: number;
                  imageUrl?: string;
                  stock: number;
                };
              }) => {
                const isUpdating = loadingItems.has(item.id);
                return (
                  <Card key={item.id}>
                    <CardContent className="flex items-center gap-4 p-4">
                      {/* Book thumbnail */}
                      <Link
                        href={`/books/${item.book.id}`}
                        className="shrink-0"
                      >
                        <div className="relative h-20 w-16 bg-muted rounded overflow-hidden">
                          {item.book.imageUrl ? (
                            <Image
                              src={item.book.imageUrl}
                              alt={item.book.title}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <ShoppingCart className="h-6 w-6 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Book info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/books/${item.book.id}`}
                          className="font-medium hover:text-primary transition-colors line-clamp-1"
                        >
                          {item.book.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {item.book.author}
                        </p>
                        <p className="text-sm font-semibold text-primary mt-0.5">
                          Rp {item.book.price.toLocaleString("id-ID")}
                        </p>
                      </div>

                      {/* Qty controls — disabled saat update sedang berjalan */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={isUpdating || item.qty <= 0}
                          onClick={() =>
                            updateQty(item.id, item.qty - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {isUpdating ? "…" : item.qty}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={
                            isUpdating || item.qty >= item.book.stock
                          }
                          onClick={() =>
                            updateQty(item.id, item.qty + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Remove */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        disabled={isUpdating}
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              }
            )}
          </div>

          {/* Summary & Checkout */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Belanja</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Total Item
                </span>
                <span className="font-medium">{totalItems} item</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">
                  Rp {totalPrice.toLocaleString("id-ID")}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={() => router.push("/checkout")}
              >
                Checkout (COD)
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
}
