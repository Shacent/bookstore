import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";
import { requireAdmin } from "@/lib/session";

/**
 * GET /api/categories
 * List semua kategori (publik — untuk filter buku).
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { books: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/categories
 * Admin menambah kategori baru. Body: { name }
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();

    const existing = await prisma.category.findUnique({
      where: { name: body.name },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Kategori dengan nama ini sudah ada." },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: { name: body.name },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
