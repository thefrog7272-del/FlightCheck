import { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { decodeChecklist } from '../utils/shareCodec';
import { useFleet } from '../hooks/useFleet';
import styles from './Checklist.module.css';
import type { Plane, PlaneChecklist } from '../data/types';

export function ShareImport() {
  const [searchParams] = useSearchParams();
  const { addPlane } = useFleet();
  const encoded = searchParams.get('data');
  const [status, setStatus] = useState<'loading' | 'preview' | 'done' | 'error'>(encoded ? 'loading' : 'error');
  const [data, setData] = useState<{ plane: Plane; checklist: PlaneChecklist } | null>(null);
  const [errorMsg, setErrorMsg] = useState(encoded ? '' : 'No checklist data in URL.');

  useEffect(() => {
    if (!encoded) return;
    decodeChecklist(encoded)
      .then((decoded: unknown) => {
        const obj = decoded as { plane?: Plane; checklist?: PlaneChecklist };
        if (obj.plane && obj.checklist) {
          setData(obj as { plane: Plane; checklist: PlaneChecklist });
          setStatus('preview');
        } else {
          throw new Error('Invalid data');
        }
      })
      .catch(() => {
        setStatus('error');
        setErrorMsg('Could not decode the shared checklist.');
      });
  }, [encoded]);

  const handleImport = () => {
    if (data) {
      addPlane(data.plane, data.checklist);
      setStatus('done');
    }
  };

  if (status === 'done') return <Navigate to="/" replace />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Shared Checklist</h1>
      </div>
      {status === 'loading' && <p>Decoding checklist...</p>}
      {status === 'error' && <p style={{ color: '#ef4444' }}>{errorMsg}</p>}
      {status === 'preview' && data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p>Someone shared a checklist with you:</p>
          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>{data.plane.name}</h2>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {data.plane.manufacturer} &middot; {data.plane.type} &middot; {data.checklist.phases.length} phases
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleImport}
              style={{ padding: '0.75rem 1.5rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 600 }}
            >
              Import Checklist
            </button>
            <a
              href="/"
              style={{ padding: '0.75rem 1.5rem', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center' }}
            >
              Cancel
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
