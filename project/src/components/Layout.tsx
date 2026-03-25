import { Plane } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import styles from './Layout.module.css';

export function Layout() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.content}>
          <Link to="/" className={styles.logo}>
            <Plane className={styles.icon} />
            <span>FlightCheck</span>
          </Link>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
