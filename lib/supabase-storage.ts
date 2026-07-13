import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const bucketName = process.env.SUPABASE_BUCKET_NAME!;

if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL must be set");
if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY must be set");
if (!bucketName) throw new Error("SUPABASE_BUCKET_NAME must be set");

const supabase = createClient(supabaseUrl, serviceRoleKey);

export const BUCKET_NAME = bucketName;

export async function uploadToSupabase(
  key: string,
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(key, buffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(key);
  return data.publicUrl;
}

export async function deleteFromSupabase(key: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([key]);
  if (error) throw new Error(error.message);
}

export default supabase;