import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ApiError } from "@/lib/errors";

export type AuthLevel = "user" | "admin";

/**
 * Get the current session and validate authorization
 * @param requiredLevel - The minimum authorization level required (optional)
 * @returns The session object
 * @throws ApiError if unauthorized
 */
export async function getSession(requiredLevel?: AuthLevel) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new ApiError("Unauthorized - Please sign in", 401);
  }

  if (!requiredLevel) {
    return session;
  }

  const userRole = session.user.role as string | undefined;

  switch (requiredLevel) {
    case "admin":
      if (!userRole?.includes("admin")) {
        throw new ApiError("Forbidden - Admin access required", 403);
      }
      break;

    case "user":
      break;

    default:
      throw new ApiError("Invalid authorization level", 500);
  }

  return session;
}

export async function requireUser() {
  return getSession("user");
}

export async function requireAdmin() {
  return getSession("admin");
}
