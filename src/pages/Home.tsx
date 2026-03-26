import { useState, useMemo, useCallback } from 'react';
import { PlaneCard } from '../components/PlaneCard';
import { ImageEditModal } from '../components/ImageEditModal';
import styles from './Home.module.css';
import { Search, Plus, Eye, ChevronDown, Download, Upload } from 'lucide-react';
import { useFleet } from '../hooks/useFleet';
import { useConfirm } from '../hooks/useConfirm';
import { parsePlaneCsv } from '../utils/csvParser';

type SortOption = 'name-asc' | 'name-desc' | 'manufacturer' | 'type';
type SimFilter = 'all' | 'msfs2020' | 'msfs2024';

const SIM_LABELS: Record<SimFilter, string> = {
  all: 'All Sims',
  msfs2020: 'MSFS 2020',
  msfs2024: 'MSFS 2024',
};

export function Home() {
  const { planes, checklists, getProgress, recentlyUsed, addPlane, resetFleet, deletePlane, updatePlaneImage, exportFleet, importFleet, favoriteIds, toggleFavorite } = useFleet();
  const { confirm, ConfirmDialog } = useConfirm();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [filterType, setFilterType] = useState('All');
  const [filterSim, setFilterSim] = useState<SimFilter>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [csvInput, setCsvInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingImagePlaneId, setEditingImagePlaneId] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<string | null>(null);

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
      const matchesSim = filterSim === 'all' ||
        plane.sim === filterSim ||
        plane.sim === 'both' ||
        !plane.sim; // custom planes without sim tag show in all
      return matchesSearch && matchesType && matchesSim;
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
  }, [planes, searchQuery, filterType, filterSim, sortBy, favoriteIds]);

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

  const handleImport = () => {
    try {
      const { plane, checklist } = parsePlaneCsv(csvInput);
      
      // Override image if a file was uploaded
      if (imagePreview) {
        plane.image = imagePreview;
      }
      
      addPlane(plane, checklist);
      setIsModalOpen(false);
      setCsvInput('');
      setImagePreview(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to parse CSV');
    }
  };

  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        const result = importFleet(json);
        setImportSummary(
          `Imported ${result.planes} plane(s), ${result.checklists} checklist(s), ${result.progress} progress record(s).`
        );
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to import backup');
      }
    };
    reader.readAsText(file);
  };

  const sampleCsv = `name,manufacturer,type,image,phase,item,expectedState
"Piper Archer II","Piper","GA","https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&q=80&w=1200","Pre-Flight","Master Switch","ON"
"Piper Archer II","Piper","GA","https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&q=80&w=1200","Pre-Flight","Fuel Pump","ON"`;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Select a Plane</h1>
          <div className={styles.actions}>
            <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
              <Plus size={18} /> Add Plane
            </button>
            <button className={styles.resetButton} onClick={handleShowAll}>
              <Eye size={18} /> Show All
            </button>
            <button className={styles.resetButton} onClick={exportFleet}>
              <Download size={18} /> Export Fleet
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

      <div className={styles.simTabs}>
        {(Object.keys(SIM_LABELS) as SimFilter[]).map(sim => (
          <button
            key={sim}
            className={`${styles.simTab} ${filterSim === sim ? styles.simTabActive : ''}`}
            onClick={() => setFilterSim(sim)}
          >
            {SIM_LABELS[sim]}
          </button>
        ))}
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
                  onEditImage={handleEditImage}
                />
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.filterBar}>
        <div className={styles.filterChips}>
          {typeOptions.map(type => (
            <button
              key={type}
              className={`${styles.filterChip} ${filterType === type ? styles.filterChipActive : ''}`}
              onClick={() => setFilterType(type)}
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
              onEditImage={handleEditImage}
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

      {editingPlane && (
        <ImageEditModal
          planeName={editingPlane.name}
          currentImage={editingPlane.image}
          onSave={handleSaveImage}
          onCancel={() => setEditingImagePlaneId(null)}
        />
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Import Plane & Checklist</h2>

            <div className={styles.fileInputWrapper}>
              <label className={styles.csvLabel}>
                <Upload size={14} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                Import Fleet Backup (JSON):
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleJsonImport}
                className={styles.fileInput}
              />
              {importSummary && (
                <span className={styles.importSummary}>{importSummary}</span>
              )}
            </div>

            <div className={styles.sectionDivider}>
              <span>Or import a single plane via CSV</span>
            </div>

            <div className={styles.fileInputWrapper}>
              <label className={styles.csvLabel}>Aircraft Image (Optional):</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className={styles.fileInput}
              />
            </div>

            <label className={styles.csvLabel}>Paste CSV Content:</label>
            <textarea
              className={styles.textarea}
              placeholder={sampleCsv}
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
            />
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton} 
                onClick={() => {
                  setIsModalOpen(false);
                  setImagePreview(null);
                  setImportSummary(null);
                }}
              >
                Cancel
              </button>
              <button className={styles.submitButton} onClick={handleImport}>
                Import Fleet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
