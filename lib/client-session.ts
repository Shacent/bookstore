"use client";

import { authClient } from "@/lib/auth-client";

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
  isCourier?: boolean;
  isAdmin?: boolean;
  adminBranchId?: string | null;
}

interface UseSessionReturn {
  user: User | null;
  session: any;
  isLoading: boolean;
  error: Error | null;
  isRefetching: boolean;
}

export function useSession(): UseSessionReturn {
  const {
    data: session,
    isPending,
    error,
    isRefetching,
  } = authClient.useSession();

  return {
    user: session?.user || null,
    session,
    isLoading: isPending,
    error: error || null,
    isRefetching,
  };
}

/**
 * Get session data directly (for use outside React components)
 * @returns Promise with session data
 */
export async function getClientSession() {
  return await authClient.getSession();
}

export async function clearSession() {
  await authClient.signOut();
}
