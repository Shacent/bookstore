import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

/**
 * Konfigurasi font — Geist sebagai sans-serif utama, Geist Mono untuk kode.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Metadata global aplikasi BookStore.
 */
export const metadata: Metadata = {
  title: "BookStore — Toko Buku Online",
  description:
    "Aplikasi jual-beli buku sederhana dengan dua aktor (Admin & User).",
};

/**
 * RootLayout — wrapping tag <html> & <body>.
 * Toaster dari sonner diletakkan di sini agar tersedia di seluruh halaman.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
