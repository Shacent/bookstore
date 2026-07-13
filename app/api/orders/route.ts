import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";
import { requireUser, requireAdmin } from "@/lib/session";

/**
 * GET /api/orders
 * User: melihat pesanan sendiri. Admin: melihat semua pesanan (?all=true).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const showAll = searchParams.get("all") === "true";

    if (showAll) {
      await requireAdmin();
      const orders = await prisma.order.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { include: { book: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(orders);
    }

    const session = await requireUser();
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: { include: { book: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/orders
 * User checkout: membuat pesanan dari isi keranjang (COD).
 * Body: { notes? }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireUser();
    const body = await request.json();

    // Ambil semua item keranjang user
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { book: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: "Keranjang kosong." },
        { status: 400 }
      );
    }

    // Validasi stok & hitung total
    let totalPrice = 0;
    for (const item of cartItems) {
      if (item.book.stock < item.qty) {
        return NextResponse.json(
          { error: `Stok "${item.book.title}" tidak mencukupi.` },
          { status: 400 }
        );
      }
      totalPrice += item.book.price * item.qty;
    }

    // Buat order dalam transaksi
    const order = await prisma.$transaction(async (tx) => {
      // Buat order
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          totalPrice,
          notes: body.notes || null,
          items: {
            create: cartItems.map((item) => ({
              bookId: item.bookId,
              qty: item.qty,
              price: item.book.price,
            })),
          },
        },
        include: {
          items: { include: { book: true } },
        },
      });

      // Kurangi stok buku
      for (const item of cartItems) {
        await tx.book.update({
          where: { id: item.bookId },
          data: { stock: { decrement: item.qty } },
        });
      }

      // Hapus semua item keranjang user
      await tx.cartItem.deleteMany({
        where: { userId: session.user.id },
      });

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
