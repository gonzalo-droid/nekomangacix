'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseClient } from '@/core/supabase/client';
import AuthShell from '../AuthShell';
import SocialLoginButtons from '../SocialLoginButtons';
import { Mail, Lock, AlertCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('redirect') ?? '/profile';
  const oauthError = searchParams.get('error') === 'oauth';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(oauthError ? 'Error al iniciar sesión con proveedor externo.' : '');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createSupabaseClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('Email o contraseña incorrectos.');
    } else {
      router.push(next);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <AuthShell title="Iniciar sesión" subtitle="Ingresa para ver tus pedidos y favoritos.">
      <SocialLoginButtons next={next} />

      <div className="flex items-center gap-3 my-5">
        <hr className="flex-1 border-gray-200 dark:border-white/10" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">o con email</span>
        <hr className="flex-1 border-gray-200 dark:border-white/10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="••••••••"
          autoComplete="current-password"
          required
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
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        ¿No tienes cuenta?{' '}
        <Link href="/auth/register" className="font-semibold text-[#ec4899] hover:underline">
          Regístrate
        </Link>
      </p>
    </AuthShell>
  );
}

// Campo de entrada compartido — evita repetir label+input+icon
interface InputFieldProps {
  id: string;
  type: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
}

export function InputField({
  id, type, label, icon: Icon, value, onChange, placeholder,
  autoComplete, required, minLength,
}: InputFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/30 focus:border-[#06b6d4]"
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
