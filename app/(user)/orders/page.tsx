"use client";

import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/client-session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useEffect, useState } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * Status badge config — warna & ikon per status pesanan.
 */
const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive"; icon: React.ElementType }
> = {
  PENDING: {
    label: "Menunggu",
    variant: "warning",
    icon: Clock,
  },
  PROCESSED: {
    label: "Diproses",
    variant: "secondary",
    icon: CheckCircle2,
  },
  DELIVERED: {
    label: "Terkirim",
    variant: "success",
    icon: Truck,
  },
  CANCELLED: {
    label: "Dibatalkan",
    variant: "destructive",
    icon: XCircle,
  },
};

/**
 * OrdersPage — halaman riwayat pesanan user.
 * Menampilkan list order dengan status badge & expandable detail item.
 */
export default function OrdersPage() {
  const { user, isLoading: isLoadingSession } = useSession();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: orders, isLoading } = useSWR(
    user ? "/api/orders" : null,
    fetcher
  );

  useEffect(() => {
    if (!isLoadingSession && !user) {
      toast.error("Silakan login terlebih dahulu.");
      router.push("/login");
    }
  }, [user, isLoadingSession, router]);

  if (isLoadingSession || !user) return null;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Package className="h-6 w-6" />
        Pesanan Saya
      </h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">
            Belum ada pesanan
          </h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Mulai belanja dari katalog buku.
          </p>
          <Button onClick={() => router.push("/")}>
            Lihat Katalog
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(
            (order: {
              id: string;
              status: string;
              totalPrice: number;
              createdAt: string;
              orderItems: {
                id: string;
                qty: number;
                price: number;
                book: { id: string; title: string; author: string };
              }[];
            }) => {
              const status = statusConfig[order.status] || statusConfig.PENDING;
              const StatusIcon = status.icon;
              const isExpanded = expandedId === order.id;

              return (
                <Card key={order.id}>
                  <CardHeader
                    className="cursor-pointer pb-2"
                    onClick={() => toggleExpand(order.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-base">
                          Order #
                          {order.id.slice(-8).toUpperCase()}
                        </CardTitle>
                        <Badge
                          variant={status.variant}
                          className="gap-1"
                        >
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span>
                        {new Date(order.createdAt).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </span>
                      <span>
                        {order.orderItems.length} item
                      </span>
                      <span className="font-semibold text-foreground">
                        Rp{" "}
                        {order.totalPrice.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </CardHeader>

                  {/* Expandable detail */}
                  {isExpanded && (
                    <>
                      <Separator />
                      <CardContent className="pt-4 space-y-3">
                        <h4 className="font-medium text-sm">
                          Detail Item:
                        </h4>
                        {order.orderItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center text-sm"
                          >
                            <div>
                              <p className="font-medium">
                                {item.book.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.qty} x Rp{" "}
                                {item.price.toLocaleString("id-ID")}
                              </p>
                            </div>
                            <p className="font-medium">
                              Rp{" "}
                              {(item.price * item.qty).toLocaleString(
                                "id-ID"
                              )}
                            </p>
                          </div>
                        ))}
                      </CardContent>
                    </>
                  )}
                </Card>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}
