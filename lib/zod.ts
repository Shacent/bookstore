import { z } from "zod";

// ─── Auth ────────────────────────────────────────────────────────────────────

/** Schema validasi login — email valid + password minimal 8 karakter */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi.")
    .email("Format email tidak valid."),
  password: z
    .string()
    .min(1, "Password wajib diisi.")
    .min(8, "Password harus memiliki panjang minimal 8 karakter."),
});

export type LoginSchema = z.infer<typeof loginSchema>;

/** Schema validasi registrasi — nama, email, password + konfirmasi */
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nama lengkap wajib diisi.")
      .min(3, "Nama minimal 3 karakter."),
    email: z
      .string()
      .min(1, "Email wajib diisi.")
      .email("Format email tidak valid."),
    password: z
      .string()
      .min(1, "Password wajib diisi.")
      .min(8, "Password harus memiliki panjang minimal 8 karakter."),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password dan konfirmasi tidak cocok.",
    path: ["confirmPassword"],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;

// ─── User Management ─────────────────────────────────────────────────────────

/**
 * Schema untuk membuat user baru (admin).
 * Password + konfirmasi harus cocok.
 */
export const createUserSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nama lengkap wajib diisi.")
      .min(3, "Nama minimal 3 karakter."),
    email: z
      .string()
      .min(1, "Email wajib diisi.")
      .email("Format email tidak valid."),
    password: z
      .string()
      .min(1, "Password wajib diisi.")
      .min(8, "Password harus memiliki panjang minimal 8 karakter."),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi."),
    role: z.enum(["admin", "user"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password dan konfirmasi tidak cocok.",
    path: ["confirmPassword"],
  });

export type CreateUserSchema = z.infer<typeof createUserSchema>;

/**
 * Schema untuk edit user (admin).
 * Password baru bersifat opsional — hanya divalidasi jika diisi.
 */
export const editUserSchema = z
  .object({
    id: z.string().min(1),
    name: z
      .string()
      .min(1, "Nama lengkap wajib diisi.")
      .min(3, "Nama minimal 3 karakter."),
    email: z
      .string()
      .min(1, "Email wajib diisi.")
      .email("Format email tidak valid."),
    role: z.enum(["admin", "user"]),
    newPassword: z.string().optional(),
    confirmNewPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // Jika salah satu password diisi, yang lain juga harus diisi
      if (data.newPassword || data.confirmNewPassword) {
        return (
          data.newPassword &&
          data.newPassword.length >= 8 &&
          data.newPassword === data.confirmNewPassword
        );
      }
      return true;
    },
    {
      message:
        "Password baru harus minimal 8 karakter dan cocok dengan konfirmasi.",
      path: ["confirmNewPassword"],
    }
  );

export type EditUserSchema = z.infer<typeof editUserSchema>;

// ─── Category ────────────────────────────────────────────────────────────────

/** Schema validasi kategori buku */
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Nama kategori wajib diisi.")
    .min(2, "Nama kategori minimal 2 karakter.")
    .max(50, "Nama kategori maksimal 50 karakter."),
});

export type CategorySchema = z.infer<typeof categorySchema>;

// ─── Book ────────────────────────────────────────────────────────────────────

/** Schema validasi data buku */
export const bookSchema = z.object({
  title: z
    .string()
    .min(1, "Judul buku wajib diisi.")
    .max(200, "Judul maksimal 200 karakter."),
  author: z
    .string()
    .min(1, "Nama penulis wajib diisi.")
    .max(100, "Nama penulis maksimal 100 karakter."),
  price: z
    .number({ message: "Harga harus berupa angka." })
    .positive("Harga harus lebih dari 0.")
    .int("Harga harus bilangan bulat."),
  stock: z
    .number({ message: "Stok harus berupa angka." })
    .int("Stok harus bilangan bulat.")
    .nonnegative("Stok tidak boleh negatif."),
  categoryId: z.string().min(1, "Kategori wajib dipilih."),
  description: z
    .string()
    .max(2000, "Deskripsi maksimal 2000 karakter.")
    .optional()
    .or(z.literal("")),
  imageUrl: z.string().optional().or(z.literal("")),
});

export type BookSchema = z.infer<typeof bookSchema>;

// ─── Contact ─────────────────────────────────────────────────────────────────

/** Schema validasi form kontak ke admin */
export const contactSchema = z.object({
  message: z
    .string()
    .min(1, "Pesan wajib diisi.")
    .min(10, "Pesan minimal 10 karakter.")
    .max(1000, "Pesan maksimal 1000 karakter."),
});

export type ContactSchema = z.infer<typeof contactSchema>;

// ─── Checkout ────────────────────────────────────────────────────────────────

/** Schema validasi checkout (COD) */
export const checkoutSchema = z.object({
  notes: z
    .string()
    .max(500, "Catatan maksimal 500 karakter.")
    .optional()
    .or(z.literal("")),
});

export type CheckoutSchema = z.infer<typeof checkoutSchema>;

// ─── Order Status ────────────────────────────────────────────────────────────

/** Schema untuk update status pesanan (admin) */
export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(["PENDING", "PROCESSED", "DELIVERED", "CANCELLED"], {
    message: "Status tidak valid.",
  }),
});

export type UpdateOrderStatusSchema = z.infer<typeof updateOrderStatusSchema>;
