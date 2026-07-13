import { cn } from "@/lib/utils";

/**
 * Skeleton — placeholder animasi saat konten dimuat.
 * Gunakan dengan className untuk mengatur ukuran (h-4, w-full, dsb).
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  );
}

export { Skeleton };
