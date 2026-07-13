"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginSchema } from "@/lib/zod";
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
import Image from "next/image";
import { useSession } from "@/lib/client-session";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { EyeIcon, EyeOffIcon } from "lucide-react";

/**
 * LoginPage — wrapper yang membungkus LoginForm dalam Suspense boundary.
 * Diperlukan karena useSearchParams() memerlukan Suspense di Next.js.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginForm />
    </Suspense>
  );
}

/**
 * LoginForm — form login dengan email & password.
 * Menggunakan react-hook-form + zod untuk validasi.
 */
function LoginForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const { user, isLoading, isRefetching } = useSession();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { handleSubmit } = useAuthSubmit("emailSignin");

  const onSubmit = async (values: LoginSchema) => {
    await handleSubmit(values);
  };

  useEffect(() => {
    if (user) {
      // Admin ke dashboard, user biasa ke katalog
      const redirectTo = user.role === "admin" ? "/dashboard" : "/";
      router.replace(redirectTo);
    }
    if (params.get("expired") === "1") {
      toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
    }
  }, [user, router, params]);

  if (isLoading || isRefetching) return <Loading />;

  if (user && params.get("expired") !== "1") {
    return null;
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-white">
      <div className="flex justify-center flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center gap-4 justify-start font-bold text-2xl text-shadow-sm">
          <Image
            src="/images/logo.jpg"
            alt="Book Logo"
            width={100}
            height={100}
          />
          <p className="wrap-break-word leading-normal self-start">
            Book
    
            Store
          </p>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full md:max-w-md space-y-6 border-2 shadow-md rounded-lg p-10 bg-white">
            <h1 className="text-2xl font-bold text-center">Login</h1>
            <form
              id="form-login"
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
            >
              <FieldGroup>
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
                        autoComplete="off"
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
                          autoComplete="off"
                          type={isPasswordVisible ? "text" : "password"}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setIsPasswordVisible((prevState) => !prevState)
                          }
                          className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
                        >
                          {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                          <span className="sr-only">
                            {isPasswordVisible
                              ? "Sembunyikan password"
                              : "Tampilkan password"}
                          </span>
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
                {form.formState.isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </form>
            <Separator />
            <p className="text-center">
              Hubungi admin untuk mendapatkan akses login.
            </p>
          </div>
        </div>
      </div>

      <div className="hidden bg-secondary lg:flex justify-center items-center p-6">
        <Image
          src="/images/logo.jpg"
          alt="Book Logo"
          width={400}
          height={400}
          className="object-contain"
        />
      </div>
    </div>
  );
}
