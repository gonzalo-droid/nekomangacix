import { createSupabaseClient } from '@/core/supabase/client';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const BUCKET = 'payment-proofs';

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

type UploadResult =
  | { ok: true; path: string; publicUrl: string }
  | { ok: false; error: string };

interface UploadArgs {
  userId: string;
  orderId: string;
  file: File;
}

export async function uploadPaymentProof({ userId, orderId, file }: UploadArgs): Promise<UploadResult> {
  if (!ALLOWED_MIME.includes(file.type)) {
    return { ok: false, error: 'Formato no permitido. Usa JPG, PNG o WEBP.' };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: 'El archivo supera 5MB.' };
  }

  const ext = EXT_BY_MIME[file.type] ?? 'jpg';
  const path = `${userId}/${orderId}.${ext}`;
  const supabase = createSupabaseClient();

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });

  if (uploadError) {
    return { ok: false, error: uploadError.message };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, path, publicUrl: data.publicUrl };
}
