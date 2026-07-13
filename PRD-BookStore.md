# PRD - Aplikasi BookStore
### Tugas Praktik Demonstrasi Skema Sertifikasi Junior Web Developer (020403)

| | |
|---|---|
| **Produk** | BookStore Web App |
| **Skema Sertifikasi** | Pengembang Web Pratama (Junior Web Developer) |
| **Tech Stack** | Next.js (TypeScript), Prisma ORM, Supabase (PostgreSQL + Storage), Better Auth |
| **Referensi Desain** | Odoo-inspired, minimalis & profesional |
| **Dokumen Sumber** | FR.IA.02 - TPD Tugas Praktik Demonstrasi |

---

## 1. Latar Belakang

Dokumen ini adalah PRD (Product Requirement Document) untuk membangun aplikasi **BookStore** sebagai bukti kompetensi pada dua kelompok pekerjaan uji sertifikasi:

- **Kelompok Pekerjaan 1** — Melakukan perancangan (UI/UX mockup)
- **Kelompok Pekerjaan 2** — Menulis kode sumber (implementasi aplikasi full-stack)

PRD ini dibuat agar bisa langsung dipakai sebagai *prompt context* saat membangun aplikasi dengan bantuan AI (Claude Code / Cursor / dsb), sekaligus jadi checklist saat praktik demonstrasi di depan asesor.

---

## 2. Tujuan Produk

Membangun aplikasi jual-beli buku sederhana dengan dua aktor (Admin & User) yang mendemonstrasikan penguasaan:

- Struktur kode terorganisir & guidelines/best practices (clean code, komentar fungsi)
- Pemrograman terstruktur (component-based di Next.js)
- Penggunaan library/komponen pre-existing (Prisma, Better Auth, shadcn/ui, dsb.)
- Eksekusi program berbasis teks, grafik, dan multimedia (gambar buku, dsb.)

---

## 3. Aktor & Peran

### 3.1 Admin
Mengontrol dan memonitor keseluruhan data buku.

| Fitur | Deskripsi |
|---|---|
| CRUD Kategori Buku | Tambah/ubah/hapus kategori (misal: Fiksi, Non-Fiksi, Komik) |
| CRUD Data Buku | Tambah/ubah/hapus buku (judul, penulis, harga, stok, kategori, gambar) |
| List User Terdaftar | Melihat daftar seluruh user yang sudah registrasi |
| List Pesanan | Melihat seluruh pesanan dari semua user, dengan status pesanan |

### 3.2 User
Melakukan pembelian buku.

| Fitur | Deskripsi |
|---|---|
| Registrasi | Sign up akun baru |
| Login | Masuk ke akun (via Better Auth) |
| Halaman About Us | Halaman informasi tentang toko |
| Contact to Admin | Kirim pesan ke admin (form kontak) |
| Pencarian Buku | Search & filter buku berdasarkan judul/kategori |
| Add to Cart | Menambahkan buku ke keranjang |
| Checkout - Payment at Delivery (COD) | Konfirmasi pesanan dengan metode bayar di tempat |

---

## 4. Tech Stack & Arsitektur

- **Frontend/Framework:** Next.js 15 (App Router) + TypeScript
- **Database:** Supabase (PostgreSQL)
- **ORM:** Prisma
- **Auth:** Better Auth (email/password, session-based, role: `ADMIN` / `USER`)
- **Storage gambar buku:** Supabase Storage
- **Styling:** Tailwind CSS + shadcn/ui, mengikuti panduan desain Odoo (lihat bagian 6)
- **Deployment (opsional):** Vercel

### Struktur Folder (disarankan, flat & rapi)
```
src/
  app/
    (auth)/login/page.tsx
    (auth)/register/page.tsx
    (public)/page.tsx                 -> landing/katalog buku
    (public)/about/page.tsx
    (public)/contact/page.tsx
    (public)/books/[id]/page.tsx      -> detail buku
    (user)/cart/page.tsx
    (user)/checkout/page.tsx
    (user)/orders/page.tsx
    (admin)/dashboard/page.tsx
    (admin)/categories/page.tsx
    (admin)/books/page.tsx
    (admin)/users/page.tsx
    (admin)/orders/page.tsx
    api/
      books/route.ts
      categories/route.ts
      cart/route.ts
      orders/route.ts
      contact/route.ts
  components/
  lib/
    prisma.ts
    auth.ts
  prisma/
    schema.prisma
```

---

## 5. Data Model (Prisma Schema - draft)

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  orders    Order[]
  messages  ContactMessage[]
}

enum Role {
  ADMIN
  USER
}

model Category {
  id    String @id @default(cuid())
  name  String @unique
  books Book[]
}

model Book {
  id          String     @id @default(cuid())
  title       String
  author      String
  price       Int
  stock       Int
  imageUrl    String?
  description String?
  categoryId  String
  category    Category   @relation(fields: [categoryId], references: [id])
  cartItems   CartItem[]
  orderItems  OrderItem[]
}

model CartItem {
  id     String @id @default(cuid())
  userId String
  bookId String
  qty    Int
  user   User   @relation(fields: [userId], references: [id])
  book   Book   @relation(fields: [bookId], references: [id])
}

model Order {
  id         String      @id @default(cuid())
  userId     String
  user       User        @relation(fields: [userId], references: [id])
  status     OrderStatus @default(PENDING)
  totalPrice Int
  createdAt  DateTime    @default(now())
  items      OrderItem[]
}

enum OrderStatus {
  PENDING
  PROCESSED
  DELIVERED
  CANCELLED
}

model OrderItem {
  id       String @id @default(cuid())
  orderId  String
  bookId   String
  qty      Int
  price    Int
  order    Order  @relation(fields: [orderId], references: [id])
  book     Book   @relation(fields: [bookId], references: [id])
}

model ContactMessage {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  message   String
  createdAt DateTime @default(now())
}
```

---

## 6. Panduan UI/UX (Referensi Odoo - Minimalis & Profesional)

- **Layout:** sidebar kiri untuk panel Admin (mengikuti pola Odoo backend), top navbar sederhana untuk halaman User
- **Warna:** 1 warna primer aksen (pilih warna yang cocok dengan identitas "toko buku", misal navy/teal/amber) + netral abu-abu untuk background, hindari warna terlalu ramai
- **Tipografi:** font sans-serif rapi (Inter/Public Sans), heading tegas, body text nyaman dibaca
- **Komponen:** card untuk list buku, table untuk data admin (kategori, user, pesanan), badge untuk status pesanan
- **Konsistensi:** spacing & radius konsisten di semua page, gunakan shadcn/ui sebagai basis komponen
- **Empty state & loading state:** wajib ada, bagian dari kesan profesional

> Mockup Figma yang sudah/akan kamu buat untuk Kelompok Pekerjaan 1 dijadikan acuan visual sebelum coding di Kelompok Pekerjaan 2.

---

## 7. Non-Functional Requirements

- Kode diberi komentar deskripsi di setiap fungsi/komponen utama (syarat unit kompetensi)
- Struktur file rapi, tidak ada duplikasi logic (DRY)
- Semua gambar/video yang dipakai bebas hak cipta (Unsplash, Pexels, atau asset buatan sendiri)
- Validasi form dasar (registrasi, login, contact, checkout)
- Role-based access: halaman `(admin)/*` hanya bisa diakses role `ADMIN`

---

## 8. Deliverables (Sesuai Instruksi Sertifikasi)

1. File rancangan/mockup UI BookStore (Figma/Canva, dsb.)
2. Source code aplikasi BookStore di GitHub (repo public/private + link diserahkan)
3. Laporan Ms. Word berisi:
   - Link GitHub aplikasi
   - Link rancangan/mockup
   - Screenshot tampilan aplikasi (tiap fitur utama)
4. Upload laporan ke https://lspmi.co.id

---

## 9. To-Do Praktikum (Time-boxed sesuai Skenario TPD)

### Kelompok Pekerjaan 1 — Perancangan UI (60 menit)
- [ ] Buat mockup low-fidelity: landing/katalog, detail buku, cart, checkout (User)
- [ ] Buat mockup dashboard, kelola kategori, kelola buku, list user, list pesanan (Admin)
- [ ] Rapikan mockup jadi 1 file Figma/Canva, siapkan link share (view access)

### Kelompok Pekerjaan 2 — Menulis Kode Sumber (180 menit)
**Setup awal**
- [ ] Init project Next.js + TypeScript, install Prisma, Supabase client, Better Auth, Tailwind + shadcn/ui
- [ ] Setup `schema.prisma` (lihat bagian 5), migrate ke Supabase
- [ ] Setup Better Auth (login/register, session, role ADMIN/USER)

**Modul User**
- [ ] Halaman Registrasi & Login
- [ ] Halaman katalog buku + pencarian/filter kategori
- [ ] Halaman detail buku
- [ ] Fitur Add to Cart + halaman Cart
- [ ] Checkout dengan metode Payment at Delivery
- [ ] Halaman About Us
- [ ] Form Contact to Admin

**Modul Admin**
- [ ] CRUD Kategori Buku
- [ ] CRUD Data Buku (dengan upload gambar ke Supabase Storage)
- [ ] List User terdaftar
- [ ] List Pesanan dari semua user + update status

**Penutup**
- [ ] Tambahkan komentar deskripsi di setiap fungsi/komponen utama
- [ ] Review kode: rapikan struktur folder, hapus kode tidak terpakai
- [ ] Push ke GitHub, tulis README singkat
- [ ] Ambil screenshot tiap fitur untuk laporan
- [ ] Susun laporan Ms. Word (link GitHub, link mockup, screenshot)
- [ ] Upload laporan ke https://lspmi.co.id

---

## 10. Mapping Unit Kompetensi -> Bukti Kerja

| Unit Kompetensi | Bukti pada Aplikasi |
|---|---|
| J.620100.005.02 - Mengimplementasikan user interface | Mockup Figma + hasil implementasi UI di Next.js |
| J.620100.010.01 - Perintah eksekusi bahasa pemrograman teks/grafik/multimedia | Render teks (data buku), gambar buku, upload media |
| J.620100.015.01 - Menyusun fungsi/file dalam organisasi rapi | Struktur folder `app/`, `components/`, `lib/` |
| J.620100.016.01 - Kode sesuai guidelines & best practices | Komentar fungsi, penamaan konsisten, TypeScript typing |
| J.620100.017.02 - Pemrograman terstruktur | Component-based architecture Next.js |
| J.620100.019.02 - Library/komponen pre-existing | Prisma, Better Auth, shadcn/ui, Supabase SDK |

---

*Dokumen ini bisa langsung ditempel sebagai context/prompt awal saat membangun aplikasi dengan bantuan AI, dan dipakai sebagai checklist saat sesi praktik demonstrasi.*
