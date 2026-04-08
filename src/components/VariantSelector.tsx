import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import styles from './VariantSelector.module.css';

const FIXED_TABS = [
  { label: 'Normal',    variant: 'Standard',        color: styles.colorGreen },
  { label: 'Abnormal',  variant: 'Abnormal',         color: styles.colorAmber },
  { label: 'Emergency', variant: 'Emergency',        color: styles.colorRed   },
  { label: 'Reference', variant: 'Reference Tables', color: styles.colorBlue  },
] as const;

interface VariantSelectorProps {
  planeId: string;
  categories: string[];
  activeCategory: string;
  onDuplicate: () => void;
  onDelete: (category: string) => void;
  isEditing: boolean;
  children?: ReactNode;
}

export function VariantSelector({ planeId, categories, activeCategory, onDelete, isEditing, children }: VariantSelectorProps) {
  const visibleTabs = FIXED_TABS.filter(
    tab => tab.variant === 'Standard' || categories.includes(tab.variant),
  );

  // Hide the bar when only Normal exists, not editing, and no extra children (e.g. voice button)
  if (visibleTabs.length <= 1 && !isEditing && !children) return null;

  return (
    <div className={styles.tabBar}>
      {visibleTabs.map(({ label, variant, color }) => {
        const isActive = activeCategory === variant;
        const href =
          variant === 'Standard'
            ? `/checklist/${planeId}`
            : `/checklist/${planeId}/${encodeURIComponent(variant)}`;
        return (
          <div key={variant} className={styles.tabItem}>
            <Link
              to={href}
              className={`${styles.tab} ${color} ${isActive ? styles.tabActive : ''}`}
            >
              {label}
            </Link>
            {isEditing && variant !== 'Standard' && (
              <button
                className={styles.deleteBtn}
                onClick={() => onDelete(variant)}
                title={`Delete ${label}`}
              >
                <Trash2 size={11} />
              </button>
            )}
          </div>
        );
      })}
      {children}
    </div>
  );
}
