import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Shield, Truck, Users } from "lucide-react";

/**
 * AboutPage — halaman informasi tentang BookStore.
 * Konten statis, no data fetching needed.
 */
export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 text-primary">
          <BookOpen className="h-10 w-10" />
          <span className="text-3xl font-bold tracking-tight">BookStore</span>
        </div>
        <h1 className="text-2xl font-bold">Tentang Kami</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          BookStore adalah toko buku online yang menyediakan berbagai koleksi
          buku berkualitas untuk semua kalangan. Kami hadir untuk memudahkan
          Anda menemukan dan membeli buku favorit dengan mudah dan nyaman.
        </p>
      </div>

      <Separator />

      {/* Visi Misi */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Visi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Menjadi toko buku online terpercaya yang memberikan akses mudah
              ke dunia literasi bagi seluruh masyarakat Indonesia.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Misi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-muted-foreground space-y-2 list-disc pl-4">
              <li>Menyediakan koleksi buku berkualitas dan beragam</li>
              <li>Memberikan pengalaman belanja yang mudah dan aman</li>
              <li>Mendukung literasi dan minat baca masyarakat</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Keunggulan */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-center">
          Mengapa Memilih BookStore?
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="text-center space-y-2 p-4">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Koleksi Lengkap</h3>
            <p className="text-sm text-muted-foreground">
              Berbagai genre dan kategori buku tersedia untuk semua usia.
            </p>
          </div>
          <div className="text-center space-y-2 p-4">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">COD Tersedia</h3>
            <p className="text-sm text-muted-foreground">
              Bayar di tempat — praktis dan aman tanpa ribet.
            </p>
          </div>
          <div className="text-center space-y-2 p-4">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Aman & Terpercaya</h3>
            <p className="text-sm text-muted-foreground">
              Transaksi aman dengan sistem yang terenkripsi.
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Kontak */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold">Hubungi Kami</h2>
        <p className="text-muted-foreground">
          Punya pertanyaan? Kirim pesan melalui{" "}
          <a
            href="/contact"
            className="text-primary font-medium hover:underline"
          >
            halaman kontak
          </a>
          .
        </p>
      </div>
    </div>
  );
}
