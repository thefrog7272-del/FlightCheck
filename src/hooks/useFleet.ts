import { useCallback, useMemo, useRef, useEffect } from 'react';
import { useDatabase } from './useDatabase';
import { useSharedPlanes } from './useSharedPlanes';
import type { Plane, PlaneChecklist } from '../data/types';

export function useFleet() {
  const { data, loading, updateKey, resetAll } = useDatabase();
  const { sharedPlanes, sharedChecklists, sharedLoading, refreshSharedPlanes } = useSharedPlanes();

  const customPlanes = data?.custom_planes ?? [];
  const customChecklists = data?.custom_checklists ?? {};
  const deletedStaticIds = data?.deleted_static_planes ?? [];
  const favoriteIds = data?.favorite_planes ?? [];
  const recentlyUsed = data?.recently_used ?? [];
  const itemNotes = data?.item_notes ?? {};
  const timerData = data?.timer_data ?? {};

  const getTimerData = useCallback((planeId: string) => {
    return timerData[planeId] ?? {};
  }, [timerData]);

  const saveTimerBest = useCallback((planeId: string, elapsed: number) => {
    const current = timerData[planeId] ?? {};
    if (!current.completed || elapsed < current.completed) {
      updateKey('timer_data', { ...timerData, [planeId]: { ...current, completed: elapsed } });
    }
  }, [timerData, updateKey]);

  const getNote = useCallback((itemId: string): string => {
    return itemNotes[itemId] ?? '';
  }, [itemNotes]);

  const setNote = useCallback((itemId: string, text: string) => {
    const updated = { ...itemNotes };
    if (text.trim()) {
      updated[itemId] = text.trim();
    } else {
      delete updated[itemId];
    }
    updateKey('item_notes', updated);
  }, [itemNotes, updateKey]);

  // Use a ref so trackRecentUse doesn't change identity when recently_used updates,
  // preventing an infinite re-render loop when the effect dep includes the callback.
  const recentlyUsedRef = useRef(recentlyUsed);
  useEffect(() => { recentlyUsedRef.current = recentlyUsed; }, [recentlyUsed]);

  const trackRecentUse = useCallback((planeId: string) => {
    const current = recentlyUsedRef.current;
    const filtered = current.filter(r => r.planeId !== planeId);
    const updated = [{ planeId, timestamp: Date.now() }, ...filtered].slice(0, 6);
    updateKey('recently_used', updated);
  }, [updateKey]);

  const toggleFavorite = useCallback((planeId: string) => {
    const current = data?.favorite_planes ?? [];
    if (current.includes(planeId)) {
      updateKey('favorite_planes', current.filter(id => id !== planeId));
    } else {
      updateKey('favorite_planes', [...current, planeId]);
    }
  }, [data?.favorite_planes, updateKey]);

  const allPlanes = useMemo(() => {
    const active = sharedPlanes.filter(p => !deletedStaticIds.includes(p.id));
    return [...active, ...customPlanes];
  }, [sharedPlanes, customPlanes, deletedStaticIds]);

  const allChecklists = useMemo(
    () => ({ ...sharedChecklists, ...customChecklists }),
    [sharedChecklists, customChecklists],
  );

  const addPlane = useCallback((newPlane: Plane, newChecklist: PlaneChecklist) => {
    // If it was a deleted static plane, restore it
    if (deletedStaticIds.includes(newPlane.id)) {
      updateKey('deleted_static_planes', deletedStaticIds.filter(id => id !== newPlane.id));
    }

    const exists = customPlanes.some(p => p.id === newPlane.id);
    if (exists) {
      updateKey('custom_planes', customPlanes.map(p => p.id === newPlane.id ? newPlane : p));
    } else {
      updateKey('custom_planes', [...customPlanes, newPlane]);
    }
    updateKey('custom_checklists', { ...customChecklists, [newPlane.id]: newChecklist });
  }, [customPlanes, customChecklists, deletedStaticIds, updateKey]);

  const updateChecklist = useCallback((planeId: string, checklist: PlaneChecklist) => {
    updateKey('custom_checklists', { ...customChecklists, [planeId]: checklist });
  }, [customChecklists, updateKey]);

  const updatePlaneImage = useCallback((planeId: string, newImage: string) => {
    const isStatic = sharedPlanes.some(p => p.id === planeId);
    const existingPlane = allPlanes.find(p => p.id === planeId);
    if (!existingPlane) return;

    const updatedPlane = { ...existingPlane, image: newImage };

    if (isStatic) {
      // Move static plane to custom with new image
      const inCustom = customPlanes.some(p => p.id === planeId);
      if (inCustom) {
        updateKey('custom_planes', customPlanes.map(p => p.id === planeId ? updatedPlane : p));
      } else {
        updateKey('deleted_static_planes', [...deletedStaticIds, planeId]);
        updateKey('custom_planes', [...customPlanes, updatedPlane]);
        // Copy the static checklist to custom so it's preserved
        if (sharedChecklists[planeId] && !customChecklists[planeId]) {
          updateKey('custom_checklists', { ...customChecklists, [planeId]: sharedChecklists[planeId] });
        }
      }
    } else {
      updateKey('custom_planes', customPlanes.map(p => p.id === planeId ? updatedPlane : p));
    }
  }, [sharedPlanes, sharedChecklists, allPlanes, customPlanes, customChecklists, deletedStaticIds, updateKey]);

  const deletePlane = useCallback((planeId: string) => {
    const isStatic = sharedPlanes.some(p => p.id === planeId);
    if (isStatic) {
      updateKey('deleted_static_planes', [...deletedStaticIds, planeId]);
    } else {
      updateKey('custom_planes', customPlanes.filter(p => p.id !== planeId));
      const next = { ...customChecklists };
      delete next[planeId];
      updateKey('custom_checklists', next);
    }
  }, [sharedPlanes, customPlanes, customChecklists, deletedStaticIds, updateKey]);

  const resetFleet = useCallback(() => {
    resetAll();
  }, [resetAll]);

  // Checklist progress
  const progressData = data?.checklist_progress ?? {};

  const getProgress = useCallback((planeId: string, variant?: string): Record<string, boolean> => {
    const key = variant && variant !== 'Standard' ? `${planeId}::${variant}` : planeId;
    return progressData[key] ?? {};
  }, [progressData]);

  const setProgress = useCallback((planeId: string, progress: Record<string, boolean>, variant?: string) => {
    const key = variant && variant !== 'Standard' ? `${planeId}::${variant}` : planeId;
    updateKey('checklist_progress', { ...progressData, [key]: progress });
  }, [progressData, updateKey]);

  // Variant management
  const getVariants = useCallback((planeId: string): string[] => {
    const variants = ['Standard'];
    const seen = new Set<string>();
    // Check both shared (Supabase) and custom (localStorage) checklists
    for (const source of [sharedChecklists, customChecklists]) {
      for (const key of Object.keys(source)) {
        if (key.startsWith(`${planeId}::`) && !seen.has(key)) {
          seen.add(key);
          variants.push(key.split('::')[1]);
        }
      }
    }
    return variants;
  }, [sharedChecklists, customChecklists]);

  const addVariant = useCallback((planeId: string, variantName: string, checklist: PlaneChecklist) => {
    const variantKey = `${planeId}::${variantName}`;
    updateKey('custom_checklists', { ...customChecklists, [variantKey]: { ...checklist, planeId: variantKey } });
  }, [customChecklists, updateKey]);

  const deleteVariant = useCallback((planeId: string, variantName: string) => {
    if (variantName === 'Standard') return;
    const variantKey = `${planeId}::${variantName}`;
    const next = { ...customChecklists };
    delete next[variantKey];
    updateKey('custom_checklists', next);
    const progress = { ...progressData };
    delete progress[variantKey];
    updateKey('checklist_progress', progress);
  }, [customChecklists, progressData, updateKey]);

  const exportFleet = useCallback(() => {
    const backup = {
      version: 1,
      exported_at: new Date().toISOString(),
      custom_planes: customPlanes,
      custom_checklists: customChecklists,
      checklist_progress: progressData,
      favorite_planes: favoriteIds,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().slice(0, 10);
    a.download = `flightcheck-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [customPlanes, customChecklists, progressData, favoriteIds]);

  const importFleet = useCallback((json: unknown): { planes: number; checklists: number; progress: number } => {
    const backup = json as {
      version?: number;
      custom_planes?: Plane[];
      custom_checklists?: Record<string, PlaneChecklist>;
      checklist_progress?: Record<string, Record<string, boolean>>;
      favorite_planes?: string[];
    };

    if (!backup || typeof backup !== 'object' || backup.version !== 1) {
      throw new Error('Invalid backup file: missing or unsupported version');
    }

    let planesImported = 0;
    let checklistsImported = 0;
    let progressImported = 0;

    // Merge planes (by ID, imported overwrites existing)
    if (Array.isArray(backup.custom_planes) && backup.custom_planes.length > 0) {
      const mergedPlanes = [...customPlanes];
      for (const plane of backup.custom_planes) {
        const idx = mergedPlanes.findIndex(p => p.id === plane.id);
        if (idx >= 0) {
          mergedPlanes[idx] = plane;
        } else {
          mergedPlanes.push(plane);
        }
        planesImported++;
      }
      updateKey('custom_planes', mergedPlanes);
    }

    // Merge checklists
    if (backup.custom_checklists && typeof backup.custom_checklists === 'object') {
      const mergedChecklists = { ...customChecklists, ...backup.custom_checklists };
      checklistsImported = Object.keys(backup.custom_checklists).length;
      updateKey('custom_checklists', mergedChecklists);
    }

    // Merge progress
    if (backup.checklist_progress && typeof backup.checklist_progress === 'object') {
      const mergedProgress = { ...progressData, ...backup.checklist_progress };
      progressImported = Object.keys(backup.checklist_progress).length;
      updateKey('checklist_progress', mergedProgress);
    }

    // Merge favorites
    if (Array.isArray(backup.favorite_planes) && backup.favorite_planes.length > 0) {
      const mergedFavorites = Array.from(new Set([...favoriteIds, ...backup.favorite_planes]));
      updateKey('favorite_planes', mergedFavorites);
    }

    return { planes: planesImported, checklists: checklistsImported, progress: progressImported };
  }, [customPlanes, customChecklists, progressData, favoriteIds, updateKey]);

  return {
    planes: allPlanes,
    checklists: allChecklists,
    loading: loading || sharedLoading,
    addPlane,
    updateChecklist,
    updatePlaneImage,
    deletePlane,
    resetFleet,
    getProgress,
    setProgress,
    exportFleet,
    importFleet,
    favoriteIds,
    toggleFavorite,
    recentlyUsed,
    trackRecentUse,
    getNote,
    setNote,
    getTimerData,
    saveTimerBest,
    getVariants,
    addVariant,
    deleteVariant,
    refreshSharedPlanes,
  };
}
