'use client';

import { useState, FormEvent } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { Profile } from '@/types/database.types';

interface Props {
  profile: Profile;
}

export default function ProfileForm({ profile }: Props) {
  const [fullName, setFullName] = useState(profile.full_name ?? '');
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [street, setStreet] = useState((profile.address as Record<string, string> | null)?.street ?? '');
  const [city, setCity] = useState((profile.address as Record<string, string> | null)?.city ?? '');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('saving');

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
        address: street || city ? { street: street.trim(), city: city.trim() } : null,
      })
      .eq('id', profile.id);

    setStatus(error ? 'error' : 'saved');
    if (!error) setTimeout(() => setStatus('idle'), 3000);
  }

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2b496d] dark:focus:ring-[#5a7a9e] text-sm';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombre completo
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tu nombre"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Teléfono / WhatsApp
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="999 999 999"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Dirección de envío
        </label>
        <input
          type="text"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="Calle, número, referencia"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Ciudad / Distrito
        </label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Chiclayo, Lima, etc."
          className={inputClass}
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">
          Error al guardar. Inténtalo de nuevo.
        </p>
      )}

      {status === 'saved' && (
        <p className="text-sm text-green-600 dark:text-green-400">
          ✓ Perfil actualizado correctamente.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'saving'}
        className="w-full sm:w-auto px-8 py-2.5 bg-[#2b496d] hover:bg-[#1e3550] disabled:opacity-50 text-white font-semibold rounded-lg transition-colors text-sm"
      >
        {status === 'saving' ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  );
}
