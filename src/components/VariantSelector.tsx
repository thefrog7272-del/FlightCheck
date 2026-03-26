import { Trash2, Copy } from 'lucide-react';
import styles from './VariantSelector.module.css';

interface VariantSelectorProps {
  variants: string[];
  activeVariant: string;
  onSelect: (variant: string) => void;
  onDuplicate: () => void;
  onDelete: (variant: string) => void;
  isEditing: boolean;
}

export function VariantSelector({ variants, activeVariant, onSelect, onDuplicate, onDelete, isEditing }: VariantSelectorProps) {
  if (variants.length <= 1 && !isEditing) return null;

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        {variants.map(v => (
          <button
            key={v}
            className={`${styles.tab} ${v === activeVariant ? styles.tabActive : ''}`}
            onClick={() => onSelect(v)}
          >
            <span>{v}</span>
            {isEditing && v !== 'Standard' && (
              <button
                className={styles.deleteVariant}
                onClick={(e) => { e.stopPropagation(); onDelete(v); }}
                title={`Delete ${v} variant`}
              >
                <Trash2 size={11} />
              </button>
            )}
          </button>
        ))}
        {isEditing && (
          <button className={styles.addTab} onClick={onDuplicate} title="Duplicate as new variant">
            <Copy size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
