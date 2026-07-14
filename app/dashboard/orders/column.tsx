"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { mutate } from "swr";
import { ArrowUpDown, Clock, CheckCircle2, Truck, XCircle } from "lucide-react";

/**
 * Tipe data untuk satu baris order di tabel admin.
 */
export type OrderRow = {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  user: { id: string; name: string; email: string };
  orderItems: { id: string; qty: number; price: number; book: { title: string } }[];
};

const statusOptions = [
  { value: "PENDING", label: "Menunggu" },
  { value: "PROCESSED", label: "Diproses" },
  { value: "DELIVERED", label: "Terkirim" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

const statusBadge: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }
> = {
  PENDING: { label: "Menunggu", variant: "outline", icon: Clock },
  PROCESSED: { label: "Diproses", variant: "secondary", icon: CheckCircle2 },
  DELIVERED: { label: "Terkirim", variant: "default", icon: Truck },
  CANCELLED: { label: "Dibatalkan", variant: "destructive", icon: XCircle },
};

/**
 * Kolom untuk DataTable admin pesanan.
 */
export const columns: ColumnDef<OrderRow>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => {
      const id: string = row.getValue("id");
      return <span className="font-mono text-xs">{id.slice(-8).toUpperCase()}</span>;
    },
  },
  {
    accessorKey: "user.name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Pelanggan
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-sm">{row.original.user.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.user.email}</p>
      </div>
    ),
  },
  {
    accessorKey: "orderItems",
    header: "Item",
    cell: ({ row }) => {
      const items = row.original.orderItems;
      const count = items.length;
      const titles = items.map((i) => `${i.book.title} (${i.qty})`).join(", ");
      return (
        <div>
          <p className="text-sm">{count} item</p>
          <p className="text-xs text-muted-foreground truncate max-w-[200px]" title={titles}>
            {titles}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "totalPrice",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Total
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const price = row.getValue("totalPrice") as number;
      return <span className="font-medium">Rp {price.toLocaleString("id-ID")}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status: string = row.getValue("status");
      const config = statusBadge[status] || statusBadge.PENDING;
      const Icon = config.icon;
      return (
        <Badge variant={config.variant} className="gap-1">
          <Icon className="h-3 w-3" />
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Tanggal
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date: string = row.getValue("createdAt");
      return (
        <span className="text-sm">
          {new Date(date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const order = row.original;

      const updateStatus = async (newStatus: string) => {
        const res = await fetch(`/api/orders/${order.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!res.ok) {
          const err = await res.json();
          toast.error(err.error || "Gagal mengupdate status.");
          return;
        }

        toast.success(`Status diubah menjadi "${statusOptions.find((s) => s.value === newStatus)?.label}".`);
        mutate("/api/orders?all=true");
      };

      return (
        <Select value={order.status} onValueChange={updateStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
  },
];
