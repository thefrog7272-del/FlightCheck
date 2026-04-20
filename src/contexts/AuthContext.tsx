import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  handleSignIn: (email: string, password: string) => Promise<void>;
  handleSignOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(!!supabase);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAdmin(!!currentUser?.user_metadata?.is_admin);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Listen for auth changes but don't block on async calls
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAdmin(!!currentUser?.user_metadata?.is_admin);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      setError('Backend not configured');
      throw new Error('Backend not configured');
    }
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(signInError.message);
      throw signInError;
    }
    // getUser() returns the full user with metadata
    try {
      const { data: { user: fullUser } } = await supabase.auth.getUser();
      setUser(fullUser);
      setIsAdmin(!!fullUser?.user_metadata?.is_admin);
    } catch {
      // If getUser fails, the onAuthStateChange will handle it
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, error, handleSignIn, handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
