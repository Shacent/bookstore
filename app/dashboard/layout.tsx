"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/client-session";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useEffect } from "react";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Tags,
  ShoppingCart,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Menu item untuk sidebar admin.
 * Mengikuti pola navigasi Odoo backend — ikon + label.
 */
const adminNavItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/categories",
    label: "Kategori",
    icon: Tags,
  },
  {
    href: "/dashboard/books",
    label: "Buku",
    icon: BookOpen,
  },
  {
    href: "/dashboard/user",
    label: "User",
    icon: Users,
  },
  {
    href: "/dashboard/orders",
    label: "Pesanan",
    icon: ShoppingCart,
  },
];

/**
 * DashboardLayout — sidebar navigasi ala Odoo untuk panel admin.
 * Hanya bisa diakses oleh role ADMIN.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isAdmin = user?.role === "admin";

  // Lock body scroll agar tidak muncul double scrollbar
  useEffect(() => {
    if (isAdmin) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isAdmin]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAdmin) {
      if (user) {
        // Logged in but not admin — unauthorized
        toast.error("Akses ditolak. Hanya untuk Admin.");
        router.replace("/");
      } else {
        // Not logged in — redirect to login silently
        router.replace("/login");
      }
    }
  }, [isAdmin, isLoading, user, router]);

  const handleLogout = async () => {
    await authClient.signOut();
    toast.success("Berhasil logout.");
    router.replace("/login");
  };

  if (isLoading) return <Loading />;
  if (!isAdmin) return null;

  const userInitials = (user?.name || "A")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 shrink-0",
          sidebarCollapsed ? "w-[70px]" : "w-[240px]"
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
          {!sidebarCollapsed && (
            <Link href="/dashboard" className="font-bold text-lg tracking-tight truncate">
              BookStore
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
          >
            {sidebarCollapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {adminNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <Separator className="bg-sidebar-border" />

        {/* User info & Logout */}
        <div className="p-3">
          <div
            className={cn(
              "flex items-center gap-3",
              sidebarCollapsed && "justify-center"
            )}
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={user?.image || undefined} />
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  Admin
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground shrink-0"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-background p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
