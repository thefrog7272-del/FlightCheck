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

export function ChecklistItem({ item, checked, onToggle, note, onNoteChange }: ChecklistItemProps) {
  const [showNote, setShowNote] = useState(false);

  return (
    <div className={styles.wrapper}>
      <div
        className={clsx(styles.item, checked && styles.checked)}
        onClick={onToggle}
        role="checkbox"
        aria-checked={checked}
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
          <span className={styles.label}>{item.label}</span>
          {item.expectedState && (
            <span className={styles.state}>{item.expectedState}</span>
          )}
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
