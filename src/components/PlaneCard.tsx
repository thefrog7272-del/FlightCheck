import { useState, useRef, useEffect } from 'react';
import type { Plane } from '../data/types';
import styles from './PlaneCard.module.css';
import { Plane as PlaneIcon, Star } from 'lucide-react';

interface PlaneCardProps {
  plane: Plane;
  progress?: number;
  onHide?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEditImage?: (id: string) => void;
  onAddReferenceTable?: (id: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export function PlaneCard({ plane, progress, onHide, onDelete, onEditImage, onAddReferenceTable, isFavorite, onToggleFavorite }: PlaneCardProps) {
  const [imgError, setImgError] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  // Close menu on click outside or scroll
  useEffect(() => {
    if (!menuPos) return;
    const close = () => setMenuPos(null);
    window.addEventListener('click', close);
    window.addEventListener('scroll', close, true);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [menuPos]);

  const handleHide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos(null);
    onHide?.(plane.id);
  };

  const handleEditImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos(null);
    onEditImage?.(plane.id);
  };

  const handleAddReferenceTable = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos(null);
    onAddReferenceTable?.(plane.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos(null);
    console.log('[PlaneCard] Delete clicked for:', plane.id);
    onDelete?.(plane.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      console.log('>>>> handleKeyDown fired for:', plane.id);
      window.location.href = `/checklist/${plane.id}`;
    }
  };

  return (
    <>
      <div
        className={styles.card}
        style={{ cursor: 'pointer', zIndex: 1 }}
        onContextMenu={handleContextMenu}
        onClick={() => {
          console.log('>>>> CLICK fired for:', plane.id);
          window.location.href = `/checklist/${plane.id}`;
        }}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`Open ${plane.name} checklist`}
      >
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
          {onToggleFavorite && (
            <button
              className={`${styles.favoriteButton} ${isFavorite ? styles.favoriteActive : ''}`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(plane.id); }}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
        <div className={styles.content}>
          <span className={styles.manufacturer}>{plane.manufacturer}</span>
          <h3 className={styles.name}>{plane.name}</h3>
          <span className={styles.type}>{plane.type}</span>
          <span className={styles.type}>{plane.author}</span>
        </div>
        {typeof progress === 'number' && progress > 0 && (
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      {menuPos && (
        <div
          ref={menuRef}
          className={styles.contextMenu}
          style={{ top: menuPos.y, left: menuPos.x }}
          role="menu"
        >
          {onEditImage && (
            <button className={styles.contextMenuItem} onClick={handleEditImage} role="menuitem">
              Change Image
            </button>
          )}
          {onAddReferenceTable && (
            <button className={styles.contextMenuItem} onClick={handleAddReferenceTable} role="menuitem">
              Add Reference Table
            </button>
          )}
          {onHide && (
            <button className={styles.contextMenuItem} onClick={handleHide} role="menuitem">
              Hide Plane
            </button>
          )}
          {onDelete && (
            <button className={`${styles.contextMenuItem} ${styles.contextMenuItemDanger}`} onClick={handleDelete} role="menuitem">
              Delete Plane
            </button>
          )}
        </div>
      )}
    </>
  );
}
