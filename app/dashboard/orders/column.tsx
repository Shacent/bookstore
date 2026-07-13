"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/app/generated/prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { mutate } from "swr";

/**
 * Status badge config — warna dan label per status.
 */
const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "success" | "warning" | "destructive";
  }
> = {
  PENDING: { label: "Menunggu", variant: "warning" },
  PROCESSED: { label: "Diproses", variant: "secondary" },
  DELIVERED: { label: "Terkirim", variant: "success" },
  CANCELLED: { label: "Dibatalkan", variant: "destructive" },
};

const statusOptions = ["PENDING", "PROCESSED", "DELIVERED", "CANCELLED"];

/**
 * Column definitions untuk tabel data pesanan di admin.
 * Termasuk select dropdown untuk update status pesanan.
 */
export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      return (
        <span className="font-mono text-xs">
          #{id.slice(-8).toUpperCase()}
        </span>
      );
    },
  },
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => {
      const user = row.getValue("user") as { name: string; email: string };
      return (
        <div>
          <p className="font-medium text-sm">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
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
      return `Rp ${price.toLocaleString("id-ID")}`;
    },
  },
  {
    accessorKey: "items",
    header: "Item",
    cell: ({ row }) => {
      const items = row.getValue("items") as { qty: number }[];
      return `${items.reduce((sum, i) => sum + i.qty, 0)} item`;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const config = statusConfig[status] || statusConfig.PENDING;
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
  {
    id: "updateStatus",
    header: "Update Status",
    cell: ({ row }) => {
      const order = row.original;
      const currentStatus = order.status;

      const updateStatus = async (newStatus: string) => {
        const res = await fetch(`/api/orders/${order.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) {
          toast.error("Gagal mengupdate status.");
          return;
        }
        toast.success(`Status diubah ke ${statusConfig[newStatus]?.label}.`);
        mutate("/api/orders?all=true");
      };

      return (
        <Select
          value={currentStatus}
          onValueChange={updateStatus}
          disabled={currentStatus === "DELIVERED" || currentStatus === "CANCELLED"}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((s) => (
              <SelectItem
                key={s}
                value={s}
                disabled={s === currentStatus}
              >
                {statusConfig[s]?.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Tanggal",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      return new Date(date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    },
  },
];
