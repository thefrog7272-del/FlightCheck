import { Plane, Coffee, Sun, Moon, Lock, Shield } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../contexts/AuthContext';
import { OfflineIndicator } from './OfflineIndicator';
import styles from './Layout.module.css';

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export function Layout() {
  const { theme, toggleTheme } = useTheme();
  const { isAdmin } = useAuth();

  return (
    <div className={styles.container}>
      <OfflineIndicator />
      <a href="#main-content" className={styles.skipLink}>Skip to content</a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.logo}>
            <Plane className={styles.icon} />
            <span>FlightCheck</span>
          </Link>
          <nav className={styles.nav} aria-label="Main navigation">
            <button
              onClick={toggleTheme}
              className={styles.themeToggle}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {isAdmin && (
              <Link to="/admin" className={styles.adminBadge} title="Admin Dashboard">
                <Shield size={14} />
                Admin
              </Link>
            )}
            <a
              href="https://buymeacoffee.com/thefrog7272"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.coffeeLink}
              title="Buy me a coffee"
            >
              <Coffee size={18} />
              <span>Buy me a coffee</span>
            </a>
          </nav>
        </div>
      </header>
      <main className={styles.main} id="main-content">
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <span>FlightCheck — Interactive Flight Simulator Checklists</span>
        <a
          href="https://github.com/thefrog7272-del/FlightCheck"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.footerLink}
        >
          <GitHubIcon />
          <span>GitHub</span>
        </a>
        {!isAdmin && (
          <Link to="/admin" className={styles.footerLink}>
            <Lock size={14} />
            Admin
          </Link>
        )}
      </footer>
    </div>
  );
}
