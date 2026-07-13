"use client";

import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

/**
 * useAuthSubmit — hook untuk menangani submit form autentikasi (login/register).
 * Menerima action type dari Better Auth dan mengembalikan handleSubmit.
 *
 * @param action - "emailSignin" | "emailSignup" — action Better Auth yang dipanggil
 */
export function useAuthSubmit(action: "emailSignin" | "emailSignup") {
  const handleSubmit = async (values: {
    email: string;
    password: string;
    name?: string;
  }) => {
    if (action === "emailSignup") {
      const { error } = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.name!,
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(values.name || "User")}`,
      });
      if (error) {
        toast.error(`Gagal registrasi: ${error.message}`);
        return { success: false, error };
      }
      toast.success("Registrasi berhasil! Silakan login.");
      return { success: true };
    }

    // Login
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });
    if (error) {
      toast.error(`Gagal login: ${error.message}`);
      return { success: false, error };
    }
    toast.success("Login berhasil!");
    return { success: true };
  };

  return { handleSubmit };
}
