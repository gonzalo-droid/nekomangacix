'use client';

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';

/**
 * El cliente de Supabase pesa ~50 KB comprimidos y casi ningún visitante tiene
 * cuenta: se descarga aparte, cuando el navegador queda libre, para que no
 * compita con la primera pintura de la página.
 */
const loadClient = () =>
  import('@/core/supabase/client').then(({ createSupabaseClient }) => createSupabaseClient());

function whenIdle(cb: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(cb, { timeout: 2000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(cb, 1);
  return () => window.clearTimeout(id);
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && !url.includes('tu-proyecto') && key && !key.includes('tu-anon'));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Si Supabase no está configurado, loading arranca en false desde el inicio
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => isSupabaseConfigured());
  const configured = useRef(isSupabaseConfigured());

  useEffect(() => {
    if (!configured.current) return;

    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    const cancelIdle = whenIdle(async () => {
      const supabase = await loadClient();
      if (!mounted) return;

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      unsubscribe = () => subscription.unsubscribe();

      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      cancelIdle();
      unsubscribe?.();
    };
  }, []);

  const signOut = async () => {
    const supabase = await loadClient();
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
