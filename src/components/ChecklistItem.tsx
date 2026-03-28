import { useState } from 'react';
import { Check, StickyNote } from 'lucide-react';
import styles from './ChecklistItem.module.css';
import clsx from 'clsx';
import type { ChecklistItem as ItemType } from '../data/types';

interface ChecklistItemProps {
  item: ItemType;
  checked: boolean;
  onToggle: () => void;
  note?: string;
  onNoteChange?: (text: string) => void;
}

const TABLE_PREFIX = 'data:table/json,';

function ReferenceTable({ data, label }: { data: string; label: string }) {
  let rows: string[][] = [];
  try {
    rows = JSON.parse(data.slice(TABLE_PREFIX.length));
  } catch {
    return <span className={styles.importedNote}>Could not parse table data</span>;
  }
  if (!rows.length) return null;
  const [headers, ...body] = rows;
  return (
    <div className={styles.referenceTableWrapper}>
      <table className={styles.referenceTable} aria-label={label}>
        <thead>
          <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ChecklistItem({ item, checked, onToggle, note, onNoteChange }: ChecklistItemProps) {
  const [showNote, setShowNote] = useState(false);
  const hasTableNote = item.notes?.startsWith(TABLE_PREFIX) ?? false;

  if (hasTableNote) {
    return (
      <div className={styles.wrapper}>
        <div className={clsx(styles.item, styles.referenceTableItem)}>
          <div className={styles.content}>
            <div className={styles.labelRow}>
              <span className={styles.label}>{item.label}</span>
            </div>
            <ReferenceTable data={item.notes!} label={item.label} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div
        className={clsx(styles.item, checked && styles.checked)}
        onClick={onToggle}
        role="checkbox"
        aria-checked={checked}
        aria-label={`${item.label}${item.expectedState ? ': ' + item.expectedState : ''}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              onToggle();
          }
        }}
      >
        <div className={styles.checkbox}>
          {checked && <Check className={styles.icon} />}
        </div>
        <div className={styles.content}>
          <div className={styles.labelRow}>
            <span className={styles.label}>{item.label}</span>
            <div className={styles.stateGroup}>
              {item.expectedState && (
                <span className={styles.state}>{item.expectedState}</span>
              )}
              {item.notes?.startsWith('data:image/') && (
                <img src={item.notes} className={styles.referenceImage} alt={item.label} />
              )}
              {item.notes && !item.notes.startsWith('data:image/') && !hasTableNote && (
                <span className={styles.importedNote}>{item.notes}</span>
              )}
            </div>
          </div>
        </div>
        {onNoteChange && (
          <button
            className={clsx(styles.noteButton, note && styles.noteButtonActive)}
            onClick={(e) => { e.stopPropagation(); setShowNote(!showNote); }}
            title={note ? 'Edit note' : 'Add note'}
          >
            <StickyNote size={14} />
          </button>
        )}
      </div>
      {showNote && onNoteChange && (
        <textarea
          className={styles.noteInput}
          placeholder="Add a personal note..."
          value={note || ''}
          onChange={(e) => onNoteChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          rows={2}
        />
      )}
    </div>
  );
}
