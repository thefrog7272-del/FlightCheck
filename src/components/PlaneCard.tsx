import { useState } from 'react';
import type { Plane } from '../data/types';
import { Link } from 'react-router-dom';
import styles from './PlaneCard.module.css';
import { Trash2, Plane as PlaneIcon } from 'lucide-react';

interface PlaneCardProps {
  plane: Plane;
  onDelete?: (id: string) => void;
}

export function PlaneCard({ plane, onDelete }: PlaneCardProps) {
  const [imgError, setImgError] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(plane.id);
  };

  return (
    <Link to={`/checklist/${plane.id}`} className={styles.card}>
      {onDelete && (
        <button className={styles.deleteButton} onClick={handleDelete} title="Delete Plane">
          <Trash2 size={16} />
        </button>
      )}
      <div className={styles.imageWrapper}>
        {imgError || !plane.image ? (
          <div className={styles.imagePlaceholder}>
            <PlaneIcon size={48} />
            <span>{plane.name}</span>
          </div>
        ) : (
          <img
            src={plane.image}
            alt={plane.name}
            className={styles.image}
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <div className={styles.content}>
        <span className={styles.manufacturer}>{plane.manufacturer}</span>
        <h3 className={styles.name}>{plane.name}</h3>
        <span className={styles.type}>{plane.type}</span>
      </div>
    </Link>
  );
}
