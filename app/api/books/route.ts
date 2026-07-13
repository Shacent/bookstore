import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";
import { requireAdmin } from "@/lib/session";

/**
 * GET /api/books
 * List semua buku dengan dukungan search (query ?q=) dan filter kategori (?category=).
 * Dapat diakses publik (tidak perlu login).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";

    const where: Record<string, unknown> = {};

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { author: { contains: q, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    const books = await prisma.book.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(books);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/books
 * Admin membuat buku baru (termasuk upload gambar via Supabase).
 * Body: { title, author, price, stock, categoryId, description?, imageUrl? }
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();

    const book = await prisma.book.create({
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

    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
