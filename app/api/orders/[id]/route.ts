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

    const order = await prisma.order.update({
      where: { id },
      data: { status: body.status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { book: true } },
      },
    });

    // Jika dibatalkan, kembalikan stok
    if (body.status === "CANCELLED") {
      for (const item of order.items) {
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
