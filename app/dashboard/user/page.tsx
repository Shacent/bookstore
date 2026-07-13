"use client";

import useSWR, { mutate } from "swr";
import { DataTable } from "@/components/data-table";
import { columns } from "./column";
import Loading from "@/components/loading";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { createUserSchema, CreateUserSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, UserPlus, EyeIcon, EyeOffIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/client-session";
import { useEffect, useState } from "react";

const Page = () => {
  const { user, isLoading } = useSession();
  const router = useRouter();
  const isUserValid = user?.role === "admin" && !isLoading;
  const { data: users, isLoading: isLoadingUsers } = useSWR(
    isUserValid ? `/api/user` : null,
  );
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const form = useForm<CreateUserSchema>({
    resolver: zodResolver(createUserSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "admin",
    },
  });

  const onSubmit = async (values: CreateUserSchema) => {
    const { error } = await authClient.admin.createUser({
      email: values.email,
      password: values.password,
      name: values.name,
      role: "admin",
      data: {
        image: `https://ui-avatars.com/api/?name=${values.name.replace(
          " ",
          "+",
        )}`,
      },
    });
    if (error) {
      toast.error(`Gagal membuat user: ${error.message}`);
    } else {
      mutate("/api/user");
      toast.success(`Berhasil membuat user baru`);
      form.reset();
    }
  };

  useEffect(() => {
    if (!isUserValid && !isLoading && user) {
      toast.error("Akses ditolak. Hanya untuk Admin.");
      router.replace("/dashboard");
    }
  }, [isUserValid, isLoading, user, router]);

  if (isLoadingUsers || isLoading) return <Loading />;

  if (!isUserValid) return null;

  const totalUsers = users?.length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-8 w-8" />
          Manajemen User
        </h1>
        <p className="text-muted-foreground mt-2">
          Kelola pengguna sistem. Total user: {totalUsers}
        </p>
      </div>
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>Daftar User</CardTitle>
          <CardDescription>
            Daftar semua pengguna yang terdaftar dalam sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={users || []}
            filterColumn="name"
            filterPlaceholder="Filter nama..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Tambah User Baru
          </CardTitle>
          <CardDescription>
            Isi formulir di bawah ini untuk menambahkan pengguna baru
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="form-login"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <FieldGroup>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Nama Lengkap</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Nama Lengkap"
                      autoComplete="off"
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
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
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
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
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
              <Controller
                control={form.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Konfirmasi Password
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                        autoComplete="off"
                        type={isConfirmPasswordVisible ? "text" : "password"}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setIsConfirmPasswordVisible((prevState) => !prevState)
                        }
                        className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
                      >
                        {isConfirmPasswordVisible ? (
                          <EyeOffIcon />
                        ) : (
                          <EyeIcon />
                        )}
                        <span className="sr-only">
                          {isConfirmPasswordVisible
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
              disabled={form.formState.isSubmitting || !form.formState.isValid}
            >
              {form.formState.isSubmitting ? "Menambahkan..." : "Tambah User"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
