import { useState, useMemo, useCallback } from 'react';
import { PlaneCard } from '../components/PlaneCard';
import { ImageEditModal } from '../components/ImageEditModal';
import { FileImportModal } from '../components/FileImportModal';
import { AddReferenceTableModal } from '../components/AddReferenceTableModal';
import styles from './Home.module.css';
import { Search, Plus, Eye, ChevronDown, Download, Upload } from 'lucide-react';
import { useFleet } from '../hooks/useFleet';
import { useConfirm } from '../hooks/useConfirm';
import { useAuth } from '../contexts/AuthContext';
import { useImportHandlers } from '../hooks/useImportHandlers';
import { createSharedChecklist, createPendingSubmission, listSharedPlanes, listAllSharedChecklists, updateSharedChecklist, deleteSharedPlane, deleteSharedChecklist } from '../api/sharedPlanes';
import type { PlaneChecklist } from '../data/types';
import { exportPlaneAsJson, exportPlaneAsHtml, exportPlaneAsChecklistJson } from '../utils/exportPlane';
import { deduplicateChecklistWithCategories } from '../utils/checklistDedup';

type SortOption = 'name-asc' | 'name-desc' | 'manufacturer' | 'type';

export function Home() {
  const { planes, checklists, getProgress, recentlyUsed, addPlane, addCategory, resetFleet, deletePlane, updateChecklist, updatePlaneImage, exportFleet, importFleet, favoriteIds, toggleFavorite, refreshSharedPlanes } = useFleet();
  const { confirm, ConfirmDialog } = useConfirm();
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [filterType, setFilterType] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImagePlaneId, setEditingImagePlaneId] = useState<string | null>(null);
  const [addTablePlaneId, setAddTablePlaneId] = useState<string | null>(null);
  const [fileImportFile, setFileImportFile] = useState<File | null>(null);

  const handleImportComplete = useCallback(() => {
    setFilterType('All');
    setSearchQuery('');
  }, []);

  const {
    importSummary, setImportSummary,
    importPlane, handleJsonImport,
  } = useImportHandlers({ planes, addPlane, addCategory, importFleet, isAdmin, refreshSharedPlanes, onImportComplete: handleImportComplete });

  const editingPlane = useMemo(
    () => editingImagePlaneId ? planes.find(p => p.id === editingImagePlaneId) ?? null : null,
    [editingImagePlaneId, planes]
  );

  const getPlaneProgress = useCallback((planeId: string): number => {
    const cl = checklists[planeId];
    if (!cl) return 0;
    const progress = getProgress(planeId);
    const allIds = cl.phases.flatMap(p => p.items.map(i => i.id));
    if (allIds.length === 0) return 0;
    const checked = allIds.filter(id => progress[id]).length;
    return Math.round((checked / allIds.length) * 100);
  }, [checklists, getProgress]);

  const recentPlanes = useMemo(() => {
    return recentlyUsed
      .filter(r => {
        const progress = getPlaneProgress(r.planeId);
        return progress > 0 && progress < 100;
      })
      .slice(0, 3);
  }, [recentlyUsed, getPlaneProgress]);

  const handleEditImage = useCallback((planeId: string) => {
    setEditingImagePlaneId(planeId);
  }, []);

  const handleAddReferenceTable = useCallback((planeId: string) => {
    setAddTablePlaneId(planeId);
  }, []);

  const handleDownloadJson = useCallback((planeId: string) => {
    const plane = planes.find(p => p.id === planeId);
    if (!plane) return;
    exportPlaneAsJson(plane, checklists);
  }, [planes, checklists]);

  const handleDownloadHtml = useCallback((planeId: string) => {
    const plane = planes.find(p => p.id === planeId);
    if (!plane) return;
    exportPlaneAsHtml(plane, checklists);
  }, [planes, checklists]);

  const handleDownloadChecklistJson = useCallback((planeId: string) => {
    const plane = planes.find(p => p.id === planeId);
    if (!plane) return;
    exportPlaneAsChecklistJson(plane, checklists);
  }, [planes, checklists]);

  const handleSaveReferenceTable = useCallback(async (updatedChecklist: PlaneChecklist) => {
    if (!addTablePlaneId) return;
    if (isAdmin) {
      const checklistRecords = await listAllSharedChecklists();
      const record = checklistRecords.find(c => c.plane_id === addTablePlaneId);
      if (record) {
        await updateSharedChecklist(record.id, JSON.stringify(updatedChecklist.phases));
        try { localStorage.removeItem('shared_planes_cache'); } catch { /* */ }
        await refreshSharedPlanes();
      } else {
        updateChecklist(addTablePlaneId, updatedChecklist);
      }
    } else {
      updateChecklist(addTablePlaneId, updatedChecklist);
    }
    setAddTablePlaneId(null);
  }, [addTablePlaneId, isAdmin, updateChecklist, refreshSharedPlanes]);

  const handleSaveImage = useCallback((newImage: string) => {
    if (editingImagePlaneId) {
      updatePlaneImage(editingImagePlaneId, newImage);
      setEditingImagePlaneId(null);
    }
  }, [editingImagePlaneId, updatePlaneImage]);

  const handleHidePlane = useCallback(async (planeId: string) => {
    const confirmed = await confirm(
      'Hide Plane',
      'Hide this plane from your fleet? You can restore it with "Show All".',
      { confirmLabel: 'Hide', destructive: true }
    );
    if (confirmed) {
      deletePlane(planeId);
    }
  }, [confirm, deletePlane]);

  
const handleDeletePlane = useCallback(async (planeId: string) => {
    // 1. Confirmation check
    const confirmed = await confirm(
      'Delete Plane',
      'Permanently delete this plane and its checklist data? This cannot be undone.',
      { confirmLabel: 'Delete', destructive: true }
    );
    if (!confirmed) return;

    if (isAdmin) {
      try {
        // A. Attempt to delete from shared database (Supabase)
        const [planeRecords, checklistRecords] = await Promise.all([listSharedPlanes(),
listAllSharedChecklists()]);
        const planeRecord = planeRecords.find(p => p.plane_id === planeId);
        const checklistRecord = checklistRecords.find(c => c.plane_id === planeId);

        if (planeRecord) await deleteSharedPlane(planeRecord.id);
        if (checklistRecord) await deleteSharedChecklist(checklistRecord.id);

        // B. Clean up general shared cache if successful
        try { localStorage.removeItem('shared_planes_cache'); } catch { /* */ }
        await refreshSharedPlanes();
      } catch (error) {
        console.log('[FlightCheck] Supabase delete failed, falling back to localStorage:', error);
        // If the network fails, we still want to proceed with local cleanup
      }
    }

    // =====================================================================
    // 2. LOCAL CLEANUP (THIS HAPPENS EVERY TIME, REGARDLESS OF ADMIN STATUS)
    // =====================================================================

    // Always attempt local cleanup regardless of backend success/failure.
    try {
        await deletePlane(planeId);
    } catch (error) {
        console.error("Error during local plane deletion:", error);
    }

}, [confirm, isAdmin, deletePlane, refreshSharedPlanes]);


  const handleShowAll = useCallback(async () => {
    const confirmed = await confirm(
      'Show All Planes',
      'This will restore all hidden planes and remove imported ones. Continue?',
      { confirmLabel: 'Show All' }
    );
    if (confirmed) {
      resetFleet();
    }
  }, [confirm, resetFleet]);

  const typeOptions = useMemo(() => {
    const types = Array.from(new Set(planes.map(p => p.type))).sort();
    return ['All', ...types];
  }, [planes]);

  const filteredPlanes = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const result = planes.filter(plane => {
      const matchesSearch = plane.name.toLowerCase().includes(query) ||
        plane.manufacturer.toLowerCase().includes(query);
      const matchesType = filterType === 'All' || plane.type === filterType;
      return matchesSearch && matchesType;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'manufacturer':
          return a.manufacturer.localeCompare(b.manufacturer);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    // Pin favorites to top
    result.sort((a, b) => {
      const aFav = favoriteIds.includes(a.id) ? 0 : 1;
      const bFav = favoriteIds.includes(b.id) ? 0 : 1;
      return aFav - bFav;
    });

    return result;
  }, [planes, searchQuery, filterType, sortBy, favoriteIds]);

  const sampleCsv = null; void sampleCsv;


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Select a Plane</h1>
          <div className={styles.actions}>
            {isAdmin && (
              <>
                <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
                  <Plus size={18} /> Add Plane
                </button>
                <button className={styles.resetButton} onClick={exportFleet}>
                  <Download size={18} /> Export Fleet
                </button>
              </>
            )}
            <button className={styles.resetButton} onClick={handleShowAll}>
              <Eye size={18} /> Show All
            </button>
          </div>
        </div>
        <div className={styles.searchRow}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by model or manufacturer..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={styles.sortWrapper}>
            <select
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="manufacturer">Manufacturer (A-Z)</option>
              <option value="type">Type</option>
            </select>
            <ChevronDown className={styles.sortIcon} size={16} />
          </div>
        </div>
      </div>

      {recentPlanes.length > 0 && !searchQuery && (
        <div className={styles.recentSection}>
          <h2 className={styles.recentTitle}>Continue</h2>
          <div className={styles.recentGrid}>
            {recentPlanes.map(rp => {
              const plane = planes.find(p => p.id === rp.planeId);
              if (!plane) return null;
              const progress = getPlaneProgress(plane.id);
              return (
                <PlaneCard
                  key={`recent-${plane.id}`}
                  plane={plane}
                  progress={progress}
                  isFavorite={favoriteIds.includes(plane.id)}
                  onToggleFavorite={toggleFavorite}
                  onHide={handleHidePlane}
                  onDelete={handleDeletePlane}
                  onEditImage={handleEditImage}
                  onDownloadJson={handleDownloadJson}
                  onDownloadChecklistJson={handleDownloadChecklistJson}
                  onDownloadHtml={handleDownloadHtml}
                />
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.filterBar}>
        <div className={styles.filterChips} role="radiogroup" aria-label="Filter by aircraft type">
          {typeOptions.map(type => (
            <button
              key={type}
              className={`${styles.filterChip} ${filterType === type ? styles.filterChipActive : ''}`}
              onClick={() => setFilterType(type)}
              role="radio"
              aria-checked={filterType === type}
            >
              {type}
            </button>
          ))}
        </div>
        <span className={styles.resultCount}>
          Showing {filteredPlanes.length} of {planes.length} planes
        </span>
      </div>

      {filteredPlanes.length > 0 ? (
        <div className={styles.grid}>
          {filteredPlanes.map(plane => (
            <PlaneCard
              key={plane.id}
              plane={plane}
              progress={getPlaneProgress(plane.id)}
              isFavorite={favoriteIds.includes(plane.id)}
              onToggleFavorite={toggleFavorite}
              onHide={handleHidePlane}
              onDelete={handleDeletePlane}
              onEditImage={handleEditImage}
              onAddReferenceTable={isAdmin ? handleAddReferenceTable : undefined}
              onDownloadJson={handleDownloadJson}
              onDownloadChecklistJson={handleDownloadChecklistJson}
              onDownloadHtml={handleDownloadHtml}
            />
          ))}
        </div>
      ) : (
        <div className={styles.noResults}>
          <p>No planes found matching "{searchQuery}"</p>
          <button 
            className={styles.clearButton}
            onClick={() => setSearchQuery('')}
          >
            Clear Search
          </button>
        </div>
      )}

      {ConfirmDialog}

      {fileImportFile && (
        <FileImportModal
          initialFile={fileImportFile}
          onImport={async (plane, checklist, categorys) => {
            // Cross-dedup: remove lower-priority categories with near-identical phases
            console.log('[Home onImport] Starting dedup. categories:', Object.keys(categorys ?? {}));
            const dedupResult = deduplicateChecklistWithCategories(
              plane.id,
              checklist,
              categorys ?? {},
            );
            checklist = dedupResult.checklist;
            categorys = dedupResult.categories;
            console.log('[Home onImport] After dedup. categories:', Object.keys(categorys ?? {}));

            await importPlane(plane, checklist);
            if (categorys && Object.keys(categorys).length > 0) {
              for (const [categoryName, categoryChecklist] of Object.entries(categorys)) {
                if (isAdmin) {
                  const allCl = await listAllSharedChecklists();
                  const existing = allCl.find(c => c.plane_id === plane.id && c.category === categoryName);
                  if (existing) {
                    await updateSharedChecklist(existing.id, JSON.stringify(categoryChecklist.phases));
                  } else {
                    await createSharedChecklist({ plane_id: plane.id, category: categoryName, phases: JSON.stringify(categoryChecklist.phases) });
                  }
                } else {
                  addCategory(plane.id, categoryName, categoryChecklist);
                }
              }
            }
            setFileImportFile(null);
            setFilterType('All');
            setSearchQuery('');
            if (!isAdmin) {
              const submitToAll = window.confirm(`Would you also like to submit "${plane.name}" for all users? (Requires admin approval)`);
              if (submitToAll) {
                await createPendingSubmission({
                  name: plane.name,
                  manufacturer: plane.manufacturer,
                  image: plane.image || null,
                  type: plane.type,
                  sim: plane.sim || null,
                  phases: JSON.stringify(checklist.phases),
                  submitted_by: null,
                  status: 'pending',
                });
                alert('Submitted for review! An admin will approve it shortly.');
              }
            }
          }}
          onClose={() => setFileImportFile(null)}
        />
      )}

      {editingPlane && (
        <ImageEditModal
          planeName={editingPlane.name}
          currentImage={editingPlane.image}
          onSave={handleSaveImage}
          onCancel={() => setEditingImagePlaneId(null)}
        />
      )}

      {addTablePlaneId && (
        <AddReferenceTableModal
          planeName={planes.find(p => p.id === addTablePlaneId)?.name ?? ''}
          planeId={addTablePlaneId}
          existingChecklist={checklists[addTablePlaneId] ?? null}
          onSave={handleSaveReferenceTable}
          onCancel={() => setAddTablePlaneId(null)}
        />
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Add Plane</h2>

            <div className={styles.fileInputWrapper}>
              <label className={styles.csvLabel}>
                <Upload size={14} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                Choose file (JSON, CSV, HTML, PDF or DOCX):
              </label>
              <input
                type="file"
                accept=".json,.csv,.html,.htm,.pdf,.docx,text/csv,application/json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const name = file.name.toLowerCase();
                  if (name.endsWith('.json')) {
                    handleJsonImport(e as React.ChangeEvent<HTMLInputElement>);
                  } else {
                    setIsModalOpen(false);
                    setFileImportFile(file);
                  }
                }}
                className={styles.fileInput}
              />
            </div>

            {importSummary && (
              <span className={styles.importSummary}>{importSummary}</span>
            )}

            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => {
                  setIsModalOpen(false);
                  setImportSummary(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
