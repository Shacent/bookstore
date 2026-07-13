"use client";

import useSWR from "swr";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Users, Tags, ShoppingCart, TrendingUp } from "lucide-react";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * StatCard — kartu statistik kecil untuk dashboard admin.
 */
function StatCard({
  title,
  value,
  icon: Icon,
  href,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  href: string;
  color: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
            {title}
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color}15` }}
            >
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

/**
 * AdminDashboard — overview statistik aplikasi.
 * Menampilkan total buku, user, kategori, pesanan, dan pendapatan.
 */
export default function AdminDashboard() {
  const { data: books } = useSWR("/api/books", fetcher);
  const { data: users } = useSWR("/api/user", fetcher);
  const { data: categories } = useSWR("/api/categories", fetcher);
  const { data: orders } = useSWR("/api/orders?all=true", fetcher);

  const isLoading = !books || !users || !categories || !orders;

  const totalRevenue =
    orders
      ?.filter((o: { status: string }) => o.status !== "CANCELLED")
      ?.reduce(
        (sum: number, o: { totalPrice: number }) => sum + o.totalPrice,
        0
      ) || 0;

  const pendingOrders =
    orders?.filter((o: { status: string }) => o.status === "PENDING")
      .length || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Ringkasan data aplikasi BookStore
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Buku"
          value={books?.length || 0}
          icon={BookOpen}
          href="/dashboard/books"
          color="#3b82f6"
        />
        <StatCard
          title="Kategori"
          value={categories?.length || 0}
          icon={Tags}
          href="/dashboard/categories"
          color="#8b5cf6"
        />
        <StatCard
          title="User Terdaftar"
          value={users?.length || 0}
          icon={Users}
          href="/dashboard/user"
          color="#10b981"
        />
        <StatCard
          title="Pesanan Pending"
          value={pendingOrders}
          icon={ShoppingCart}
          href="/dashboard/orders"
          color="#f59e0b"
        />
        <StatCard
          title="Total Pendapatan"
          value={`Rp ${totalRevenue.toLocaleString("id-ID")}`}
          icon={TrendingUp}
          href="/dashboard/orders"
          color="#ef4444"
        />
      </div>
    </div>
  );
}
