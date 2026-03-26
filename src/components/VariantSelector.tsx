import { useState } from 'react';
import { ChevronDown, Trash2, Copy } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(false);

  if (variants.length <= 1 && !isEditing) return null;

  return (
    <div className={styles.container}>
      <button className={styles.trigger} onClick={() => setIsOpen(!isOpen)}>
        <span className={styles.label}>Variant: {activeVariant}</span>
        <ChevronDown size={16} className={isOpen ? styles.chevronOpen : ''} />
      </button>
      {isOpen && (
        <div className={styles.dropdown}>
          {variants.map(v => (
            <button
              key={v}
              className={`${styles.option} ${v === activeVariant ? styles.optionActive : ''}`}
              onClick={() => { onSelect(v); setIsOpen(false); }}
            >
              <span>{v}</span>
              {isEditing && v !== 'Standard' && (
                <button
                  className={styles.deleteVariant}
                  onClick={(e) => { e.stopPropagation(); onDelete(v); setIsOpen(false); }}
                  title="Delete variant"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </button>
          ))}
          {isEditing && (
            <button className={styles.addVariant} onClick={() => { onDuplicate(); setIsOpen(false); }}>
              <Copy size={14} />
              Duplicate as new variant
            </button>
          )}
        </div>
      )}
    </div>
  );
}
