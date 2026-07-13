import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";
import { requireAdmin } from "@/lib/session";

/**
 * GET /api/books/[id]
 * Mendapatkan detail satu buku (publik).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const book = await prisma.book.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!book) {
      return NextResponse.json({ error: "Buku tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(book);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/books/[id]
 * Admin mengupdate data buku.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const book = await prisma.book.update({
      where: { id },
      data: {
        title: body.title,
        author: body.author,
        price: body.price,
        stock: body.stock,
        categoryId: body.categoryId,
        description: body.description || null,
        imageUrl: body.imageUrl || null,
      },
      include: { category: true },
    });

    return NextResponse.json(book);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/books/[id]
 * Admin menghapus buku.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.book.delete({ where: { id } });

    return NextResponse.json({ message: "Buku berhasil dihapus." });
  } catch (error) {
    return handleApiError(error);
  }
}
