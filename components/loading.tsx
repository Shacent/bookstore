import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading — tampilan skeleton spinner saat halaman atau data dimuat.
 * Digunakan sebagai fallback di Suspense boundary atau conditional render.
 */
export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-muted" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">
          Memuat...
        </p>
      </div>
    </div>
  );
}

/**
 * TableSkeleton — placeholder skeleton untuk tabel data.
 * Menampilkan baris skeleton yang bisa disesuaikan jumlahnya.
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-9 w-full max-w-sm" />
      <div className="rounded-md border">
        <div className="border-b bg-muted/50 p-4">
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-24" />
            ))}
          </div>
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="border-b p-4">
            <div className="flex gap-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-20" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * CardSkeleton — placeholder skeleton untuk grid kartu.
 */
export function CardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-3">
          <Skeleton className="h-40 w-full rounded-md" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
