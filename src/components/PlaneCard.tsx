import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  onDownloadJson?: (id: string) => void;
  onDownloadChecklistJson?: (id: string) => void;
  onDownloadCsv?: (id: string) => void;
  onDownloadHtml?: (id: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export function PlaneCard({ plane, progress, onHide, onDelete, onEditImage, onAddReferenceTable, onDownloadJson, onDownloadChecklistJson, onDownloadCsv, onDownloadHtml, isFavorite, onToggleFavorite }: PlaneCardProps) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);


  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = cardRef.current?.getBoundingClientRect();
    const x = rect ? rect.right : e.clientX;
    const y = rect ? rect.top : e.clientY;
    setMenuPos({ x, y });
  };

  // Close context menu on outside mousedown or scroll
  useEffect(() => {
    if (!menuPos) return;
    const close = () => setMenuPos(null);
    const onMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
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

  const handleDownloadJson = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos(null);
    onDownloadJson?.(plane.id);
  };

  const handleDownloadChecklistJson = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos(null);
    onDownloadChecklistJson?.(plane.id);
  };

  const handleDownloadCsv = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos(null);
    onDownloadCsv?.(plane.id);
  };

  const handleDownloadHtml = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos(null);
    onDownloadHtml?.(plane.id);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/checklist/${plane.id}`);
  };


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(`/checklist/${plane.id}`);
    }
  };

  return (
    <>
      <div
        ref={cardRef}
        className={styles.card}
        data-plane-id={plane.id}
        style={{ cursor: 'pointer', zIndex: 1 }}
        onContextMenu={handleContextMenu}
        onClick={handleCardClick}
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
          style={{ top: menuPos.y, right: window.innerWidth - menuPos.x }}
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
          {onDownloadJson && (
            <button className={styles.contextMenuItem} onClick={handleDownloadJson} role="menuitem">
              Download JSON
            </button>
          )}
          {onDownloadChecklistJson && (
            <button className={styles.contextMenuItem} onClick={handleDownloadChecklistJson} role="menuitem">
              Checklist Reader Format
            </button>
          )}
          {onDownloadCsv && (
            <button className={styles.contextMenuItem} onClick={handleDownloadCsv} role="menuitem">
              Download CSV
            </button>
          )}
          {onDownloadHtml && (
            <button className={styles.contextMenuItem} onClick={handleDownloadHtml} role="menuitem">
              Download HTML
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
