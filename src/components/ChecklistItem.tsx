import { useState, useEffect } from 'react';
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
  onDeleteTable?: () => void;
}

const TABLE_PREFIX = 'data:table/json,';

interface TableData {
  headers: string[];
  rows: string[][];
  rowClasses?: string[];
  cellClasses?: string[][];
  preNote?: string;
  preNoteYellow?: string;
  postNote?: string;
  postNoteYellow?: string;
}

function ReferenceTable({ data, label }: { data: string; label: string }) {
  let tableData: TableData;
  try {
    const parsed: unknown = JSON.parse(data.slice(TABLE_PREFIX.length));
    if (Array.isArray(parsed)) {
      // Legacy format: [[header, ...], [row, ...], ...]
      if ((parsed as string[][]).length < 2) return null;
      const [headers, ...rows] = parsed as string[][];
      tableData = { headers, rows };
    } else {
      tableData = parsed as TableData;
    }
  } catch {
    return <span className={styles.importedNote}>Could not parse table data</span>;
  }
  const { headers, rows: body, rowClasses, cellClasses, preNote, preNoteYellow, postNote, postNoteYellow } = tableData;
  if (!headers?.length || !body?.length) return null;
  return (
    <div>
      {(preNoteYellow || preNote) && (
        <p className={styles.tableNote}>
          {preNoteYellow && <span className={styles.tableCellYellow}>{preNoteYellow}</span>}
          {preNoteYellow && preNote ? ' ' : ''}
          {preNote}
        </p>
      )}
      <div className={styles.referenceTableWrapper}>
        <table className={styles.referenceTable} aria-label={label}>
          <thead>
            <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {body.map((row, ri) => (
              <tr
                key={ri}
                className={rowClasses?.[ri] === 'shaded-row' ? styles.tableRowShaded : undefined}
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={cellClasses?.[ri]?.[ci] === 'yellow-text' ? styles.tableCellYellow : undefined}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(postNoteYellow || postNote) && (
        <p className={styles.tableNote}>
          {postNoteYellow && <span className={styles.tableCellYellow}>{postNoteYellow}</span>}
          {postNoteYellow && postNote ? ' ' : ''}
          {postNote}
        </p>
      )}
    </div>
  );
}

export function ChecklistItem({ item, checked, onToggle, note, onNoteChange, onDeleteTable }: ChecklistItemProps) {
  const [showNote, setShowNote] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const hasTableNote = item.notes?.startsWith(TABLE_PREFIX) ?? false;

  useEffect(() => {
    if (!menuPos) return;
    const close = () => setMenuPos(null);
    document.addEventListener('click', close);
    document.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('scroll', close, true);
    };
  }, [menuPos]);

  if (hasTableNote) {
    return (
      <div
        className={styles.wrapper}
        onContextMenu={onDeleteTable ? (e) => {
          e.preventDefault();
          e.stopPropagation();
          setMenuPos({ x: e.clientX, y: e.clientY });
        } : undefined}
      >
        <div className={clsx(styles.item, styles.referenceTableItem)}>
          <div className={styles.content}>
            <div className={styles.labelRow}>
              <span className={styles.label}>{item.label}</span>
            </div>
            <ReferenceTable data={item.notes!} label={item.label} />
          </div>
        </div>

        {menuPos && onDeleteTable && (
          <div
            className={styles.contextMenu}
            style={{ top: menuPos.y, left: menuPos.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.contextMenuItem}
              onClick={() => { setMenuPos(null); onDeleteTable(); }}
              role="menuitem"
            >
              Delete Table
            </button>
          </div>
        )}
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
