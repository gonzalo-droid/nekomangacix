'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';
import { uploadPaymentProof } from '@/lib/storage/paymentProof';

const ACCEPT = 'image/jpeg,image/png,image/webp';
const MAX_BYTES = 5 * 1024 * 1024;

interface Props {
  userId: string;
  orderId: string;
  currentUrl?: string | null;
  onUploaded?: () => void;
}

export default function PaymentProofUploader({ userId, orderId, currentUrl, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fileObjectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => {
      if (fileObjectUrl) URL.revokeObjectURL(fileObjectUrl);
    };
  }, [fileObjectUrl]);
  const preview = fileObjectUrl ?? currentUrl ?? null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      setFile(null);
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      setError('Formato no permitido. Usa JPG, PNG o WEBP.');
      setFile(null);
      return;
    }
    if (f.size > MAX_BYTES) {
      setError('El archivo supera 5MB.');
      setFile(null);
      return;
    }
    setFile(f);
  }

  async function handleConfirm() {
    if (!file) return;
    setBusy(true);
    setError(null);

    const result = await uploadPaymentProof({ userId, orderId, file });
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_proof_url: result.publicUrl,
        payment_proof_confirmed_at: now,
        status: 'confirmed',
        deposit_paid_at: now,
      })
      .eq('id', orderId);

    if (updateError) {
      setError(updateError.message);
      setBusy(false);
      return;
    }

    setConfirmed(true);
    setBusy(false);
    onUploaded?.();
  }

  if (confirmed) {
    return (
      <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50">
        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
          ✅ Comprobante recibido. Pedido confirmado automáticamente.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 space-y-3">
      <div>
        <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
          Sube tu comprobante de pago
        </p>
        <p className="text-xs text-amber-800 dark:text-amber-300/80">
          Formatos: JPG, PNG, WEBP. Máximo 5MB.
        </p>
      </div>

      {preview && (
        <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-amber-300 dark:border-amber-800/50 bg-white">
          <Image src={preview} alt="Comprobante" fill className="object-contain" unoptimized />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleFileChange}
        disabled={busy}
        className="block w-full text-xs text-gray-700 dark:text-gray-300 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-200 file:text-amber-900 hover:file:bg-amber-300 dark:file:bg-amber-800/40 dark:file:text-amber-200 disabled:opacity-50"
      />

      {error && (
        <p className="text-xs font-medium text-red-700 dark:text-red-400">{error}</p>
      )}

      {file && (
        <button
          type="button"
          onClick={handleConfirm}
          disabled={busy}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {busy ? 'Subiendo…' : '✓ Confirmar comprobante'}
        </button>
      )}
    </div>
  );
}
