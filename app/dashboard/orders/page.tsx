"use client";

import useSWR from "swr";
import { DataTable } from "@/components/data-table";
import { columns } from "./column";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * OrdersAdminPage — admin melihat & mengelola semua pesanan.
 * DataTable dengan filter + select dropdown untuk update status.
 */
export default function OrdersAdminPage() {
  const { data: orders, isLoading } = useSWR(
    "/api/orders?all=true",
    fetcher
  );

  const totalRevenue =
    orders
      ?.filter((o: { status: string }) => o.status !== "CANCELLED")
      ?.reduce(
        (sum: number, o: { totalPrice: number }) => sum + o.totalPrice,
        0
      ) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ShoppingCart className="h-8 w-8" />
          Manajemen Pesanan
        </h1>
        <p className="text-muted-foreground mt-2">
          Kelola semua pesanan. Total pendapatan: Rp{" "}
          {totalRevenue.toLocaleString("id-ID")}
        </p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pesanan</CardTitle>
          <CardDescription>
            Semua pesanan dari seluruh user. Gunakan dropdown untuk update
            status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={orders || []}
            filterColumn="id"
            filterPlaceholder="Filter order ID..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
