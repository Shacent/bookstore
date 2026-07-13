"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterSchema } from "@/lib/zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuthSubmit } from "@/hooks/use-auth-submit";
import Loading from "@/components/loading";
import { useSession } from "@/lib/client-session";
import { Separator } from "@/components/ui/separator";
import { EyeIcon, EyeOffIcon, BookOpen } from "lucide-react";
import Link from "next/link";

/**
 * RegisterPage — halaman registrasi user baru.
 * Menggunakan pola yang sama dengan LoginPage: react-hook-form + zod + useAuthSubmit.
 */
export default function RegisterPage() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const router = useRouter();
  const { user, isLoading } = useSession();

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { handleSubmit } = useAuthSubmit("emailSignup");

  const onSubmit = async (values: RegisterSchema) => {
    const result = await handleSubmit(values);
    if (result?.success) {
      router.push("/login");
    }
  };

  useEffect(() => {
    if (user) {
      // Admin ke dashboard, user biasa ke katalog
      const redirectTo = user.role === "admin" ? "/dashboard" : "/";
      router.replace(redirectTo);
    }
  }, [user, router]);

  if (isLoading) return <Loading />;
  if (user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary font-bold text-2xl"
          >
            <BookOpen className="h-8 w-8" />
            BookStore
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Daftar Akun</h1>
          <p className="text-sm text-muted-foreground">
            Buat akun baru untuk mulai berbelanja buku.
          </p>
        </div>

        {/* Form */}
        <div className="border rounded-lg shadow-sm bg-card p-6">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <FieldGroup>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">Nama Lengkap</FieldLabel>
                    <Input
                      {...field}
                      id="name"
                      aria-invalid={fieldState.invalid}
                      placeholder="Nama Lengkap"
                      autoComplete="name"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="email"
                      aria-invalid={fieldState.invalid}
                      placeholder="user@gmail.com"
                      autoComplete="email"
                      type="email"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        id="password"
                        aria-invalid={fieldState.invalid}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        type={isPasswordVisible ? "text" : "password"}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setIsPasswordVisible((prev) => !prev)
                        }
                        className="absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent text-muted-foreground"
                      >
                        {isPasswordVisible ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="confirmPassword">
                      Konfirmasi Password
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        id="confirmPassword"
                        aria-invalid={fieldState.invalid}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        type={isConfirmPasswordVisible ? "text" : "password"}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setIsConfirmPasswordVisible((prev) => !prev)
                        }
                        className="absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent text-muted-foreground"
                      >
                        {isConfirmPasswordVisible ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <Button
              type="submit"
              disabled={
                form.formState.isSubmitting || !form.formState.isValid
              }
            >
              {form.formState.isSubmitting
                ? "Mendaftarkan..."
                : "Daftar"}
            </Button>
          </form>
        </div>

        <Separator />
        <p className="text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
