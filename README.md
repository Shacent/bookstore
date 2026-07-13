# Skema Junior Web Developer: Membangun Aplikasi BookStore

## TODO List

### 1. Clone & Setup Awal
- [ ] Clone repository: `git clone <url-repo-ini>`
- [ ] Masuk ke folder project: `cd <nama-folder>`
- [ ] Cek versi Node.js (disarankan Node 18+ / 20+): `node -v`
- [ ] Install dependencies:
  ```bash
  npm install
  # atau: yarn install / pnpm install / bun install
  ```
- [ ] Membuat file environtment (.env)

### 2. Setup Database Supabase
- [ ] Buat akun / login di [supabase.com](https://supabase.com)
- [ ] Buat project baru di Supabase (pilih region terdekat, catat password database)
- [ ] Di dashboard Supabase → **Project Settings → Database**, salin **Connection String** (gunakan mode *Connection Pooling* untuk `DATABASE_URL` dan *Direct Connection* untuk `DIRECT_URL` jika Prisma menggunakan keduanya)
- [ ] Tambahkan ke file `.env`:
  ```
  DATABASE_URL="postgresql://...supabase pooler..."
  ```
- [ ] Tambahkan variabel better-auth secret:
  ```
  BETTER_AUTH_SECRET="isi-dengan-random-string"
  BETTER_AUTH_URL="http://localhost:3000"
  ```

### 3. Setup Prisma & Model Database
- [ ] Cek isi `prisma/schema.prisma` yang sudah ada, pahami struktur model yang tersedia
- [ ] Sesuaikan `datasource db` di `schema.prisma` agar memakai `DATABASE_URL` dari `.env`
- [ ] Tambahkan/lengkapi model **Order** sesuai kebutuhan halaman `orders`, contoh field minimal:
  - `id`, `customerName`, `product`, `quantity`, `price`, `status`, `createdAt`
- [ ] Jalankan migration ke Supabase:
  ```bash
  npx prisma migrate dev --name add_orders
  ```
- [ ] Generate Prisma Client:
  ```bash
  npx prisma generate
  ```
- [ ] Jalankan seeder untuk isi data dummy:
  ```bash
  npx prisma db seed
  ```
- [ ] Cek data lewat Prisma Studio: `npx prisma studio`

### 4. Install & Tambahkan Komponen shadcn/ui
- [ ] Inisialisasi shadcn/ui (jika belum ada `components.json`):
  ```bash
  npx shadcn@latest init
  ```
- [ ] Tambahkan komponen **Button**:
  ```bash
  npx shadcn@latest add button
  ```
  → ini akan membuat kembali `components/ui/button.tsx`
- [ ] (Opsional, untuk tabel orders) tambahkan komponen tambahan yang dibutuhkan, misal:
  ```bash
  npx shadcn@latest add table dropdown-menu badge
  ```

### 5. Membuat Ulang Auth Route
- [ ] Buat file `app/api/auth/[...all]/route.ts`
- [ ] Import instance auth (mis. dari `lib/auth.ts` — cek apakah file konfigurasi auth sudah ada di project)
- [ ] Export handler `GET` dan `POST` menggunakan handler bawaan library auth yang dipakai project, contoh pola umum (better-auth):
  ```ts
  import { auth } from "@/lib/auth";
  import { toNextJsHandler } from "better-auth/next-js";

  export const { GET, POST } = toNextJsHandler(auth);
  ```
- [ ] Test endpoint dengan mengakses `/api/auth/session` di browser/Postman setelah `npm run dev`

### 6. Membuat Ulang Halaman Orders
- [ ] Buat file `app/dashboard/orders/column.tsx`
  - Definisikan `ColumnDef<Order>[]` (menggunakan `@tanstack/react-table` jika dipakai project) sesuai field model `Order` di `schema.prisma`
  - Tambahkan kolom aksi (edit/hapus) memakai `Button` dari shadcn/ui
- [ ] Buat file `app/dashboard/orders/page.tsx`
  - Fetch data orders dari Prisma (server component) atau dari API route
  - Render menggunakan komponen tabel + `columns` yang sudah dibuat
  - Tambahkan state loading/empty state

### 7. Jalankan & Uji Coba
- [ ] Jalankan development server: `npm run dev`
- [ ] Buka [http://localhost:3000](http://localhost:3000)
- [ ] Uji login/register lewat route auth
- [ ] Buka `/dashboard/orders`, pastikan data dari Supabase tampil di tabel
- [ ] Uji tombol (Button) berfungsi (misal tambah/hapus order)

### 8. Finishing
- [ ] Cek `npm run lint` / `npm run build` tidak ada error
- [ ] Commit hasil pekerjaan: `git add . && git commit -m "feat: implement auth route, orders page, shadcn button"`
- [ ] (Opsional) push ke branch masing-masing praktikan

---

## Referensi Tools
| Kebutuhan | Tool/Library |
|---|---|
| ORM & migration | [Prisma](https://www.prisma.io/docs) |
| Database | [Supabase](https://supabase.com/docs) |
| Komponen UI | [shadcn/ui](https://ui.shadcn.com) |
| Autentikasi | Cek `package.json` untuk library auth yang digunakan (mis. better-auth) |
| Framework | [Next.js App Router](https://nextjs.org/docs) |

---

## Getting Started (bawaan Next.js)

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
