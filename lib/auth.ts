import { betterAuth, BetterAuthOptions } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import prisma from "@/lib/prisma";

const options = {
  plugins: [],
} satisfies BetterAuthOptions;

export const auth = betterAuth({
  ...options,
  baseURL: "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    process.env.BETTER_AUTH_URL,
  ].filter(Boolean) as string[],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  session: {
    expiresIn: 14 * 24 * 60 * 60,
    updateAge: 1 * 24 * 60 * 60,
    freshAge: 0,
    cookieCache: {
      enabled: true,
      maxAge: 1 * 24 * 60 * 60,
    },
  },
  plugins: [nextCookies(), admin()],
});
