"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { User } from "@/app/generated/prisma/client";

import { Edit, Trash, ArrowUpDown, EyeOffIcon, EyeIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editUserSchema, EditUserSchema } from "@/lib/zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { mutate } from "swr";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const account = row.original;

      const handleDeleteUser = async () => {
        const { error } = await authClient.admin.removeUser({
          userId: account.id,
        });
        if (error) {
          toast.error("Gagal menghapus user.");
          return;
        }
        toast.success("User berhasil dihapus.");
        mutate("/api/user");
      };

      const handleEditUser = async (data: EditUserSchema) => {
        if (data.newPassword && data.confirmNewPassword) {
          const { error } = await authClient.admin.updateUser(
            {
              userId: account.id,
              data: {
                name: data.name,
                email: data.email,
                role: "admin",
              },
            },
            {
              onSuccess: async () => {
                const { error: passwordError } =
                  await authClient.admin.setUserPassword({
                    userId: account.id,
                    newPassword: data.newPassword!,
                  });

                if (passwordError) {
                  toast.error(
                    passwordError.message || "Gagal memperbarui password."
                  );
                  return;
                }
              },
            }
          );

          if (error) {
            toast.error("Gagal memperbarui user.");
            return;
          }
          toast.success("User berhasil diperbarui.");
          mutate("/api/user");
        } else {
          const { error } = await authClient.admin.updateUser({
            userId: account.id,
            data: {
              name: data.name,
              email: data.email,
              role: "admin",
            },
          });

          if (error) {
            toast.error("Gagal memperbarui user.");
            return;
          }
          toast.success("User berhasil diperbarui.");
          mutate("/api/user");
        }
      };

      return (
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                onSelect={(e) => e.preventDefault()}
                className="text-red-500 justify-between"
              >
                <Trash color="red" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-106.25">
              <DialogHeader>
                <DialogTitle>Konfirmasi Hapus</DialogTitle>
                <DialogDescription>
                  Apakah kamu yakin ingin menghapus akun ini? Tindakan ini tidak
                  bisa dibatalkan.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Batal</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteUser();
                  }}
                >
                  Konfirmasi
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                onSelect={(e) => e.preventDefault()}
                className="text-green-600 justify-between"
              >
                <Edit color="green" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-106.25">
              <DialogHeader>
                <DialogTitle>Edit Data User</DialogTitle>
                <DialogDescription>
                  Ubah informasi user di bawah ini.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="w-full p-4">
                <EditUserForm user={account} onSave={handleEditUser} />
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
  },
];

function EditUserForm({
  user,
  onSave,
}: {
  user: User;
  onSave: (data: EditUserSchema) => Promise<void>;
}) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const form = useForm<EditUserSchema>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: "admin",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async (values: EditUserSchema) => {
    await onSave(values);
  };

  return (
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="newPassword"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Password Baru</FieldLabel>
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="confirmNewPassword"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Konfirmasi Password Baru
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
                  {isConfirmPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                  <span className="sr-only">
                    {isConfirmPasswordVisible
                      ? "Sembunyikan password"
                      : "Tampilkan password"}
                  </span>
                </Button>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <Button
        type="submit"
        disabled={
          form.formState.isSubmitting ||
          !form.formState.isValid ||
          !form.formState.isDirty
        }
      >
        {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
      </Button>
    </form>
  );
}
