"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { FieldError as HookFieldError } from "react-hook-form";

/**
 * FieldGroup — pembungkus vertical stack untuk beberapa Field.
 * Memberi jarak antar field secara konsisten.
 */
function FieldGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="field-group"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  );
}

/**
 * Field — wrapper untuk sebuah input + label + error message.
 * Gunakan `data-invalid="true"` untuk menandai state error.
 */
function Field({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="field"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  );
}

/**
 * FieldLabel — label yang terhubung dengan input.
 * Dibangun di atas <label> native agar klik label fokus ke input.
 */
function FieldLabel({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      data-slot="field-label"
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none",
        className
      )}
      {...props}
    />
  );
}

/**
 * FieldError — menampilkan pesan error dari react-hook-form.
 * Menerima array error objects dari react-hook-form.
 */
function FieldError({ errors }: { errors: (HookFieldError | undefined)[] }) {
  const messages = errors
    .filter(Boolean)
    .map((e) => e!.message)
    .filter(Boolean);

  if (messages.length === 0) return null;

  return (
    <p
      data-slot="field-error"
      className="text-sm text-destructive animate-in slide-in-from-top-1"
      role="alert"
    >
      {messages.join(", ")}
    </p>
  );
}

export { FieldGroup, Field, FieldLabel, FieldError };
