import { Check } from 'lucide-react';
import styles from './ChecklistItem.module.css';
import clsx from 'clsx';
import type { ChecklistItem as ItemType } from '../data/types';

interface ChecklistItemProps {
  item: ItemType;
  checked: boolean;
  onToggle: () => void;
}

export function ChecklistItem({ item, checked, onToggle }: ChecklistItemProps) {
  return (
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
    </div>
  );
}
