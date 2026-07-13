import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";
import { requireAdmin } from "@/lib/session";

/**
 * PUT /api/categories/[id]
 * Admin mengupdate nama kategori.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const category = await prisma.category.update({
      where: { id },
      data: { name: body.name },
    });

    return NextResponse.json(category);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/categories/[id]
 * Admin menghapus kategori (buku terkait akan kehilangan relasi).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ message: "Kategori berhasil dihapus." });
  } catch (error) {
    return handleApiError(error);
  }
}
