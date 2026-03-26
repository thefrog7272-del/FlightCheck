import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Database, Loader } from 'lucide-react';
import { planes as staticPlanes } from '../data/planes';
import { checklists as staticChecklists } from '../data/checklists';
import { createSharedPlane, createSharedChecklist, listSharedPlanes } from '../api/sharedPlanes';
import styles from './AdminDashboard.module.css';

export function AdminDashboard() {
  const { user, handleSignOut } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState('');

  const handleSeed = async () => {
    setSeeding(true);
    setSeedProgress('Checking existing planes...');

    try {
      const existing = await listSharedPlanes();
      const existingIds = new Set(existing.map(p => p.planeId));

      let created = 0;
      for (let i = 0; i < staticPlanes.length; i++) {
        const plane = staticPlanes[i];
        if (existingIds.has(plane.id)) {
          setSeedProgress(`Skipping ${plane.name} (already exists)... ${i + 1}/${staticPlanes.length}`);
          continue;
        }

        setSeedProgress(`Creating ${plane.name}... ${i + 1}/${staticPlanes.length}`);

        await createSharedPlane({
          planeId: plane.id,
          name: plane.name,
          manufacturer: plane.manufacturer,
          image: plane.image,
          type: plane.type,
          sim: plane.sim || null,
          sortOrder: i,
        });

        const checklist = staticChecklists[plane.id];
        if (checklist) {
          await createSharedChecklist({
            planeId: plane.id,
            phases: JSON.stringify(checklist.phases),
          });
        }

        created++;
      }

      setSeedProgress(`Done! Created ${created} new plane(s). ${existingIds.size} already existed.`);
    } catch (err) {
      setSeedProgress(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSeeding(false);
    }
  };

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
        <h2 style={{ margin: '0 0 1rem', color: 'var(--text-primary)' }}>Seed Database</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0 0 1rem' }}>
          Populate the shared planes database with the {staticPlanes.length} built-in aircraft and their checklists.
          This is safe to run multiple times — existing planes will be skipped.
        </p>
        <button
          className={styles.seedButton}
          onClick={handleSeed}
          disabled={seeding}
        >
          {seeding ? <Loader size={16} className={styles.spinner} /> : <Database size={16} />}
          {seeding ? 'Seeding...' : 'Seed Database'}
        </button>
        {seedProgress && (
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {seedProgress}
          </p>
        )}
      </div>
    </div>
  );
}
