import { useState, useEffect, useCallback, useMemo } from 'react';
import type { PlaneChecklist, ChecklistItem } from '../data/types';
import styles from './AddReferenceTableModal.module.css';

const TABLE_PREFIX = 'data:table/json,';

interface AddReferenceTableModalProps {
  planeName: string;
  planeId: string;
  existingChecklist: PlaneChecklist | null;
  onSave: (updatedChecklist: PlaneChecklist) => void;
  onCancel: () => void;
}

/** Parse a comma-separated text block into a 2-D string array. */
function parseCSV(text: string): string[][] {
  return text
    .trim()
    .split('\n')
    .filter(l => l.trim())
    .map(l =>
      l.split(',').map(c => c.trim().replace(/^"|"$/g, '')),
    );
}

export function AddReferenceTableModal({
  planeName,
  planeId,
  existingChecklist,
  onSave,
  onCancel,
}: AddReferenceTableModalProps) {
  const phases = useMemo(() => existingChecklist?.phases ?? [], [existingChecklist?.phases]);

  const [phaseSelection, setPhaseSelection] = useState<string>(
    phases.length > 0 ? phases[0].id : '__new__',
  );
  const [newPhaseName, setNewPhaseName] = useState('Reference Tables');
  const [tableLabel, setTableLabel] = useState('');
  const [csvText, setCsvText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onCancel();
  };

  const parsedRows = csvText.trim() ? parseCSV(csvText) : [];
  const [headers, ...bodyRows] = parsedRows;

  const handleSave = useCallback(() => {
    setError('');

    if (!csvText.trim()) {
      setError('Please enter table data.');
      return;
    }
    const rows = parseCSV(csvText);
    if (rows.length < 1 || rows[0].length < 1) {
      setError('Table must have at least one row and one column.');
      return;
    }
    if (phaseSelection === '__new__' && !newPhaseName.trim()) {
      setError('Please enter a name for the new phase.');
      return;
    }

    const newItem: ChecklistItem = {
      id: `ref-table-${Date.now()}`,
      label: tableLabel.trim() || 'Reference Table',
      reference: `${TABLE_PREFIX}${JSON.stringify(rows)}`,
    };

    const updatedPhases = phases.map(p => ({ ...p, items: [...p.items] }));

    if (phaseSelection === '__new__') {
      updatedPhases.push({
        id: `phase-${Date.now()}`,
        title: newPhaseName.trim(),
        items: [newItem],
      });
    } else {
      const idx = updatedPhases.findIndex(p => p.id === phaseSelection);
      if (idx === -1) {
        setError('Selected phase not found.');
        return;
      }
      updatedPhases[idx].items.push(newItem);
    }

    setSaving(true);
    onSave({ planeId, phases: updatedPhases });
  }, [csvText, phaseSelection, newPhaseName, tableLabel, phases, planeId, onSave]);

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-table-title"
      >
        <h2 className={styles.title} id="add-table-title">
          Add Reference Table — {planeName}
        </h2>

        {/* Phase selector */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="phase-select">
            Add to Phase
          </label>
          <select
            id="phase-select"
            className={styles.phaseSelect}
            value={phaseSelection}
            onChange={e => setPhaseSelection(e.target.value)}
          >
            {phases.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
            <option value="__new__">+ New Phase</option>
          </select>
          {phaseSelection === '__new__' && (
            <input
              type="text"
              className={styles.newPhaseInput}
              value={newPhaseName}
              onChange={e => setNewPhaseName(e.target.value)}
              placeholder="Phase name"
              aria-label="New phase name"
            />
          )}
        </div>

        {/* Table label */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="table-label">
            Table Label
          </label>
          <input
            id="table-label"
            type="text"
            className={styles.textInput}
            value={tableLabel}
            onChange={e => setTableLabel(e.target.value)}
            placeholder="e.g. Speed & Performance"
          />
        </div>

        {/* CSV data */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="csv-input">
            Table Data (CSV)
          </label>
          <textarea
            id="csv-input"
            className={styles.csvTextarea}
            value={csvText}
            onChange={e => setCsvText(e.target.value)}
            placeholder={
              'Altitude,Speed,Fuel Flow\n' +
              '5,000 ft,120 kts,15 gph\n' +
              '10,000 ft,115 kts,14 gph'
            }
            spellCheck={false}
          />
          <span className={styles.hint}>First row becomes the header. Separate values with commas.</span>
        </div>

        {/* Live preview */}
        <div className={styles.previewSection}>
          <span className={styles.previewLabel}>Preview</span>
          {parsedRows.length === 0 ? (
            <div className={styles.previewEmpty}>Enter data above to preview</div>
          ) : (
            <div className={styles.previewTableWrapper}>
              <table className={styles.previewTable}>
                <thead>
                  <tr>{(headers ?? []).map((h, i) => <th key={i}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {bodyRows.map((row, ri) => (
                    <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Add Table'}
          </button>
        </div>
      </div>
    </div>
  );
}
