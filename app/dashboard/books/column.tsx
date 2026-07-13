"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash, ArrowUpDown, BookOpen } from "lucide-react";
import type { Book } from "@/app/generated/prisma/client";
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
import { toast } from "sonner";
import { mutate } from "swr";
import { safeJsonFetch } from "@/lib/safe-json";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

/**
 * Column definitions untuk tabel data buku di admin.
 * Termasuk aksi edit (dialog) & hapus.
 */
export function useBookColumns(
  categories: { id: string; name: string }[]
): ColumnDef<Book>[] {
  return [
    {
      accessorKey: "imageUrl",
      header: "Cover",
      cell: ({ row }) => {
        const url = row.getValue("imageUrl") as string | null;
        return url ? (
          <div className="relative h-12 w-9 rounded overflow-hidden bg-muted">
            <Image
              src={url}
              alt=""
              fill
              className="object-cover"
              sizes="36px"
            />
          </div>
        ) : (
          <div className="h-12 w-9 rounded bg-muted flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-muted-foreground/40" />
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Judul
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "author",
      header: "Penulis",
    },
    {
      accessorKey: "category",
      header: "Kategori",
      cell: ({ row }) => {
        const cat = row.getValue("category") as { name: string } | null;
        return cat ? (
          <Badge variant="secondary">{cat.name}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Harga
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const price = row.getValue("price") as number;
        return `Rp ${price.toLocaleString("id-ID")}`;
      },
    },
    {
      accessorKey: "stock",
      header: "Stok",
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const book = row.original;
        return <BookActions book={book} categories={categories} />;
      },
    },
  ];
}

/**
 * BookActions — tombol edit & hapus dengan dialog.
 */
function BookActions({
  book,
  categories,
}: {
  book: Book & { category?: { name: string } | null };
  categories: { id: string; name: string }[];
}) {
  const handleDelete = async () => {
    const res = await fetch(`/api/books/${book.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Gagal menghapus buku.");
      return;
    }
    toast.success("Buku berhasil dihapus.");
    mutate("/api/books");
  };

  return (
    <div className="flex gap-2">
      {/* Delete dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="text-red-500"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Hapus buku &quot;{book.title}&quot;? Tindakan ini tidak bisa
              dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="text-green-600"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Buku</DialogTitle>
            <DialogDescription>
              Ubah informasi buku di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            <EditBookForm
              book={book}
              categories={categories}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * EditBookForm — form edit buku dalam dialog.
 * Memanfaatkan react-hook-form + zod untuk validasi.
 */
function EditBookForm({
  book,
  categories,
}: {
  book: Book & { category?: { name: string } | null };
  categories: { id: string; name: string }[];
}) {
  const form = useForm<BookSchema>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: book.title || "",
      author: book.author || "",
      price: book.price || 0,
      stock: book.stock || 0,
      categoryId: book.categoryId || "",
      description: book.description || "",
      imageUrl: book.imageUrl || "",
    },
  });

  const onSubmit = async (values: BookSchema) => {
    const res = await safeJsonFetch(`/api/books/${book.id}`, "PUT", values);
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || "Gagal mengupdate buku.");
      return;
    }
    toast.success("Buku berhasil diupdate.");
    mutate("/api/books");
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <FieldGroup>
        <Controller
          control={form.control}
          name="title"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Judul</FieldLabel>
              <Input {...field} />
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
              <Input {...field} />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={form.control}
            name="price"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Harga (Rp)</FieldLabel>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
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
                  onChange={(e) => field.onChange(Number(e.target.value))}
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
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
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
              <FieldLabel>URL Gambar</FieldLabel>
              <Input {...field} placeholder="https://..." />
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
              <FieldLabel>Deskripsi</FieldLabel>
              <Textarea {...field} rows={3} />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </FieldGroup>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Batal</Button>
        </DialogClose>
        <Button
          type="submit"
          disabled={form.formState.isSubmitting || !form.formState.isDirty}
        >
          {form.formState.isSubmitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </DialogFooter>
    </form>
  );
}
