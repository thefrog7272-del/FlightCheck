import { useState, useEffect } from 'react';
import { Download, X, Globe, Loader } from 'lucide-react';
import styles from './CommunityBrowser.module.css';
import type { Plane, PlaneChecklist } from '../data/types';

interface CommunityEntry {
  id: string;
  name: string;
  author: string;
  type: string;
  description: string;
  file: string;
}

interface CommunityIndex {
  version: number;
  checklists: CommunityEntry[];
}

interface CommunityBrowserProps {
  onImport: (data: { plane: Plane; checklist: PlaneChecklist }) => void;
  onClose: () => void;
}

const COMMUNITY_BASE = 'https://raw.githubusercontent.com/samwmarsh/flightcheck/main/community';

export function CommunityBrowser({ onImport, onClose }: CommunityBrowserProps) {
  const [entries, setEntries] = useState<CommunityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState<string | null>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem('community_index');
    if (cached) {
      try {
        const data = JSON.parse(cached) as CommunityIndex;
        setEntries(data.checklists);
        setLoading(false);
        return;
      } catch { /* fall through */ }
    }

    fetch(`${COMMUNITY_BASE}/index.json`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to load');
        return r.json();
      })
      .then((data: CommunityIndex) => {
        sessionStorage.setItem('community_index', JSON.stringify(data));
        setEntries(data.checklists);
      })
      .catch(() => setError('Could not load community checklists. Check your internet connection.'))
      .finally(() => setLoading(false));
  }, []);

  const handleImport = async (entry: CommunityEntry) => {
    setImporting(entry.id);
    try {
      const r = await fetch(`${COMMUNITY_BASE}/${entry.file}`);
      if (!r.ok) throw new Error('Failed to download');
      const data = await r.json();
      onImport(data);
    } catch {
      alert('Failed to download checklist.');
    } finally {
      setImporting(null);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Globe size={20} />
            <h2 className={styles.title}>Community Checklists</h2>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {loading && (
          <div className={styles.loading}>
            <Loader size={24} className={styles.spinner} />
            <span>Loading checklists...</span>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        {!loading && !error && entries.length === 0 && (
          <div className={styles.empty}>No community checklists available yet.</div>
        )}

        <div className={styles.list}>
          {entries.map(entry => (
            <div key={entry.id} className={styles.entry}>
              <div className={styles.entryInfo}>
                <span className={styles.entryName}>{entry.name}</span>
                <span className={styles.entryMeta}>{entry.type} &middot; by {entry.author}</span>
                <span className={styles.entryDesc}>{entry.description}</span>
              </div>
              <button
                className={styles.importButton}
                onClick={() => handleImport(entry)}
                disabled={importing === entry.id}
              >
                {importing === entry.id ? <Loader size={14} className={styles.spinner} /> : <Download size={14} />}
                Import
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
