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
    // Close variant menu if open
    setVariantMenuPos(null);
    setSelectedDeveloper(null);

    const rect = cardRef.current?.getBoundingClientRect();
    const x = rect ? rect.right : e.clientX;
    const y = rect ? rect.top : e.clientY;
    setMenuPos({ x, y });
  };

  // Close menu on click outside or scroll
  useEffect(() => {
    if (!menuPos) return;
    const close = (e: Event) => {
      const target = e.target as HTMLElement;
      // Find the clicked card (if any)
      const clickedCard = target.closest('[data-plane-id]');

      // Don't close if clicking on this same card
      if (clickedCard === cardRef.current) {
        return;
      }

      // Close if clicking outside or on a different card
      setMenuPos(null);
    };
    window.addEventListener('click', close);
    window.addEventListener('scroll', close, true);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [menuPos, plane.id]);

  // Close variant picker on outside click or scroll
  useEffect(() => {
    if (!variantMenuPos) return;
    const close = (e: Event) => {
      const target = e.target as HTMLElement;
      // Find the clicked card (if any)
      const clickedCard = target.closest('[data-plane-id]');

      // Don't close if clicking on this same card
      if (clickedCard === cardRef.current) {
        return;
      }

      // Close if clicking outside or on a different card
      setVariantMenuPos(null);
      setSelectedDeveloper(null);
    };
    window.addEventListener('click', close);
    window.addEventListener('scroll', close, true);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [variantMenuPos, plane.id]);

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
    // Close any open context menu when clicking the card
    setMenuPos(null);

    if (hasMultipleVariants) {
      // Open the variant picker instead of navigating. Anchor it to the top-left
      // of the card in viewport coords so the document-root popover lines up.
      // stopPropagation so the document-level "close" listener doesn't
      // immediately dismiss it.
      e.stopPropagation();
      const rect = cardRef.current?.getBoundingClientRect();
      const x = rect ? rect.left : e.clientX;
      const y = rect ? rect.top : e.clientY;
      setVariantMenuPos({ x, y });
      return;
    }
    console.log('>>>> CLICK fired for:', plane.id);
    window.location.href = `/checklist/${plane.id}`;
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
      if (hasMultipleVariants) {
        e.preventDefault();
        const rect = cardRef.current?.getBoundingClientRect();
        const x = rect ? rect.left : 0;
        const y = rect ? rect.top : 0;
        setVariantMenuPos({ x, y });
        return;
      }
      console.log('>>>> handleKeyDown fired for:', plane.id);
      window.location.href = `/checklist/${plane.id}`;
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
        aria-haspopup={hasMultipleVariants ? 'menu' : undefined}
        aria-expanded={hasMultipleVariants ? variantMenuPos !== null : undefined}
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

      {hasMultipleVariants && variantMenuPos && (() => {
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
            className={styles.contextMenu}
            style={{ top: variantMenuPos.y, left: variantMenuPos.x }}
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
