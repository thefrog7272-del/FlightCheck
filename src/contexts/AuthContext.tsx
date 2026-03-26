import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { fetchAuthSession, signIn, signOut, getCurrentUser, confirmSignIn, type AuthUser } from 'aws-amplify/auth';

interface AuthContextType {
  user: AuthUser | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  needsNewPassword: boolean;
  handleSignIn: (email: string, password: string) => Promise<void>;
  handleConfirmNewPassword: (newPassword: string) => Promise<void>;
  handleSignOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsNewPassword, setNeedsNewPassword] = useState(false);

  const checkAdmin = useCallback(async () => {
    try {
      const session = await fetchAuthSession();
      const groups = (session.tokens?.accessToken?.payload?.['cognito:groups'] as string[] | undefined) ?? [];
      setIsAdmin(groups.includes('admin'));
    } catch {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    getCurrentUser()
      .then(async (currentUser) => {
        setUser(currentUser);
        await checkAdmin();
      })
      .catch(() => {
        setUser(null);
        setIsAdmin(false);
      })
      .finally(() => setLoading(false));
  }, [checkAdmin]);

  const handleSignIn = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const result = await signIn({ username: email, password });
      if (result.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setNeedsNewPassword(true);
        return;
      }
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      await checkAdmin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
      throw err;
    }
  }, [checkAdmin]);

  const handleConfirmNewPassword = useCallback(async (newPassword: string) => {
    setError(null);
    try {
      await confirmSignIn({ challengeResponse: newPassword });
      setNeedsNewPassword(false);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      await checkAdmin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password change failed');
      throw err;
    }
  }, [checkAdmin]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    setUser(null);
    setIsAdmin(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, error, needsNewPassword, handleSignIn, handleConfirmNewPassword, handleSignOut }}>
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
