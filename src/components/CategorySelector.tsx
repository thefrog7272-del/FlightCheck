import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import styles from './CategorySelector.module.css';

const FIXED_TABS = [
  { label: 'Normal',    categoryId: 'Standard',        color: styles.colorGreen },
  { label: 'Abnormal',  categoryId: 'Abnormal',         color: styles.colorAmber },
  { label: 'Emergency', categoryId: 'Emergency',        color: styles.colorRed   },
  { label: 'Reference', categoryId: 'Reference Tables', color: styles.colorBlue  },
] as const;

interface CategorySelectorProps {
  planeId: string;
  categories: string[];
  activeCategory: string;
  onDuplicate: () => void;
  onDelete: (category: string) => void;
  isEditing: boolean;
  /** When set, tab links are scoped to this ability-variant.
   *  e.g. categoryPrefix="expert" → Normal links to /checklist/{id}/expert,
   *  Abnormal links to /checklist/{id}/expert%3A%3AAbnormal */
  categoryPrefix?: string;
  children?: ReactNode;
}

export function CategorySelector({ planeId, categories, activeCategory, onDelete, isEditing, categoryPrefix, children }: CategorySelectorProps) {
  const visibleTabs = FIXED_TABS.filter(
    tab => tab.categoryId === 'Standard' || categories.includes(tab.categoryId),
  );

  // Hide the bar when only Normal exists, not editing, and no extra children (e.g. voice button)
  if (visibleTabs.length <= 1 && !isEditing && !children) return null;

  return (
    <div className={styles.tabBar}>
      {visibleTabs.map(({ label, categoryId, color }) => {
        const isActive = activeCategory === categoryId;
        let href: string;
        if (categoryPrefix) {
          href = categoryId === 'Standard'
            ? `/checklist/${planeId}/${encodeURIComponent(categoryPrefix)}`
            : `/checklist/${planeId}/${encodeURIComponent(`${categoryPrefix}::${categoryId}`)}`;
        } else {
          href = categoryId === 'Standard'
            ? `/checklist/${planeId}`
            : `/checklist/${planeId}/${encodeURIComponent(categoryId)}`;
        }
        return (
          <div key={categoryId} className={styles.tabItem}>
            <Link
              to={href}
              className={`${styles.tab} ${color} ${isActive ? styles.tabActive : ''}`}
            >
              {label}
            </Link>
            {isEditing && categoryId !== 'Standard' && (
              <button
                className={styles.deleteBtn}
                onClick={() => onDelete(categoryId)}
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
