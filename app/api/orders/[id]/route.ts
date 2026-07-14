import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";
import { requireAdmin } from "@/lib/session";

/**
 * PATCH /api/orders/[id]
 * Admin mengupdate status pesanan.
 * Body: { status: "PENDING" | "PROCESSED" | "DELIVERED" | "CANCELLED" }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    // Ambil status sebelumnya untuk cek apakah stok perlu dikembalikan
    const previous = await prisma.order.findUnique({
      where: { id },
      select: { status: true, orderItems: { select: { bookId: true, qty: true } } },
    });

    if (!previous) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan." },
        { status: 404 }
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status: body.status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: { include: { book: true } },
      },
    });

    // Kembalikan stok hanya jika berubah menjadi CANCELLED dari status lain
    if (body.status === "CANCELLED" && previous.status !== "CANCELLED") {
      for (const item of previous.orderItems) {
        await prisma.book.update({
          where: { id: item.bookId },
          data: { stock: { increment: item.qty } },
        });
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    return handleApiError(error);
  }
}
