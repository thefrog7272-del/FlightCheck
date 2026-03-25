import { Plane, ExternalLink } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import styles from './Layout.module.css';

export function Layout() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.logo}>
            <Plane className={styles.icon} />
            <span>FlightCheck</span>
          </Link>
          <nav className={styles.nav}>
            <a
              href="https://github.com/samwmarsh/flightcheck"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.navLink}
              title="View on GitHub"
            >
              <ExternalLink size={20} />
            </a>
          </nav>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <span>FlightCheck — Interactive Flight Simulator Checklists</span>
      </footer>
    </div>
  );
}
