import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';
import styles from './AdminDashboard.module.css';

export function AdminDashboard() {
  const { user, handleSignOut } = useAuth();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <div className={styles.userInfo}>
          <span className={styles.email}>{user?.signInDetails?.loginId}</span>
          <button className={styles.signOut} onClick={handleSignOut}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
      <div className={styles.content}>
        <p className={styles.placeholder}>Shared plane management coming in the next update.</p>
      </div>
    </div>
  );
}
