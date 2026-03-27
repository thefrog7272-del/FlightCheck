import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { List, Trash2, Copy } from 'lucide-react';
import styles from './VariantSelector.module.css';

interface VariantSelectorProps {
  planeId: string;
  variants: string[];
  activeVariant: string;
  onDuplicate: () => void;
  onDelete: (variant: string) => void;
  isEditing: boolean;
}

export function VariantSelector({ planeId, variants, activeVariant, onDuplicate, onDelete, isEditing }: VariantSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const subChecklists = variants.filter(v => v !== 'Standard');
  if (subChecklists.length === 0 && !isEditing) return null;

  return (
    <div className={styles.container} ref={containerRef}>
      <button className={styles.menuButton} onClick={() => setIsOpen(!isOpen)}>
        <List size={16} />
        Sub-checklists ({subChecklists.length})
      </button>
      {isOpen && (
        <div className={styles.dropdown}>
          {subChecklists.length === 0 && (
            <span className={styles.emptyMessage}>No sub-checklists yet</span>
          )}
          {subChecklists.map(v => (
            <div key={v} className={styles.dropdownItem}>
              <Link
                to={`/checklist/${planeId}/${encodeURIComponent(v)}`}
                className={`${styles.variantLink} ${v === activeVariant ? styles.variantLinkActive : ''}`}
                onClick={() => setIsOpen(false)}
              >
                {v}
              </Link>
              {isEditing && (
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => { e.stopPropagation(); onDelete(v); }}
                  title={`Delete ${v}`}
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
          {isEditing && (
            <button className={styles.duplicateBtn} onClick={() => { onDuplicate(); setIsOpen(false); }}>
              <Copy size={13} /> Duplicate current as sub-checklist
            </button>
          )}
        </div>
      )}
    </div>
  );
}
