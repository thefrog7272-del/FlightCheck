import { useState } from 'react';
import { parsePlaneCsv } from '../../utils/csvParser';
import type { Plane, PlaneChecklist } from '../../data/types';
import styles from './AdminPlaneForm.module.css';

interface AdminPlaneFormProps {
  initialPlane?: { planeId: string; name: string; manufacturer: string; image: string; type: string; sim?: string | null };
  initialChecklist?: PlaneChecklist;
  onSubmit: (plane: Plane, checklist: PlaneChecklist) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

export function AdminPlaneForm({ initialPlane, initialChecklist, onSubmit, onCancel, submitLabel }: AdminPlaneFormProps) {
  const [name, setName] = useState(initialPlane?.name || '');
  const [manufacturer, setManufacturer] = useState(initialPlane?.manufacturer || '');
  const [image, setImage] = useState(initialPlane?.image || '');
  const [type, setType] = useState(initialPlane?.type || 'GA');
  const [sim, setSim] = useState(initialPlane?.sim || 'both');
  const [csvInput, setCsvInput] = useState('');
  const [checklist, setChecklist] = useState<PlaneChecklist | null>(initialChecklist || null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleParseCsv = () => {
    try {
      const { checklist: parsed } = parsePlaneCsv(csvInput);
      setChecklist(parsed);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV');
    }
  };

  const handleJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        if (Array.isArray(json) && json.length > 0 && json[0].phase) {
          // Flat array format
          const phasesMap = new Map<string, { id: string; title: string; items: { id: string; label: string; expectedState?: string; notes?: string }[] }>();
          for (const row of json) {
            const phaseTitle = row.phase?.trim();
            const itemLabel = row.item?.trim();
            if (!phaseTitle || !itemLabel) continue;
            if (!phasesMap.has(phaseTitle)) {
              const phaseId = phaseTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
              phasesMap.set(phaseTitle, { id: phaseId, title: phaseTitle, items: [] });
            }
            const phase = phasesMap.get(phaseTitle)!;
            phase.items.push({ id: `${phase.id}-${phase.items.length}`, label: itemLabel, expectedState: row.expectedState?.trim() || undefined, notes: row.notes?.trim() || undefined });
          }
          setChecklist({ planeId: '', phases: Array.from(phasesMap.values()) });
          if (json[0].name && !name) setName(json[0].name);
          if (json[0].manufacturer && !manufacturer) setManufacturer(json[0].manufacturer);
        } else if (json.phases) {
          setChecklist({ planeId: '', phases: json.phases });
        } else if (json.checklist?.phases) {
          setChecklist(json.checklist);
          if (json.plane?.name && !name) setName(json.plane.name);
          if (json.plane?.manufacturer && !manufacturer) setManufacturer(json.plane.manufacturer);
        }
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid JSON');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !manufacturer.trim()) {
      setError('Name and manufacturer are required.');
      return;
    }
    if (!checklist || checklist.phases.length === 0) {
      setError('Please import a checklist (CSV or JSON) before saving.');
      return;
    }

    const planeId = initialPlane?.planeId || name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const plane: Plane = { id: planeId, name: name.trim(), manufacturer: manufacturer.trim(), image: image.trim(), type, sim: sim as Plane['sim'] };
    const finalChecklist: PlaneChecklist = { ...checklist, planeId };

    setSubmitting(true);
    try {
      await onSubmit(plane, finalChecklist);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const totalItems = checklist ? checklist.phases.reduce((sum, p) => sum + p.items.length, 0) : 0;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Aircraft Name *</label>
          <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Manufacturer *</label>
          <input className={styles.input} value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} required />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Type</label>
          <select className={styles.input} value={type} onChange={(e) => setType(e.target.value)}>
            <option>GA</option>
            <option>Airliner</option>
            <option>Turboprop</option>
            <option>Regional Jet</option>
            <option>GA Twin</option>
            <option>Widebody</option>
            <option>Utility Turboprop</option>
            <option>Military</option>
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Sim</label>
          <select className={styles.input} value={sim} onChange={(e) => setSim(e.target.value)}>
            <option value="both">Both</option>
            <option value="msfs2020">MSFS 2020</option>
            <option value="msfs2024">MSFS 2024</option>
          </select>
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Image URL</label>
        <input className={styles.input} value={image} onChange={(e) => setImage(e.target.value)} placeholder="/planes/example.svg" />
      </div>

      <div className={styles.divider}>Checklist Data</div>

      {checklist ? (
        <div className={styles.checklistPreview}>
          <span>{checklist.phases.length} phase(s), {totalItems} item(s)</span>
          <button type="button" className={styles.clearBtn} onClick={() => setChecklist(null)}>Clear</button>
        </div>
      ) : (
        <>
          <div className={styles.field}>
            <label className={styles.label}>Upload JSON or CSV file</label>
            <input type="file" accept=".json,.csv" onChange={handleJsonFile} className={styles.fileInput} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Or paste CSV</label>
            <textarea className={styles.textarea} value={csvInput} onChange={(e) => setCsvInput(e.target.value)} rows={4} placeholder="name,manufacturer,phase,item,expectedState" />
            {csvInput && <button type="button" className={styles.parseBtn} onClick={handleParseCsv}>Parse CSV</button>}
          </div>
        </>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
        <button type="submit" className={styles.submitBtn} disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
