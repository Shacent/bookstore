"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/client-session";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  ShoppingCart,
  LogOut,
  LogIn,
  UserPlus,
  Info,
  Mail,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Navbar items untuk user (tidak login juga bisa melihat katalog & about).
 */
const publicNavItems = [
  { href: "/", label: "Katalog", icon: BookOpen },
  { href: "/about", label: "About Us", icon: Info },
];

/**
 * PublicLayout — top navbar untuk halaman publik & user.
 * Menampilkan logo, navigasi, dan user menu / cart icon.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await authClient.signOut();
    toast.success("Berhasil logout.");
    router.push("/");
  };

  const userInitials = (user?.name || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          {/* Logo & Nav */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-lg tracking-tight text-primary"
            >
              <BookOpen className="h-6 w-6" />
              BookStore
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {publicNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              {user && (
                <Link
                  href="/contact"
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === "/contact"
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <Mail className="h-4 w-4" />
                  Kontak
                </Link>
              )}
            </nav>
          </div>

          {/* User section */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <>
                {/* Cart */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/cart")}
                  className="relative text-muted-foreground hover:text-foreground"
                  title="Keranjang"
                >
                  <ShoppingCart className="h-5 w-5" />
                </Button>

                {/* Orders */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/orders")}
                  className="relative text-muted-foreground hover:text-foreground"
                  title="Pesanan Saya"
                >
                  <Package className="h-5 w-5" />
                </Button>

                {/* User avatar + dropdown sederhana */}
                <div className="flex items-center gap-2 pl-2 border-l">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.image || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block min-w-0">
                    <p className="text-sm font-medium truncate max-w-[120px]">
                      {user?.name}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-muted-foreground hover:text-foreground"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/login")}
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Login
                </Button>
                <Button size="sm" onClick={() => router.push("/register")}>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} BookStore. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
