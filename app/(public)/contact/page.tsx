"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, ContactSchema } from "@/lib/zod";
import { useSession } from "@/lib/client-session";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Send } from "lucide-react";
import { useEffect } from "react";

/**
 * ContactPage — form "Contact to Admin" untuk user yang sudah login.
 * User harus login dulu untuk mengirim pesan.
 */
export default function ContactPage() {
  const { user, isLoading } = useSession();
  const router = useRouter();

  const form = useForm<ContactSchema>({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
    defaultValues: {
      message: "",
    },
  });

  useEffect(() => {
    if (!isLoading && !user) {
      toast.error("Silakan login terlebih dahulu.");
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const onSubmit = async (values: ContactSchema) => {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || "Gagal mengirim pesan.");
      return;
    }
    toast.success("Pesan berhasil dikirim ke admin.");
    form.reset();
  };

  if (isLoading || !user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-8 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Kontak Admin
          </CardTitle>
          <CardDescription>
            Kirim pertanyaan, saran, atau masukan kepada admin BookStore.
            Kami akan merespon secepatnya.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <Controller
              control={form.control}
              name="message"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="message">Pesan Anda</FieldLabel>
                  <Textarea
                    {...field}
                    id="message"
                    aria-invalid={fieldState.invalid}
                    placeholder="Tulis pesan Anda di sini..."
                    rows={6}
                  />
                  <div className="flex justify-between items-center">
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : (
                      <span />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {field.value?.length || 0}/1000
                    </span>
                  </div>
                </Field>
              )}
            />

            <Button
              type="submit"
              disabled={
                form.formState.isSubmitting || !form.formState.isValid
              }
              className="w-full gap-2"
            >
              <Send className="h-4 w-4" />
              {form.formState.isSubmitting
                ? "Mengirim..."
                : "Kirim Pesan"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
