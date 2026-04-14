import { useState, useMemo, useCallback } from 'react';
import { PlaneCard } from '../components/PlaneCard';
import { ImageEditModal } from '../components/ImageEditModal';
import { FileImportModal } from '../components/FileImportModal';
import { AddReferenceTableModal } from '../components/AddReferenceTableModal';
import styles from './Home.module.css';
import { Search, Plus, Eye, ChevronDown, Download, Upload, FileUp } from 'lucide-react';
import { useFleet } from '../hooks/useFleet';
import { useConfirm } from '../hooks/useConfirm';
import { useAuth } from '../contexts/AuthContext';
import { parsePlaneCsv } from '../utils/csvParser';
import { validateChecklist, formatWarnings } from '../utils/checklistValidator';
import { createSharedPlane, createSharedChecklist, createPendingSubmission, listSharedPlanes, listAllSharedChecklists, updateSharedPlane, updateSharedChecklist, deleteSharedPlane, deleteSharedChecklist } from '../api/sharedPlanes';
import type { Plane, PlaneChecklist } from '../data/types';

type SortOption = 'name-asc' | 'name-desc' | 'manufacturer' | 'type';

export function Home() {
  const { planes, checklists, getProgress, recentlyUsed, addPlane, addCategory, resetFleet, deletePlane, updateChecklist, updatePlaneImage, exportFleet, importFleet, favoriteIds, toggleFavorite, refreshSharedPlanes } = useFleet();
  const { confirm, ConfirmDialog } = useConfirm();
  const { isAdmin } = useAuth();
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
  

  // When admin, imports go to Supabase. Otherwise localStorage.
  const importPlane = useCallback(async (plane: Plane, checklist: PlaneChecklist) => {
    console.log(`[FlightCheck Import] isAdmin=${isAdmin}, plane=${plane.id} "${plane.name}", phases=${checklist.phases.length}, items=${checklist.phases.reduce((s, p) => s + p.items.length, 0)}`);
    
    // Try admin path first, but catch errors and fall back to local storage
    let supabaseSuccess = false;
    if (isAdmin) {
      console.log('[FlightCheck Import] Admin path → saving to Supabase...');
      try {
        // Check if plane already exists to avoid duplicates
        const existingPlanes = await listSharedPlanes();
        const existing = existingPlanes.find(p => p.plane_id === plane.id);

        if (existing) {
          console.log('[FlightCheck Import] Plane already exists, updating...');
          await updateSharedPlane(existing.id, {
            name: plane.name,
            manufacturer: plane.manufacturer,
            image: plane.image,
            type: plane.type,
            sim: plane.sim || null,
          });
          const existingChecklists = await listAllSharedChecklists();
          const existingCl = existingChecklists.find(c => c.plane_id === plane.id && c.category.toLowerCase() === 'normal');
          if (existingCl) {
            await updateSharedChecklist(existingCl.id, JSON.stringify(checklist.phases));
          } else {
            await createSharedChecklist({ plane_id: plane.id, category: 'normal', phases: JSON.stringify(checklist.phases) });
          }
          supabaseSuccess = true;
        } else {
          const planeResult = await createSharedPlane({
            plane_id: plane.id,
            name: plane.name,
            manufacturer: plane.manufacturer,
            image: plane.image,
            type: plane.type,
            sim: plane.sim || null,
            sort_order: null,
          });
          if (planeResult) {
            console.log('[FlightCheck Import] Plane created, saving checklist...');
            await createSharedChecklist({
              plane_id: plane.id,
              category: 'normal',
              phases: JSON.stringify(checklist.phases),
            });
            supabaseSuccess = true;
          }
        }
      } catch (error) {
        console.log('[FlightCheck Import] Supabase error:', error);
      }
      
      if (supabaseSuccess) {
        console.log('[FlightCheck Import] Clearing cache and refreshing...');
        try { localStorage.removeItem('shared_planes_cache'); } catch { /* */ }
        await refreshSharedPlanes();
        console.log('[FlightCheck Import] Refresh complete');
        return;
      }
    }
    
    // Fall back to local storage when Supabase fails
    console.log('[FlightCheck Import] Non-admin path → saving to localStorage');
    addPlane(plane, checklist);
  }, [isAdmin, addPlane, refreshSharedPlanes]);

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

  const handleImport = async () => {
    try {
      if (!csvInput.trim()) {
        alert('Please paste or upload CSV content first.');
        return;
      }
      const { plane, checklist, categories } = parsePlaneCsv(csvInput);
      console.log('[FlightCheck Import] Parsed plane:', plane, 'checklist phases:', checklist.phases.length, 'categories:', Object.keys(categories));

      if (checklist.phases.length === 0 && Object.keys(categories).length === 0) {
        alert('CSV was parsed but no checklist phases/items were found. Check your CSV format.');
        return;
      }

      // Override image if a file was uploaded
      if (imagePreview) {
        plane.image = imagePreview;
      }

      // Import main checklist
      const totalItems = checklist.phases.reduce((sum, p) => sum + p.items.length, 0);
      const csvWarnings = formatWarnings(validateChecklist(checklist, plane));

      // Always import the plane directly to localStorage (skip Supabase which fails)
      console.log('[FlightCheck Import] Adding plane to localStorage:', plane.id);
      addPlane(plane, checklist);
      console.log('[FlightCheck Import] After addPlane, planes now:', planes.map(p => p.id));
      
      // Import categories from the CSV
      const categoryKeys = Object.keys(categories);
      console.log('[FlightCheck Import] Adding categories:', categoryKeys);
      for (const categoryName of categoryKeys) {
        const categoryChecklist = categories[categoryName];
        console.log('[FlightCheck Import] Adding category:', categoryName, 'phases:', categoryChecklist.phases.map((p: { title: string }) => p.title));
        addCategory(plane.id, categoryName, categoryChecklist);
      }

      const totalCategoryItems = categoryKeys.reduce((sum: number, cat: string) => sum + (categories[cat]?.phases.reduce((s: number, p: { items: unknown[] }) => s + p.items.length, 0) || 0), 0);
      
      // Delay alert and close to let state update
      setTimeout(() => {
        alert(`Imported "${plane.name}" with ${checklist.phases.length} phase(s), ${totalItems} main items, and ${categoryKeys.length} category(ies) with ${totalCategoryItems} items.${isAdmin ? ' (saved to shared database)' : ''}${csvWarnings}`);
        if (!isAdmin) {
          const submitToAll = window.confirm(`Would you also like to submit "${plane.name}" for all users? (Requires admin approval)`);
          if (submitToAll) {
            createPendingSubmission({
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
      }, 100);
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
    reader.onload = async () => {
      try {
        const json = JSON.parse(reader.result as string);

        // Format 1: Flat array of items [{ name, manufacturer, phase, item, expectedState, category? }, ...]
        if (Array.isArray(json) && json.length > 0 && json[0].phase && json[0].item) {
          const first = json[0];
          const name = first.name || file.name.replace(/\.[^.]+$/, '');
          const planeId = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const plane = { id: planeId, name, manufacturer: first.manufacturer || '', image: first.image || '', type: first.type || 'GA' };

          const MAIN_KEY = '__main__';
          // Group items by category, then by phase
          const categoryPhaseMaps = new Map<string, Map<string, { id: string; title: string; items: { id: string; label: string; expectedState?: string; reference?: string }[] }>>();
          for (const row of json) {
            const phaseTitle = row.phase?.trim();
            const itemLabel = row.item?.trim();
            if (!phaseTitle || !itemLabel) continue;

            const rowCategory = (row.category || row.checklistCategory || row['checklist category'] || row['Checklist Category'] || '').trim();
            const isMain = !rowCategory || rowCategory.toLowerCase() === 'normal checklist' || rowCategory.toLowerCase() === 'standard';
            const mapKey = isMain ? MAIN_KEY : rowCategory;

            if (!categoryPhaseMaps.has(mapKey)) {
              categoryPhaseMaps.set(mapKey, new Map());
            }
            const phasesMap = categoryPhaseMaps.get(mapKey)!;

            if (!phasesMap.has(phaseTitle)) {
              const phaseId = phaseTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
              phasesMap.set(phaseTitle, { id: phaseId, title: phaseTitle, items: [] });
            }
            const phase = phasesMap.get(phaseTitle)!;
            phase.items.push({
              id: `${phase.id}-${phase.items.length}`,
              label: itemLabel,
              expectedState: row.expectedState?.trim() || undefined,
              reference: row.reference?.trim() || undefined,
            });
          }

          // Build main checklist
          const mainPhasesMap = categoryPhaseMaps.get(MAIN_KEY) ?? new Map();
          const phases = Array.from(mainPhasesMap.values());
          const totalItems = phases.reduce((sum, p) => sum + p.items.length, 0);
          const checklist = { planeId, phases };

          // Build variant checklists
          const jsonVariants: Record<string, { planeId: string; phases: typeof phases }> = {};
          for (const [key, phasesMap] of categoryPhaseMaps) {
            if (key === MAIN_KEY) continue;
            jsonVariants[key] = {
              planeId,
              phases: Array.from(phasesMap.values()),
            };
          }

          const jsonWarnings = formatWarnings(validateChecklist(checklist, plane));
          const category = '';
          if (category && category !== 'Standard') {
            if (!planes.some(p => p.id === planeId)) {
              await importPlane(plane, checklist);
            }
            addCategory(planeId, category, checklist);
            setImportSummary(`Imported "${name}" variant "${category}" with ${phases.length} phase(s) and ${totalItems} item(s).${isAdmin ? ' (shared)' : ''}${jsonWarnings}`);
          } else {
            await importPlane(plane, checklist);
            setImportSummary(`Imported "${name}" with ${phases.length} phase(s) and ${totalItems} item(s).${isAdmin ? ' (shared)' : ''}${jsonWarnings}`);
            if (!isAdmin) {
              const submitToAll = window.confirm(`Would you also like to submit "${name}" for all users? (Requires admin approval)`);
              if (submitToAll) {
                await createPendingSubmission({
                  name,
                  manufacturer: plane.manufacturer,
                  image: plane.image || null,
                  type: plane.type,
                  sim: undefined,
                  phases: JSON.stringify(phases),
                  submitted_by: null,
                  status: 'pending',
                });
                setImportSummary(prev => (prev || '') + ' Submitted for community review!');
              }
            }
          }

          // Auto-import category-based variants from JSON
          for (const [variantName, variantChecklist] of Object.entries(jsonVariants)) {
            if (!planes.some(p => p.id === planeId)) {
              await importPlane(plane, checklist);
            }
            addCategory(planeId, variantName, variantChecklist);
          }
          if (Object.keys(jsonVariants).length > 0) {
            setImportSummary(prev => (prev || '') + ` Also imported ${Object.keys(jsonVariants).length} variant(s): ${Object.keys(jsonVariants).join(', ')}`);
          }

          
          return;
        }

        // Format 2: Single plane { plane: {...}, checklist: {...} }
        if (json.plane && json.checklist && json.checklist.phases) {
          await importPlane(json.plane, json.checklist);
          const fmt2Warnings = formatWarnings(validateChecklist(json.checklist, json.plane));
          setImportSummary(`Imported "${json.plane.name}" successfully.${isAdmin ? ' (shared)' : ''}${fmt2Warnings}`);
          return;
        }

        // Format 3: Checklist with plane info { name, phases } or { planeId, phases }
        if (json.phases && Array.isArray(json.phases)) {
          const name = json.name || json.planeId || file.name.replace(/\.[^.]+$/, '');
          const planeId = (json.planeId || name).toLowerCase().replace(/[^a-z0-9]/g, '-');
          const plane = { id: planeId, name, manufacturer: json.manufacturer || '', image: json.image || '', type: json.type || 'GA' };
          const checklist = { planeId, phases: json.phases };
          await importPlane(plane, checklist);
          const fmt3Warnings = formatWarnings(validateChecklist(checklist, plane));
          setImportSummary(`Imported "${name}" with ${json.phases.length} phase(s).${isAdmin ? ' (shared)' : ''}${fmt3Warnings}`);
          return;
        }

        // Format 4: Fleet backup { version: 1, custom_planes, custom_checklists, ... }
        if (json.version === 1) {
          const result = importFleet(json);
          setImportSummary(
            `Imported ${result.planes} plane(s), ${result.checklists} checklist(s), ${result.progress} progress record(s).`
          );
          return;
        }

        // Format 5: Object with custom_planes / custom_checklists (no version)
        if (json.custom_planes || json.custom_checklists) {
          const result = importFleet({ ...json, version: 1 });
          setImportSummary(
            `Imported ${result.planes} plane(s), ${result.checklists} checklist(s).`
          );
          return;
        }

       // Format 6: { aircraft, nickname, checklist: [{ title, items: [{callout, response}], type? }] }
if (json.aircraft && Array.isArray(json.checklist) && json.checklist?.[0]?.title) {
const name = String(json.aircraft);
const planeId = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
const plane = { id: planeId, name, manufacturer: '', image: '', type: 'GA' as const };

const MAIN_KEY = '__main__';
const categoryPhaseMaps = new Map<string, Map<string, { id: string; title: string; items: { id: string; label: string; expectedState?: string; reference?: string }[] }>>();

const checklistArray = json.checklist as Array<{ title: string; items?: Array<Record<string, unknown>>; type?: string; category?: string }>;
checklistArray.forEach((phase, pi) => {
const phaseTitle = (phase.title || '').trim();
if (!phaseTitle) return;
// Prefer explicit "type" on the phase, otherwise fall back to "category"
const rawType = String(phase.type || phase.category || '').trim();
const rowCategory = rawType || '';
const isMain = !rowCategory || rowCategory.toLowerCase() === 'normal checklist' || rowCategory.toLowerCase() === 'standard';
const mapKey = isMain ? MAIN_KEY : rowCategory.toLowerCase();

if (!categoryPhaseMaps.has(mapKey)) categoryPhaseMaps.set(mapKey, new Map());
const phasesMap = categoryPhaseMaps.get(mapKey)!;

const phaseId = phaseTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') + `-${pi}`;
if (!phasesMap.has(phaseTitle)) {
  const items = (phase.items ?? [])
    .filter(item => item && (item as any).callout)
    .map((item, ii) => ({
      id: `${phaseId}-${ii}`,
      label: String((item as any).callout),
      expectedState: (item as any).response ? String((item as any).response) : undefined,
    }));
  if (items.length > 0) {
    phasesMap.set(phaseTitle, { id: phaseId, title: phaseTitle, items });
  }
}
});

// Build main checklist
const mainPhasesMap = categoryPhaseMaps.get(MAIN_KEY) ?? new Map();
const phases = Array.from(mainPhasesMap.values());
const totalItems = phases.reduce((sum, p) => sum + p.items.length, 0);
const checklist = { planeId, phases };

// Build variant checklists
const jsonVariants: Record<string, { planeId: string; phases: typeof phases }> = {};
for (const [key, phasesMap] of categoryPhaseMaps) {
if (key === MAIN_KEY) continue;
jsonVariants[key] = {
planeId,
phases: Array.from(phasesMap.values()),
};
}

const fmt6Warnings = formatWarnings(validateChecklist(checklist, plane));
await importPlane(plane, checklist);
setImportSummary(`Imported "${name}" with ${phases.length} phase(s) and ${totalItems} item(s).${isAdmin ? ' (shared)' : ''}${fmt6Warnings}`);

// Auto-import category-based variants from JSON
for (const [variantName, variantChecklist] of Object.entries(jsonVariants)) {
if (!planes.some(p => p.id === planeId)) {
await importPlane(plane, checklist);
}
addCategory(planeId, variantName, variantChecklist);
}
if (Object.keys(jsonVariants).length > 0) {
setImportSummary(prev => (prev || '') + ` Also imported ${Object.keys(jsonVariants).length} variant(s): ${Object.keys(jsonVariants).join(', ')}`);
}

return;
}

        alert('Unrecognized JSON format. Supported: flat array of items, { plane, checklist }, { phases }, or fleet backup.');
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const sampleCsv = `name,category,phase,item,expectedState,reference
"Piper Archer II","","Pre-Flight","Master Switch","ON",""
"Piper Archer II","","Pre-Flight","Fuel Pump","ON",""
"Piper Archer II","","Speeds","Takeoff","Vr","65 KIAS"
"Piper Archer II","Reference Tables","Performance","Max Cruise","","data:table/json,[[Speed,Value],[Max Cruise,140 KIAS]]"`;

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
                <button className={styles.resetButton} onClick={() => setShowFileImport(true)}>
                  <FileUp size={18} /> Import File
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

      {showFileImport && (
        <FileImportModal
          onImport={async (plane, checklist, variants) => {
            await importPlane(plane, checklist);
            // Import any variants (e.g. Reference Tables) returned by the Lambda
            if (variants && Object.keys(variants).length > 0) {
              for (const [variantName, variantChecklist] of Object.entries(variants)) {
                if (isAdmin) {
                  const allCl = await listAllSharedChecklists();
                  const existing = allCl.find(c => c.plane_id === plane.id && c.category === variantName);
                  if (existing) {
                    await updateSharedChecklist(existing.id, JSON.stringify(variantChecklist.phases));
                  } else {
                    await createSharedChecklist({ plane_id: plane.id, category: variantName, phases: JSON.stringify(variantChecklist.phases) });
                  }
                } else {
                  addCategory(plane.id, variantName, variantChecklist);
                }
              }
            }
            setShowFileImport(false);
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
          onClose={() => setShowFileImport(false)}
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
            <h2 className={styles.modalTitle}>Import Plane & Checklist</h2>

            <div className={styles.fileInputWrapper}>
              <label className={styles.csvLabel}>
                <Upload size={14} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                Import from JSON (fleet backup or single plane):
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

            <div className={styles.fileInputWrapper}>
              <label className={styles.csvLabel}>Upload CSV File:</label>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setCsvInput(reader.result as string);
                  reader.readAsText(file);
                }}
                className={styles.fileInput}
              />
            </div>

            <label className={styles.csvLabel}>Or paste CSV content:</label>
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
                Import Plane
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
