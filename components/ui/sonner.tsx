"use client";

import { Toaster as SonnerToaster } from "sonner";

/**
 * Toaster — wrapper untuk sonner toast notifications.
 * Diletakkan sekali di root layout.
 */
function Toaster() {
  return (
    <SonnerToaster
      richColors
      closeButton
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
        },
      }}
    />
  );
}

export { Toaster };
