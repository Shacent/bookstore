"use client";

import { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/client-session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { safeJsonFetch } from "@/lib/safe-json";
import { ShoppingCart, ShieldCheck, Truck, ArrowLeft } from "lucide-react";
import { useEffect } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * CheckoutPage — konfirmasi pesanan dengan metode COD (Cash on Delivery).
 * Menampilkan ringkasan order + optional notes, lalu tombol konfirmasi.
 */
export default function CheckoutPage() {
  const { user, isLoading: isLoadingSession } = useSession();
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleCheckout = async () => {
    setIsSubmitting(true);
    const res = await safeJsonFetch("/api/orders", "POST", { notes });
    setIsSubmitting(false);

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || "Gagal membuat pesanan.");
      return;
    }

    toast.success("Pesanan berhasil dibuat!");
    router.push("/orders");
  };

  if (isLoadingSession || !user) return null;

  const totalPrice =
    cartItems?.reduce(
      (sum: number, item: { qty: number; book: { price: number } }) =>
        sum + item.book.price * item.qty,
      0
    ) || 0;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Keranjang kosong</h2>
        <p className="text-muted-foreground mt-1 mb-4">
          Tidak ada item untuk dipesan.
        </p>
        <Button onClick={() => router.push("/")}>Lihat Katalog</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Item Pesanan</CardTitle>
          <CardDescription>
            {cartItems.length} item dalam pesanan Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {cartItems.map(
            (item: {
              id: string;
              qty: number;
              book: { id: string; title: string; price: number };
            }) => (
              <div
                key={item.id}
                className="flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-sm">{item.book.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.qty} x Rp {item.book.price.toLocaleString("id-ID")}
                  </p>
                </div>
                <p className="font-medium text-sm">
                  Rp{" "}
                  {(item.book.price * item.qty).toLocaleString("id-ID")}
                </p>
              </div>
            )
          )}
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">
              Rp {totalPrice.toLocaleString("id-ID")}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Payment method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Metode Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 border rounded-lg bg-primary/5 border-primary/20">
            <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
            <div>
              <p className="font-semibold">
                Cash on Delivery (COD)
              </p>
              <p className="text-sm text-muted-foreground">
                Bayar tunai saat pesanan sampai di tempat Anda.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Catatan (Opsional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Contoh: alamat lengkap, warna, atau instruksi khusus..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={500}
          />
        </CardContent>
      </Card>

      {/* Confirm */}
      <Button
        size="lg"
        className="w-full gap-2"
        onClick={handleCheckout}
        disabled={isSubmitting}
      >
        <ShieldCheck className="h-5 w-5" />
        {isSubmitting
          ? "Memproses Pesanan..."
          : `Konfirmasi Pesanan — Rp ${totalPrice.toLocaleString("id-ID")}`}
      </Button>
    </div>
  );
}
