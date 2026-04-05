import { useState, useMemo, useCallback } from 'react';
import { PlaneCard } from '../components/PlaneCard';
import { ImageEditModal } from '../components/ImageEditModal';
import { FileImportModal } from '../components/FileImportModal';
import { AddReferenceTableModal } from '../components/AddReferenceTableModal';
import styles from './Home.module.css';
import { Search, Plus, Eye, Download, Upload, FileUp } from 'lucide-react';
import { useFleet } from '../hooks/useFleet';
import { useConfirm } from '../hooks/useConfirm';
import { parsePlaneCsv } from '../utils/csvParser';
import { validateChecklist, formatWarnings } from '../utils/checklistValidator';
import type { Plane, PlaneChecklist } from '../data/types';

type SortOption = 'name-asc' | 'name-desc' | 'manufacturer' | 'type';

export function Home() {
  const { planes, checklists, getProgress, recentlyUsed, addPlane, addVariant, resetFleet, deletePlane, updateChecklist, updatePlaneImage, exportFleet, favoriteIds, toggleFavorite } = useFleet();
  const { confirm, ConfirmDialog } = useConfirm();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [filterType, setFilterType] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [csvInput, setCsvInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingImagePlaneId, setEditingImagePlaneId] = useState<string | null>(null);
  const [addTablePlaneId, setAddTablePlaneId] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<string | null>(null);
  const [showFileImport, setShowFileImport] = useState(false);
  const [importCategory, setImportCategory] = useState('');

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

  const handleSaveReferenceTable = useCallback((updatedChecklist: PlaneChecklist) => {
    if (!addTablePlaneId) return;
    updateChecklist(addTablePlaneId, updatedChecklist);
    setAddTablePlaneId(null);
  }, [addTablePlaneId, updateChecklist]);

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
    const confirmed = await confirm(
      'Delete Plane',
      'Permanently delete this plane and its checklist data? This cannot be undone.',
      { confirmLabel: 'Delete', destructive: true }
    );
    if (confirmed) {
      deletePlane(planeId);
    }
  }, [confirm, deletePlane]);

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

    result.sort((a, b) => {
      const aFav = favoriteIds.includes(a.id) ? 0 : 1;
      const bFav = favoriteIds.includes(b.id) ? 0 : 1;
      return aFav - bFav;
    });

    return result;
  }, [planes, searchQuery, filterType, sortBy, favoriteIds]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const importPlane = useCallback(async (plane: Plane, checklist: PlaneChecklist, _variants?: Record<string, PlaneChecklist>) => {
    addPlane(plane, checklist);
    if (_variants) {
      for (const [name, cl] of Object.entries(_variants)) {
        addVariant(plane.id, name, cl);
      }
    }
  }, [addPlane, addVariant]);

  const handleImport = async () => {
    try {
      if (!csvInput.trim()) {
        alert('Please paste or upload CSV content first.');
        return;
      }
      const { plane, checklist, variants } = parsePlaneCsv(csvInput);

      if (checklist.phases.length === 0 && Object.keys(variants).length === 0) {
        alert('CSV was parsed but no checklist phases/items were found. Check your CSV format.');
        return;
      }

      if (imagePreview) {
        plane.image = imagePreview;
      }

      const totalItems = checklist.phases.reduce((sum, p) => sum + p.items.length, 0);
      const csvWarnings = formatWarnings(validateChecklist(checklist, plane));
      const category = importCategory.trim();
      if (category && category !== 'Standard') {
        if (!planes.some(p => p.id === plane.id)) {
          importPlane(plane, checklist);
        }
        addVariant(plane.id, category, checklist);
        alert(`Imported "${plane.name}" variant "${category}" with ${checklist.phases.length} phase(s) and ${totalItems} item(s).${csvWarnings}`);
      } else {
        importPlane(plane, checklist);
        alert(`Imported "${plane.name}" with ${checklist.phases.length} phase(s) and ${totalItems} item(s).${csvWarnings}`);
      }

      if (Object.keys(variants).length > 0) {
        for (const [variantName, variantChecklist] of Object.entries(variants)) {
          addVariant(plane.id, variantName, variantChecklist);
        }
        alert(`Also imported ${Object.keys(variants).length} sub-checklist(s): ${Object.keys(variants).join(', ')}`);
      }

      setIsModalOpen(false);
      setCsvInput('');
      setImagePreview(null);
      setImportCategory('');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to parse CSV');
    }
  };

  const sampleCsv = `name,manufacturer,type,image,checklist category,phase,item,expectedState
"Piper Archer II","Piper","GA","","Normal Checklist","Pre-Flight","Master Switch","ON"
"Piper Archer II","Piper","GA","","Normal Checklist","Pre-Flight","Fuel Pump","ON"
"Piper Archer II","Piper","GA","","Speeds","Takeoff","Vr","65 KIAS"`;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Select a Plane</h1>
          <div className={styles.actions}>
            <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
              <Plus size={18} /> Add Plane
            </button>
            <button className={styles.resetButton} onClick={() => setShowFileImport(true)}>
              <FileUp size={18} /> Import File
            </button>
            <button className={styles.resetButton} onClick={exportFleet}>
              <Download size={18} /> Export Fleet
            </button>
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
          </div>
          <div className={styles.sortWrapper}>
            <select
              className={styles.sortSelect}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              {typeOptions.map(type => (
                <option key={type} value={type}>{type === 'All' ? 'All Types' : type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {importSummary && (
        <div className={styles.importSummary}>
          {importSummary}
          <button className={styles.closeSummary} onClick={() => setImportSummary(null)}>×</button>
        </div>
      )}

      {recentPlanes.length > 0 && (
        <section className={styles.recentSection}>
          <h2 className={styles.sectionTitle}>Continue</h2>
          <div className={styles.recentGrid}>
            {recentPlanes.map(r => {
              const plane = planes.find(p => p.id === r.planeId);
              if (!plane) return null;
              return (
                <PlaneCard
                  key={plane.id}
                  plane={plane}
                  progress={getPlaneProgress(plane.id)}
                  isFavorite={favoriteIds.includes(plane.id)}
                  onToggleFavorite={() => toggleFavorite(plane.id)}
                  onEditImage={handleEditImage}
                  onAddReferenceTable={handleAddReferenceTable}
                  onHide={handleHidePlane}
                  onDelete={handleDeletePlane}
                />
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className={styles.sectionTitle}>All Planes ({filteredPlanes.length})</h2>
        {filteredPlanes.length === 0 ? (
          <div className={styles.empty}>
            <p>No planes found.</p>
            <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
              <Plus size={18} /> Add your first plane
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredPlanes.map(plane => (
              <PlaneCard
                key={plane.id}
                plane={plane}
                progress={getPlaneProgress(plane.id)}
                isFavorite={favoriteIds.includes(plane.id)}
                onToggleFavorite={() => toggleFavorite(plane.id)}
                onEditImage={handleEditImage}
                onAddReferenceTable={handleAddReferenceTable}
                onHide={handleHidePlane}
                onDelete={handleDeletePlane}
              />
            ))}
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Add New Plane</h2>
              <button className={styles.modalClose} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p>Paste your CSV data below to add a new plane to your fleet.</p>
              <textarea
                className={styles.csvInput}
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder={`name,manufacturer,type,image,checklist category,phase,item,expectedState\n${sampleCsv}`}
                rows={10}
                spellCheck={false}
              />
              {imagePreview && (
                <div className={styles.imagePreview}>
                  <img src={imagePreview} alt="Preview" />
                  <button className={styles.removeImage} onClick={() => setImagePreview(null)}>×</button>
                </div>
              )}
              <div className={styles.imageUpload}>
                <label className={styles.uploadLabel}>
                  <Upload size={16} /> Upload image
                  <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                </label>
              </div>
              <div className={styles.categoryRow}>
                <label>Import Category:</label>
                <select
                  value={importCategory}
                  onChange={(e) => setImportCategory(e.target.value)}
                >
                  <option value="">Standard</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Abnormal">Abnormal</option>
                  <option value="Reference Tables">Reference Tables</option>
                </select>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button className={styles.importButton} onClick={handleImport}>
                Import
              </button>
            </div>
          </div>
        </div>
      )}

      {showFileImport && (
        <FileImportModal
          onImport={importPlane}
          onClose={() => setShowFileImport(false)}
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

      {editingPlane && (
        <ImageEditModal
          planeName={editingPlane.name}
          currentImage={editingPlane.image}
          onSave={handleSaveImage}
          onCancel={() => setEditingImagePlaneId(null)}
        />
      )}

      {ConfirmDialog}
    </div>
  );
}
