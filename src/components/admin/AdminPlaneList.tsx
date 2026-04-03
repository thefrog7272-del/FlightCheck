import { useState } from 'react';
import { Pencil, Trash2, Search } from 'lucide-react';
import type { SharedPlaneRecord, SharedChecklistRecord } from '../../api/sharedPlanes';
import styles from './AdminPlaneList.module.css';

interface AdminPlaneListProps {
  planes: SharedPlaneRecord[];
  checklists: SharedChecklistRecord[];
  onEdit: (plane: SharedPlaneRecord) => void;
  onDelete: (plane: SharedPlaneRecord) => void;
}

export function AdminPlaneList({ planes, checklists, onEdit, onDelete }: AdminPlaneListProps) {
  const [search, setSearch] = useState('');

  // Sort alphabetically by name — matches the default view first-time visitors see
  const filtered = planes
    .filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.manufacturer.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const getItemCount = (planeId: string): number => {
    const cl = checklists.find(c => c.plane_id === planeId);
    if (!cl) return 0;
    try {
      const phases = JSON.parse(cl.phases);
      return phases.reduce((sum: number, p: { items: unknown[] }) => sum + p.items.length, 0);
    } catch { return 0; }
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchBar}>
        <Search size={16} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search planes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>
      <div className={styles.list}>
        {filtered.map(plane => (
          <div key={plane.id} className={styles.row}>
            <div className={styles.info}>
              <span className={styles.name}>{plane.name}</span>
              <span className={styles.meta}>
                {plane.manufacturer} &middot; {plane.type} &middot; {getItemCount(plane.plane_id)} items
              </span>
            </div>
            <div className={styles.actions}>
              <button className={styles.editBtn} onClick={() => onEdit(plane)} title="Edit">
                <Pencil size={14} />
              </button>
              <button className={styles.deleteBtn} onClick={() => onDelete(plane)} title="Delete">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className={styles.empty}>No planes found.</p>
        )}
      </div>
      <p className={styles.count}>{planes.length} shared plane(s)</p>
    </div>
  );
}
