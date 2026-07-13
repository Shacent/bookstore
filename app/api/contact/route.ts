import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";
import { requireUser } from "@/lib/session";

/**
 * POST /api/contact
 * User mengirim pesan ke admin.
 * Body: { message }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireUser();
    const body = await request.json();

    const msg = await prisma.contactMessage.create({
      data: {
        userId: session.user.id,
        message: body.message,
      },
    });

    return NextResponse.json(msg, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
