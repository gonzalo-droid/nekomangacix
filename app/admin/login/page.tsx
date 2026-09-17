'use client';

import { Suspense, useState, FormEvent } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ShieldCheck } from 'lucide-react';

type Step =
  | { name: 'pin' }
  | { name: 'setup'; qrCodeDataUrl: string; otpauthUrl: string }
  | { name: 'code' };

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';

  const [step, setStep] = useState<Step>({ name: 'pin' });
  const [pin, setPin] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handlePinSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'PIN incorrecto. Inténtalo de nuevo.');
      setPin('');
    } else if (data.skipped2fa) {
      router.push(redirect);
      router.refresh();
    } else if (data.needsSetup) {
      setStep({ name: 'setup', qrCodeDataUrl: data.qrCodeDataUrl, otpauthUrl: data.otpauthUrl });
    } else {
      setStep({ name: 'code' });
    }
    setLoading(false);
  }

  async function handleCodeSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/auth/totp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (res.ok) {
      router.push(redirect);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || 'Código incorrecto.');
      setCode('');
    }
    setLoading(false);
  }

  if (step.name === 'pin') {
    return (
      <form onSubmit={handlePinSubmit} className="space-y-4">
        <div>
          <label htmlFor="pin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            PIN de acceso
          </label>
          <input
            id="pin"
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••"
            required
            autoFocus
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#2b496d] dark:focus:ring-[#5a7a9e] transition"
          />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading || !pin}
          className="w-full py-3 bg-[#2b496d] hover:bg-[#1e3550] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          {loading ? 'Verificando...' : 'Continuar'}
        </button>
      </form>
    );
  }

  if (step.name === 'setup') {
    return (
      <form onSubmit={handleCodeSubmit} className="space-y-4">
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Primera vez: escaneá este código con Google Authenticator (o cualquier app TOTP) y confirmá con el código que te muestre.
          </p>
          <div className="flex justify-center">
            <Image src={step.qrCodeDataUrl} alt="Código QR para configurar 2FA" width={200} height={200} className="rounded-lg border border-gray-200 dark:border-gray-700" unoptimized />
          </div>
          <details className="text-xs text-gray-400">
            <summary className="cursor-pointer">¿No podés escanear?</summary>
            <p className="mt-1 font-mono break-all">{step.otpauthUrl}</p>
          </details>
        </div>

        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Código de 6 dígitos
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            required
            autoFocus
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#2b496d] dark:focus:ring-[#5a7a9e] transition"
          />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full py-3 bg-[#2b496d] hover:bg-[#1e3550] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          {loading ? 'Verificando...' : 'Confirmar y activar 2FA'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleCodeSubmit} className="space-y-4">
      <div className="flex justify-center mb-1">
        <ShieldCheck size={24} className="text-[#2b496d] dark:text-[#5a7a9e]" />
      </div>
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
          Código de Google Authenticator
        </label>
        <input
          id="code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          required
          autoFocus
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#2b496d] dark:focus:ring-[#5a7a9e] transition"
        />
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}

      <button
        type="submit"
        disabled={loading || code.length !== 6}
        className="w-full py-3 bg-[#2b496d] hover:bg-[#1e3550] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
      >
        {loading ? 'Verificando...' : 'Entrar'}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#2b496d] rounded-full flex items-center justify-center">
              <Lock size={28} className="text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Panel Admin
          </h1>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-8">
            NekoMangaCix
          </p>

          <Suspense fallback={<div className="h-32 animate-pulse bg-gray-100 dark:bg-gray-700 rounded-lg" />}>
            <AdminLoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
