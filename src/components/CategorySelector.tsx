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
  categories: string[];
  activeCategory: string;
  onDuplicate: () => void;
  onDelete: (category: string) => void;
  isEditing: boolean;
  basePath: string;
  children?: ReactNode;
}

export function CategorySelector({ categories, activeCategory, onDelete, isEditing, basePath, children }: CategorySelectorProps) {
  const visibleTabs = FIXED_TABS.filter(
    tab => tab.categoryId === 'Standard' || categories.includes(tab.categoryId),
  );

  // Hide the bar when only Normal exists, not editing, and no extra children (e.g. voice button)
  if (visibleTabs.length <= 1 && !isEditing && !children) return null;

  return (
    <div className={styles.tabBar}>
      {visibleTabs.map(({ label, categoryId, color }) => {
        const isActive = activeCategory === categoryId;
        const href = categoryId === 'Standard'
          ? basePath
          : `${basePath}/${encodeURIComponent(categoryId)}`;
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
