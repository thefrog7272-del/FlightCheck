import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './AdminLogin.module.css';
import { Lock } from 'lucide-react';

export function AdminLogin() {
  const { handleSignIn, handleConfirmNewPassword, user, isAdmin, loading, error, needsNewPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already logged in as admin, redirect
  if (!loading && user && isAdmin) {
    navigate('/admin', { replace: true });
    return null;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await handleSignIn(email, password);
      if (!needsNewPassword) {
        navigate('/admin', { replace: true });
      }
    } catch {
      // error is set in context
    } finally {
      setSubmitting(false);
    }
  };

  const onNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await handleConfirmNewPassword(newPassword);
      navigate('/admin', { replace: true });
    } catch {
      // error is set in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Lock size={24} />
          <h1 className={styles.title}>{needsNewPassword ? 'Set New Password' : 'Admin Login'}</h1>
        </div>

        {needsNewPassword ? (
          <form onSubmit={onNewPassword} className={styles.form}>
            <p className={styles.hint}>You must set a new password on first login.</p>
            <div className={styles.field}>
              <label className={styles.label}>New Password</label>
              <input
                type="password"
                className={styles.input}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoFocus
                minLength={8}
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.button} disabled={submitting}>
              {submitting ? 'Setting password...' : 'Set Password & Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={onSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input
                type="password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.button} disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
