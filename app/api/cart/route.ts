import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";
import { requireUser } from "@/lib/session";

/**
 * GET /api/cart
 * Mendapatkan isi keranjang user yang sedang login.
 */
export async function GET() {
  try {
    const session = await requireUser();
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        book: { include: { category: true } },
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(cartItems);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/cart
 * Menambahkan buku ke keranjang. Body: { bookId, qty? }
 * Jika buku sudah ada di keranjang, qty akan ditambah.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireUser();
    const body = await request.json();
    const qty = body.qty || 1;

    // Cek stok buku
    const book = await prisma.book.findUnique({ where: { id: body.bookId } });
    if (!book) {
      return NextResponse.json({ error: "Buku tidak ditemukan." }, { status: 404 });
    }
    if (book.stock < qty) {
      return NextResponse.json(
        { error: "Stok buku tidak mencukupi." },
        { status: 400 }
      );
    }

    // Upsert: jika sudah ada, tambah qty
    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId: body.bookId,
        },
      },
    });

    if (existing) {
      const newQty = existing.qty + qty;
      if (newQty > book.stock) {
        return NextResponse.json(
          { error: "Stok buku tidak mencukupi untuk jumlah yang diminta." },
          { status: 400 }
        );
      }
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { qty: newQty },
        include: { book: { include: { category: true } } },
      });
      return NextResponse.json(updated);
    }

    const cartItem = await prisma.cartItem.create({
      data: {
        userId: session.user.id,
        bookId: body.bookId,
        qty,
      },
      include: { book: { include: { category: true } } },
    });

    return NextResponse.json(cartItem, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
