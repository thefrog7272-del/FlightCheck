import { useState, useRef, useEffect } from 'react';
import type { Plane } from '../data/types';
import styles from './PlaneCard.module.css';
import { Plane as PlaneIcon, Star } from 'lucide-react';

interface PlaneCardProps {
  plane: Plane;
  /**
   * Ability variants that share this plane's `name`. When more than one is
   * supplied, a left-click on the card opens a small popover listing one link
   * per variant instead of navigating straight to the checklist. When omitted
   * or length <= 1, behaviour is unchanged (direct navigation).
   */
  variants?: Plane[];
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

export function PlaneCard({ plane, variants, progress, onHide, onDelete, onEditImage, onAddReferenceTable, onDownloadJson, onDownloadChecklistJson, onDownloadCsv, onDownloadHtml, isFavorite, onToggleFavorite }: PlaneCardProps) {
  const [imgError, setImgError] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  // Variant picker renders at the document root (position: fixed) to avoid the
  // card's overflow:hidden clipping it. Null = closed; object = open at coords.
  const [variantMenuPos, setVariantMenuPos] = useState<{ x: number; y: number } | null>(null);
  // When multiple addon-developer groups exist, the picker starts on the
  // developer list; clicking a developer with >1 ability variant drills down by
  // setting this to that developer's key (string dev name, or '' for "Default"
  // = null developer). Null means "showing developer list / or single group".
  const [selectedDeveloper, setSelectedDeveloper] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const variantPopupRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const hasMultipleVariants = (variants?.length ?? 0) > 1;

  // Group variants by addon_developer_variant (null → "Default"). Key is the
  // raw developer string or '' for the null/default bucket. Groups are ordered
  // by first appearance in `variants`, which preserves any sort_order sorting
  // upstream.
  const developerGroups = (() => {
    const map = new Map<string, Plane[]>();
    for (const v of variants ?? []) {
      const key = v.addon_developer_variant ?? '';
      const bucket = map.get(key) ?? [];
      bucket.push(v);
      map.set(key, bucket);
    }
    return Array.from(map.entries()).map(([key, planes]) => ({
      key,
      label: key === '' ? 'Default' : key,
      planes,
    }));
  })();
  const hasMultipleDeveloperGroups = developerGroups.length > 1;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos({ x: e.clientX, y: e.clientY });
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

  // Close variant picker on outside mousedown or scroll
  useEffect(() => {
    if (!variantMenuPos) return;
    const close = () => { setVariantMenuPos(null); setSelectedDeveloper(null); };
    const onMouseDown = (e: MouseEvent) => {
      if (variantPopupRef.current && !variantPopupRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('scroll', close, true);
    };
  }, [variantMenuPos]);

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
    const rect = cardRef.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : e.clientX;
    const y = rect ? rect.top + rect.height / 2 : e.clientY;
    setVariantMenuPos({ x, y });
  };

  const handleVariantSelect = (e: React.MouseEvent, variantPlaneId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setVariantMenuPos(null);
    window.location.href = `/checklist/${variantPlaneId}`;
  };

  // Sort ability variants within a single developer group by a canonical
  // difficulty order; anything not in the list keeps its original position.
  const sortByAbility = (list: Plane[]): Plane[] => {
    const order = ['Beginner', 'Assist', 'Easy', 'Basic', 'Essential', 'Intermediate', 'Paper', 'Original Plus', 'Original', 'Normal', 'Standard',  'Advanced', 'Extended', 'Expert', 'Professional'];
    return [...list].sort((a, b) => {
      const aIdx = order.indexOf(a.ability_variant ?? 'Standard');
      const bIdx = order.indexOf(b.ability_variant ?? 'Standard');
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return 0;
    });
  };

  const handleDeveloperPick = (e: React.MouseEvent, group: { key: string; planes: Plane[] }) => {
    e.preventDefault();
    e.stopPropagation();
    // If the developer has only one ability variant, skip the second step and
    // navigate straight to it.
    if (group.planes.length === 1) {
      setVariantMenuPos(null);
      setSelectedDeveloper(null);
      window.location.href = `/checklist/${group.planes[0].id}`;
      return;
    }
    setSelectedDeveloper(group.key);
  };

  const handleBackToDevelopers = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedDeveloper(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const rect = cardRef.current?.getBoundingClientRect();
      const x = rect ? rect.left + rect.width / 2 : 0;
      const y = rect ? rect.top + rect.height / 2 : 0;
      setVariantMenuPos({ x, y });
    }
  };

  return (
    <>
      <div
        ref={cardRef}
        className={styles.card}
        style={{ cursor: 'pointer', zIndex: 1 }}
        onContextMenu={handleContextMenu}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={variantMenuPos !== null}
        aria-label={
          hasMultipleVariants
            ? `Choose ability variant for ${plane.name} (${variants?.length ?? 0} available)`
            : `Open ${plane.name} checklist`
        }
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
          {plane.author && (
            plane.author_weblink ? (
              <a
                href={plane.author_weblink}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.author}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(plane.author_weblink, '_blank', 'noopener,noreferrer');
                }}
              >
                {plane.author}
              </a>
            ) : (
              <span className={styles.author}>{plane.author}</span>
            )
          )}
          <span className={styles.type}>{plane.type}</span>
                </div>
        {typeof progress === 'number' && progress > 0 && (
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      {variantMenuPos && (() => {
        // No variants: show single "Open Checklist" entry for this plane.
        if (!variants || variants.length === 0) {
          return (
            <div
              ref={variantPopupRef}
              className={styles.contextMenu}
              style={{ top: variantMenuPos.y, left: variantMenuPos.x, transform: 'translate(-50%, -50%)' }}
              role="menu"
              aria-label={`Open ${plane.name} checklist`}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.contextMenuHeader}>{plane.name}</div>
              <button
                className={styles.contextMenuItem}
                onClick={e => handleVariantSelect(e, plane.id)}
                role="menuitem"
              >
                Open Checklist
              </button>
            </div>
          );
        }

        // Decide what layer to show:
        //   1. Single developer group → skip developer picker, show ability list.
        //   2. Multiple dev groups, none chosen → show developer list.
        //   3. Multiple dev groups, one chosen → show that dev's ability list.
        const showingDevList = hasMultipleDeveloperGroups && selectedDeveloper === null;
        const activeGroup = !showingDevList
          ? (hasMultipleDeveloperGroups
              ? developerGroups.find(g => g.key === selectedDeveloper)
              : developerGroups[0])
          : null;

        return (
          <div
            ref={variantPopupRef}
            className={styles.contextMenu}
            style={{ top: variantMenuPos.y, left: variantMenuPos.x, transform: 'translate(-50%, -50%)' }}
            role="menu"
            aria-label={
              showingDevList
                ? `Addon developer variants for ${plane.name}`
                : `Ability variants for ${plane.name}${activeGroup && hasMultipleDeveloperGroups ? ` (${activeGroup.label})` : ''}`
            }
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.contextMenuHeader}>
              {showingDevList
                ? 'Addon Developer'
                : hasMultipleDeveloperGroups && activeGroup
                  ? `${activeGroup.label} — Checklist Variant`
                  : 'Checklist Variant'}
            </div>

            {showingDevList && developerGroups.map(group => (
              <button
                key={group.key || '__default__'}
                className={styles.contextMenuItem}
                onClick={e => handleDeveloperPick(e, group)}
                role="menuitem"
              >
                {group.label}
                {group.planes.length > 1 ? ` (${group.planes.length})` : ''}
              </button>
            ))}

            {!showingDevList && activeGroup && sortByAbility(activeGroup.planes).map(v => (
              <button
                key={v.id}
                className={styles.contextMenuItem}
                onClick={e => handleVariantSelect(e, v.id)}
                role="menuitem"
              >
                {v.ability_variant ?? 'Standard'}
              </button>
            ))}

            {!showingDevList && hasMultipleDeveloperGroups && (
              <button
                className={styles.contextMenuItem}
                onClick={handleBackToDevelopers}
                role="menuitem"
                style={{ opacity: 0.75 }}
              >
                ← Back
              </button>
            )}
          </div>
        );
      })()}

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
