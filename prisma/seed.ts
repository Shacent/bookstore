import "dotenv/config";
import { auth } from "../lib/auth";
import prisma from "../lib/prisma";

// ─── Data Kategori ───────────────────────────────────────────────────────

const categories = [
  { name: "Fiksi" },
  { name: "Non-Fiksi" },
  { name: "Komik & Manga" },
  { name: "Edukasi & Akademik" },
  { name: "Teknologi & Pemrograman" },
  { name: "Bisnis & Motivasi" },
  { name: "Anak & Remaja" },
];

// ─── Data Buku ───────────────────────────────────────────────────────────

interface BookSeed {
  title: string;
  author: string;
  price: number;
  stock: number;
  categoryIndex: number; // index ke array categories di atas
  description: string;
  imageUrl: string;
}

const books: BookSeed[] = [
  // Fiksi
  {
    title: "Laut Bercerita",
    author: "Leila S. Chudori",
    price: 95000,
    stock: 15,
    categoryIndex: 0,
    description:
      "Novel tentang perjuangan aktivis di era reformasi 1998. Mengisahkan persahabatan, pengkhianatan, dan harapan di tengah kekacauan politik Indonesia.",
    imageUrl:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
  },
  {
    title: "Pulang",
    author: "Tere Liye",
    price: 85000,
    stock: 20,
    categoryIndex: 0,
    description:
      "Kisah seorang pemuda yang kembali ke kampung halamannya setelah bertahun-tahun merantau, menemukan makna keluarga dan jati diri.",
    imageUrl:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
  },
  {
    title: "Bumi Manusia",
    author: "Pramoedya Ananta Toer",
    price: 110000,
    stock: 10,
    categoryIndex: 0,
    description:
      "Karya sastra klasik Indonesia yang mengisahkan perjuangan Minke, seorang pemuda pribumi di era kolonial Belanda, melawan ketidakadilan dan diskriminasi.",
    imageUrl:
      "https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=400&h=600&fit=crop",
  },
  // Non-Fiksi
  {
    title: "Filosofi Teras",
    author: "Henry Manampiring",
    price: 78000,
    stock: 25,
    categoryIndex: 1,
    description:
      "Buku pengantar filsafat Stoikisme yang praktis dan relevan untuk kehidupan modern. Belajar mengelola emosi dan hidup lebih tenang.",
    imageUrl:
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop",
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    price: 120000,
    stock: 30,
    categoryIndex: 1,
    description:
      "Panduan praktis membangun kebiasaan baik dan menghilangkan kebiasaan buruk melalui perubahan kecil yang memberikan hasil luar biasa.",
    imageUrl:
      "https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=400&h=600&fit=crop",
  },
  {
    title: "Sapiens: Riwayat Singkat Umat Manusia",
    author: "Yuval Noah Harari",
    price: 135000,
    stock: 12,
    categoryIndex: 1,
    description:
      "Menelusuri sejarah umat manusia dari zaman batu hingga era modern. Buku yang mengubah cara kita memandang peradaban.",
    imageUrl:
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=600&fit=crop",
  },
  // Komik & Manga
  {
    title: "One Piece Vol. 1",
    author: "Eiichiro Oda",
    price: 45000,
    stock: 40,
    categoryIndex: 2,
    description:
      "Awal petualangan Monkey D. Luffy, seorang bajak laut muda yang bercita-cita menjadi Raja Bajak Laut. Serial manga terlaris sepanjang masa.",
    imageUrl:
      "https://images.unsplash.com/photo-1612404730960-5c71577fca11?w=400&h=600&fit=crop",
  },
  {
    title: "Naruto Vol. 1",
    author: "Masashi Kishimoto",
    price: 42000,
    stock: 35,
    categoryIndex: 2,
    description:
      "Kisah Naruto Uzumaki, ninja muda yang bercita-cita menjadi Hokage. Perjalanan penuh persahabatan, perjuangan, dan pengorbanan.",
    imageUrl:
      "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=400&h=600&fit=crop",
  },
  // Edukasi & Akademik
  {
    title: "Kamus Besar Bahasa Indonesia",
    author: "Tim Penyusun KBBI",
    price: 250000,
    stock: 8,
    categoryIndex: 3,
    description:
      "Kamus resmi bahasa Indonesia edisi terbaru. Referensi wajib untuk pelajar, mahasiswa, dan penulis.",
    imageUrl:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop",
  },
  {
    title: "Metode Penelitian Kuantitatif",
    author: "Prof. Dr. Sugiyono",
    price: 98000,
    stock: 15,
    categoryIndex: 3,
    description:
      "Buku panduan lengkap metodologi penelitian kuantitatif untuk mahasiswa S1, S2, dan S3. Dilengkapi contoh dan studi kasus.",
    imageUrl:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=600&fit=crop",
  },
  // Teknologi & Pemrograman
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    price: 150000,
    stock: 20,
    categoryIndex: 4,
    description:
      "Panduan menulis kode yang bersih, mudah dibaca, dan mudah dipelihara. Wajib dibaca oleh setiap software developer profesional.",
    imageUrl:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=600&fit=crop",
  },
  {
    title: "You Don't Know JS: Scope & Closures",
    author: "Kyle Simpson",
    price: 88000,
    stock: 18,
    categoryIndex: 4,
    description:
      "Pemahaman mendalam tentang scope dan closure di JavaScript. Buku yang mengupas tuntas konsep fundamental yang sering disalahpahami.",
    imageUrl:
      "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=600&fit=crop",
  },
  {
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    price: 175000,
    stock: 10,
    categoryIndex: 4,
    description:
      "Buku referensi tentang arsitektur sistem data modern: database, stream processing, distributed systems, dan reliability.",
    imageUrl:
      "https://images.unsplash.com/photo-1515879218367-8466d910auj1?w=400&h=600&fit=crop",
  },
  // Bisnis & Motivasi
  {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    price: 105000,
    stock: 22,
    categoryIndex: 5,
    description:
      "Memahami psikologi di balik keputusan keuangan. 19 cerita pendek tentang cara berpikir orang tentang uang dan kesuksesan.",
    imageUrl:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=600&fit=crop",
  },
  {
    title: "Start with Why",
    author: "Simon Sinek",
    price: 95000,
    stock: 15,
    categoryIndex: 5,
    description:
      "Bagaimana pemimpin hebat menginspirasi tindakan. Buku yang mengubah cara Anda berpikir tentang kepemimpinan dan bisnis.",
    imageUrl:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=600&fit=crop",
  },
  // Anak & Remaja
  {
    title: "Harry Potter and the Sorcerer's Stone",
    author: "J.K. Rowling",
    price: 115000,
    stock: 30,
    categoryIndex: 6,
    description:
      "Awal petualangan Harry Potter di Hogwarts School of Witchcraft and Wizardry. Novel fantasi yang memikat pembaca segala usia.",
    imageUrl:
      "https://images.unsplash.com/photo-1600189261867-30e5ffe7b8da?w=400&h=600&fit=crop",
  },
  {
    title: "Diary of a Wimpy Kid",
    author: "Jeff Kinney",
    price: 65000,
    stock: 25,
    categoryIndex: 6,
    description:
      "Kisah lucu Greg Heffley menghadapi kehidupan sekolah menengah. Buku bergambar yang menghibur untuk anak dan remaja.",
    imageUrl:
      "https://images.unsplash.com/photo-1511108691774-6f5892780026?w=400&h=600&fit=crop",
  },
];

// ─── Helper: Buat user via Better Auth ──────────────────────────────────

/**
 * Mendaftarkan user baru melalui Better Auth API.
 * Melempar error jika gagal (kecuali user sudah ada).
 */
async function createUser(
  email: string,
  password: string,
  name: string
): Promise<void> {
  // Cek dulu apakah user sudah ada
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`  ⏭  User "${email}" sudah ada, skip.`);
    return;
  }

  const result = await auth.api.signUpEmail({
    body: { email, password, name },
    headers: new Headers({ "content-type": "application/json" }),
    query: {},
  });

  // Periksa hasil — bisa berupa Response-like object
  if (result && typeof result === "object" && "status" in result) {
    const status = (result as { status: number }).status;
    if (status >= 400) {
      throw new Error(`Signup gagal dengan status ${status}`);
    }
  }

  console.log(`  ✓  User "${email}" berhasil dibuat.`);
}

// ─── Main Seed ───────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Memulai seeding database BookStore...\n");

  // 1. Seed users
  console.log("📦 Seeding users...");
  await createUser("admin@bookstore.com", "admin123", "Admin BookStore");
  await createUser("user@bookstore.com", "user1234", "User BookStore");

  // Set role admin untuk user admin
  await prisma.user.update({
    where: { email: "admin@bookstore.com" },
    data: { role: "admin" },
  });
  console.log("  ✓  Role admin diset untuk admin@bookstore.com\n");

  // 2. Seed categories
  console.log("📦 Seeding kategori...");
  const createdCategories: { id: string; name: string }[] = [];

  for (const cat of categories) {
    const existing = await prisma.category.findUnique({
      where: { name: cat.name },
    });
    if (existing) {
      console.log(`  ⏭  Kategori "${cat.name}" sudah ada, skip.`);
      createdCategories.push(existing);
    } else {
      const created = await prisma.category.create({ data: cat });
      console.log(`  ✓  Kategori "${cat.name}" dibuat.`);
      createdCategories.push(created);
    }
  }
  console.log();

  // 3. Seed books
  console.log("📦 Seeding buku...");
  let bookCount = 0;

  for (const book of books) {
    const cat = createdCategories[book.categoryIndex];
    if (!cat) {
      console.log(`  ⚠  Kategori index ${book.categoryIndex} tidak valid, skip "${book.title}".`);
      continue;
    }

    const existing = await prisma.book.findFirst({
      where: { title: book.title },
    });
    if (existing) {
      console.log(`  ⏭  Buku "${book.title}" sudah ada, skip.`);
      continue;
    }

    await prisma.book.create({
      data: {
        title: book.title,
        author: book.author,
        price: book.price,
        stock: book.stock,
        categoryId: cat.id,
        description: book.description,
        imageUrl: book.imageUrl,
      },
    });
    console.log(`  ✓  "${book.title}" — Rp ${book.price.toLocaleString("id-ID")}`);
    bookCount++;
  }

  console.log(`\n✅ Seeding selesai!`);
  console.log(`   ${createdCategories.length} kategori`);
  console.log(`   ${bookCount} buku baru`);
  console.log(`   2 user (admin + regular)\n`);
  console.log("🔑 Login:");
  console.log("   Admin : admin@bookstore.com / admin123");
  console.log("   User  : user@bookstore.com  / user1234\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding gagal:", e);
    process.exit(1);
  })
  .finally(() => process.exit(0));