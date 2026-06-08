'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { createSupabaseClient } from '@/core/supabase/client';
import AuthShell from '../AuthShell';
import SocialLoginButtons from '../SocialLoginButtons';
import { InputField } from '../login/page';
import { Mail, Lock, User, AlertCircle, MailCheck } from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    setError('');

    const supabase = createSupabaseClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (authError) {
      setError(authError.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  if (success) {
    return (
      <AuthShell title="¡Revisa tu correo!" subtitle="Un último paso para activar tu cuenta.">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#ec4899]/20 to-[#06b6d4]/20 border-2 border-[#ec4899]/30 mb-5">
            <MailCheck size={28} className="text-[#ec4899]" />
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-5">
            Enviamos un enlace de confirmación a{' '}
            <strong className="text-gray-900 dark:text-white">{email}</strong>.
            <br />
            Ábrelo para activar tu cuenta.
          </p>
          <Link
            href="/auth/login"
            className="inline-block w-full py-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            Ir al login
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Crear cuenta" subtitle="Guarda favoritos, sigue tus pedidos y más.">
      <SocialLoginButtons next="/profile" />

      <div className="flex items-center gap-3 my-5">
        <hr className="flex-1 border-gray-200 dark:border-white/10" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">o con email</span>
        <hr className="flex-1 border-gray-200 dark:border-white/10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          id="full_name"
          type="text"
          label="Nombre completo"
          icon={User}
          value={fullName}
          onChange={setFullName}
          placeholder="Tu nombre"
          required
        />

        <InputField
          id="email"
          type="email"
          label="Email"
          icon={Mail}
          value={email}
          onChange={setEmail}
          placeholder="tu@email.com"
          autoComplete="email"
          required
        />

        <InputField
          id="password"
          type="password"
          label="Contraseña"
          icon={Lock}
          value={password}
          onChange={setPassword}
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
          required
          minLength={6}
        />

        {error && (
          <div className="flex gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#ec4899] to-[#f97316] text-white font-bold text-sm shadow-lg shadow-[#ec4899]/25 hover:shadow-[#ec4899]/45 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 disabled:scale-100 transition-all"
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        ¿Ya tienes cuenta?{' '}
        <Link href="/auth/login" className="font-semibold text-[#ec4899] hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </AuthShell>
  );
}
