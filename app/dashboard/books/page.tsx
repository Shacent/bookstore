"use client";

import useSWR, { mutate } from "swr";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookSchema, BookSchema } from "@/lib/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/data-table";
import { useBookColumns } from "./column";
import { toast } from "sonner";
import { BookOpen, Plus } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * BooksAdminPage — admin CRUD buku.
 * DataTable + form tambah buku baru.
 */
export default function BooksAdminPage() {
  const { data: books, isLoading } = useSWR("/api/books", fetcher);
  const { data: categories } = useSWR("/api/categories", fetcher);
  const columns = useBookColumns(categories || []);

  const form = useForm<BookSchema>({
    resolver: zodResolver(bookSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      author: "",
      price: 0,
      stock: 0,
      categoryId: "",
      description: "",
      imageUrl: "",
    },
  });

  const onSubmit = async (values: BookSchema) => {
    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || "Gagal menambah buku.");
      return;
    }
    toast.success("Buku berhasil ditambahkan.");
    mutate("/api/books");
    form.reset();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-8 w-8" />
          Manajemen Buku
        </h1>
        <p className="text-muted-foreground mt-2">
          Kelola data buku. Total: {books?.length || 0} buku
        </p>
      </div>
      <Separator />

      {/* DataTable */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Buku</CardTitle>
          <CardDescription>
            Semua buku yang tersedia di katalog
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={books || []}
            filterColumn="title"
            filterPlaceholder="Filter judul..."
          />
        </CardContent>
      </Card>

      {/* Form Tambah */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Tambah Buku Baru
          </CardTitle>
          <CardDescription>
            Isi data buku untuk ditambahkan ke katalog
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <FieldGroup>
              <Controller
                control={form.control}
                name="title"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Judul Buku</FieldLabel>
                    <Input {...field} placeholder="Judul buku" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="author"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Penulis</FieldLabel>
                    <Input {...field} placeholder="Nama penulis" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  control={form.control}
                  name="price"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Harga (Rp)</FieldLabel>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value))
                        }
                        placeholder="50000"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="stock"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Stok</FieldLabel>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value))
                        }
                        placeholder="10"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
              <Controller
                control={form.control}
                name="categoryId"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Kategori</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {(categories || []).map(
                          (cat: { id: string; name: string }) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="imageUrl"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>URL Gambar (opsional)</FieldLabel>
                    <Input
                      {...field}
                      placeholder="https://example.com/book-cover.jpg"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Deskripsi (opsional)</FieldLabel>
                    <Textarea
                      {...field}
                      placeholder="Deskripsi singkat buku..."
                      rows={3}
                    />
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
                ? "Menambahkan..."
                : "Tambah Buku"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
