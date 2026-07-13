"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, CategorySchema } from "@/lib/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Tags, Plus, Edit, Trash, BookOpen } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * CategoriesPage — admin CRUD kategori buku.
 * Tabel sederhana + form tambah & edit via dialog.
 */
export default function CategoriesPage() {
  const { data: categories, isLoading } = useSWR("/api/categories", fetcher);
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(
    null
  );

  // Form tambah
  const addForm = useForm<CategorySchema>({
    resolver: zodResolver(categorySchema),
    mode: "onChange",
    defaultValues: { name: "" },
  });

  // Form edit
  const editForm = useForm<CategorySchema>({
    resolver: zodResolver(categorySchema),
    mode: "onChange",
  });

  const onAdd = async (values: CategorySchema) => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || "Gagal menambah kategori.");
      return;
    }
    toast.success("Kategori berhasil ditambahkan.");
    mutate("/api/categories");
    addForm.reset();
  };

  const onEdit = async (values: CategorySchema) => {
    if (!editing) return;
    const res = await fetch(`/api/categories/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || "Gagal mengupdate kategori.");
      return;
    }
    toast.success("Kategori berhasil diupdate.");
    mutate("/api/categories");
    setEditing(null);
  };

  const onDelete = async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Gagal menghapus kategori.");
      return;
    }
    toast.success("Kategori berhasil dihapus.");
    mutate("/api/categories");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Tags className="h-8 w-8" />
          Manajemen Kategori
        </h1>
        <p className="text-muted-foreground mt-2">
          Kelola kategori buku (Fiksi, Non-Fiksi, Komik, dsb.)
        </p>
      </div>
      <Separator />

      {/* Tambah kategori */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Tambah Kategori Baru
          </CardTitle>
          <CardDescription>
            Buat kategori untuk mengelompokkan buku
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={addForm.handleSubmit(onAdd)}
            className="flex items-end gap-3"
          >
            <div className="flex-1">
              <Controller
                control={addForm.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="cat-name">
                      Nama Kategori
                    </FieldLabel>
                    <Input
                      {...field}
                      id="cat-name"
                      placeholder="misal: Fiksi"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            <Button
              type="submit"
              disabled={
                addForm.formState.isSubmitting ||
                !addForm.formState.isValid
              }
            >
              Tambah
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* List kategori */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kategori</CardTitle>
          <CardDescription>
            Total: {categories?.length || 0} kategori
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !categories || categories.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Belum ada kategori.
            </p>
          ) : (
            <div className="divide-y">
              {categories.map(
                (cat: {
                  id: string;
                  name: string;
                  _count?: { books: number };
                }) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {cat._count?.books || 0} buku
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Edit dialog */}
                      <Dialog
                        open={editing?.id === cat.id}
                        onOpenChange={(open) => {
                          if (!open) setEditing(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditing(cat);
                              editForm.setValue("name", cat.name);
                            }}
                          >
                            <Edit className="h-4 w-4 text-green-600" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Kategori</DialogTitle>
                          </DialogHeader>
                          <form
                            onSubmit={editForm.handleSubmit(onEdit)}
                            className="space-y-4"
                          >
                            <Controller
                              control={editForm.control}
                              name="name"
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor="edit-name">
                                    Nama Kategori
                                  </FieldLabel>
                                  <Input
                                    {...field}
                                    id="edit-name"
                                  />
                                  {fieldState.invalid && (
                                    <FieldError
                                      errors={[fieldState.error]}
                                    />
                                  )}
                                </Field>
                              )}
                            />
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Batal</Button>
                              </DialogClose>
                              <Button type="submit">Simpan</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>

                      {/* Hapus */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Konfirmasi Hapus</DialogTitle>
                            <DialogDescription>
                              Hapus kategori &quot;{cat.name}&quot;? Buku
                              dalam kategori ini akan kehilangan kategorinya.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Batal</Button>
                            </DialogClose>
                            <Button
                              variant="destructive"
                              onClick={() => onDelete(cat.id)}
                            >
                              Hapus
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
