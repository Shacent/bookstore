import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";
import { requireUser } from "@/lib/session";

/**
 * PATCH /api/cart/[id]
 * Update qty item di keranjang. Body: { qty }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUser();
    const { id } = await params;
    const body = await request.json();

    // Verifikasi kepemilikan
    const item = await prisma.cartItem.findUnique({
      where: { id },
      include: { book: true },
    });

    if (!item || item.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Item keranjang tidak ditemukan." },
        { status: 404 }
      );
    }

    if (body.qty > item.book.stock) {
      return NextResponse.json(
        { error: "Stok tidak mencukupi." },
        { status: 400 }
      );
    }

    if (body.qty <= 0) {
      // Hapus item jika qty 0
      await prisma.cartItem.delete({ where: { id } });
      return NextResponse.json({ message: "Item dihapus dari keranjang." });
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { qty: body.qty },
      include: { book: { include: { category: true } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/cart/[id]
 * Menghapus item dari keranjang.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUser();
    const { id } = await params;

    const item = await prisma.cartItem.findUnique({ where: { id } });
    if (!item || item.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Item keranjang tidak ditemukan." },
        { status: 404 }
      );
    }

    await prisma.cartItem.delete({ where: { id } });

    return NextResponse.json({ message: "Item dihapus dari keranjang." });
  } catch (error) {
    return handleApiError(error);
  }
}
