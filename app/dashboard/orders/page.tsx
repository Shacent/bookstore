"use client";

import useSWR from "swr";
import { DataTable } from "@/components/data-table";
import { columns, type OrderRow } from "./column";
import Loading from "@/components/loading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/client-session";
import { useEffect } from "react";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * AdminOrdersPage — manajemen pesanan untuk admin.
 * Menampilkan tabel semua pesanan dengan filter, sort, dan update status inline.
 */
export default function AdminOrdersPage() {
  const { user, isLoading: isLoadingSession } = useSession();
  const router = useRouter();
  const isAdmin = user?.role === "admin" && !isLoadingSession;

  const { data: orders, isLoading } = useSWR<OrderRow[]>(
    isAdmin ? "/api/orders?all=true" : null,
    fetcher,
  );

  useEffect(() => {
    if (!isLoadingSession && !isAdmin && user) {
      toast.error("Akses ditolak. Hanya untuk Admin.");
      router.replace("/dashboard");
    }
  }, [isAdmin, isLoadingSession, user, router]);

  if (isLoadingSession || isLoading) return <Loading />;
  if (!isAdmin) return null;

  const totalOrders = orders?.length || 0;
  const pendingCount = orders?.filter((o) => o.status === "PENDING").length || 0;
  const totalRevenue =
    orders
      ?.filter((o) => o.status !== "CANCELLED")
      ?.reduce((sum, o) => sum + o.totalPrice, 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ShoppingCart className="h-8 w-8" />
          Manajemen Pesanan
        </h1>
        <p className="text-muted-foreground mt-2">
          Kelola semua pesanan — total {totalOrders} pesanan, {pendingCount} pending.
        </p>
      </div>

      <Separator />

      {/* Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pesanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pendapatan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              Rp {totalRevenue.toLocaleString("id-ID")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabel */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pesanan</CardTitle>
          <CardDescription>
            Semua pesanan dari seluruh pelanggan. Klik dropdown status untuk mengubah.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={orders || []}
            filterColumn="id"
            filterPlaceholder="Filter Order ID..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
