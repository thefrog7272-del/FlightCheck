import { useCallback, useMemo, useRef, useEffect } from 'react';
import { useDatabase } from './useDatabase';
import { useSharedPlanes } from './useSharedPlanes';
import type { Plane, PlaneChecklist } from '../data/types';
import { ABILITY_VARIANTS } from '../data/types';
import { checklists as staticChecklists } from '../data/checklists';

export function useFleet() {
  const { data, loading, updateKey, resetAll } = useDatabase();
  const { sharedPlanes, sharedChecklists, sharedAbilityVariantChecklists, sharedLoading, refreshSharedPlanes } = useSharedPlanes();

  const customPlanes = data?.custom_planes ?? [];
  const customChecklists = data?.custom_checklists ?? {};
  const customAbilityVariantChecklists = data?.ability_variant_checklists ?? {};
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
    const result = [...active, ...customPlanes];
    console.log('>>>> [useFleet allPlanes] sharedPlanes:', sharedPlanes.length, 'customPlanes:', customPlanes.length, 'total:', result.length);
    return result;
  }, [sharedPlanes, customPlanes, deletedStaticIds]);

  const allChecklists = useMemo(
    () => {
      const result = { ...staticChecklists, ...sharedChecklists, ...customChecklists };
      console.log('>>>> [useFleet allChecklists] static:', Object.keys(staticChecklists).length, 'shared:', Object.keys(sharedChecklists).length, 'custom:', Object.keys(customChecklists).length);
      return result;
    },
    [staticChecklists, sharedChecklists, customChecklists],
  );

  const addPlane = useCallback((newPlane: Plane, newChecklist: PlaneChecklist) => {
    console.log('[useFleet addPlane] Adding plane:', newPlane.id, newPlane.name, 'checklist phases:', newChecklist.phases.length, 'checklist keys:', Object.keys(newChecklist));
    // If it was a deleted static plane, restore it
    if (deletedStaticIds.includes(newPlane.id)) {
      updateKey('deleted_static_planes', deletedStaticIds.filter(id => id !== newPlane.id));
    }

    const exists = customPlanes.some(p => p.id === newPlane.id);
    console.log('>>>> [useFleet addPlane] Plane exists in customPlanes:', exists, 'customPlanes length:', customPlanes.length);
    if (exists) {
      updateKey('custom_planes', customPlanes.map(p => p.id === newPlane.id ? newPlane : p));
    } else {
      const newCustomPlanes = [...customPlanes, newPlane];
      console.log('>>>> [useFleet addPlane] New customPlanes will be:', newCustomPlanes.map(p => p.id));
      updateKey('custom_planes', newCustomPlanes);
    }
    console.log('>>>> [useFleet addPlane] Saving checklist for:', newPlane.id);
    // Use functional update to avoid stale closure over customChecklists
    updateKey('custom_checklists', (prev: Record<string, PlaneChecklist>) => ({ ...prev, [newPlane.id]: newChecklist }));
  }, [customPlanes, customChecklists, deletedStaticIds, updateKey]);

  const updateChecklist = useCallback((planeId: string, checklist: PlaneChecklist) => {
    updateKey('custom_checklists', (prev: Record<string, PlaneChecklist>) => ({ ...prev, [planeId]: checklist }));
  }, [updateKey]);

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
        updateKey('custom_checklists', (prev: Record<string, PlaneChecklist>) => {
          if (!prev[planeId] && sharedChecklists[planeId]) {
            return { ...prev, [planeId]: sharedChecklists[planeId] };
          }
          return prev;
        });
      }
    } else {
      updateKey('custom_planes', customPlanes.map(p => p.id === planeId ? updatedPlane : p));
    }
  }, [sharedPlanes, sharedChecklists, allPlanes, customPlanes, customChecklists, deletedStaticIds, updateKey]);

  const deletePlane = useCallback((planeId: string) => {
    console.log('[useFleet deletePlane] Deleting plane:', planeId);
    const isStatic = sharedPlanes.some(p => p.id === planeId);
    console.log('[useFleet deletePlane] isStatic:', isStatic);
    if (isStatic) {
      updateKey('deleted_static_planes', [...deletedStaticIds, planeId]);
    } else {
      // Use functional update to avoid stale closure over customPlanes
      updateKey('custom_planes', (prev: Plane[]) => prev.filter(p => p.id !== planeId));
      // Use functional update to avoid stale closure over customChecklists
      updateKey('custom_checklists', (prev: Record<string, PlaneChecklist>) => {
        const next = { ...prev };
        delete next[planeId];
        console.log('[useFleet deletePlane] Deleted checklist for:', planeId, 'remaining checklists:', Object.keys(next));
        return next;
      });
    }
  }, [sharedPlanes, deletedStaticIds, updateKey]);

  const resetFleet = useCallback(() => {
    resetAll();
  }, [resetAll]);

  // Checklist progress
  const progressData = data?.checklist_progress ?? {};

  const getProgress = useCallback((planeId: string, category?: string): Record<string, boolean> => {
    const key = category && category !== 'Standard' ? `${planeId}::${category}` : planeId;
    return progressData[key] ?? {};
  }, [progressData]);

  const setProgress = useCallback((planeId: string, progress: Record<string, boolean>, category?: string) => {
    const key = category && category !== 'Standard' ? `${planeId}::${category}` : planeId;
    updateKey('checklist_progress', { ...progressData, [key]: progress });
  }, [progressData, updateKey]);

  // Category management — categories are tabs within a specific checklist (Normal/Abnormal/Emergency/Reference).
  // AbilityVariant names are never returned here; they are a separate dimension entirely.
  const getCategories = useCallback((planeId: string): string[] => {
    const categories = ['Standard'];
    const seen = new Set<string>();
    const prefix = `${planeId}::`;
    const abilityVariantSet = new Set<string>(ABILITY_VARIANTS as readonly string[]);
    for (const source of [sharedChecklists, customChecklists, staticChecklists]) {
      for (const key of Object.keys(source)) {
        if (key.startsWith(prefix)) {
          const directChild = key.slice(prefix.length).split('::')[0];
          // Never include abilityVariant names as categories
          if (!seen.has(directChild) && !abilityVariantSet.has(directChild.toLowerCase())) {
            seen.add(directChild);
            categories.push(directChild);
          }
        }
      }
    }
    return categories;
  }, [sharedChecklists, customChecklists, staticChecklists]);

  // ── AbilityVariant checklist management ────────────────────────────────────
  // AbilityVariants (beginner/advanced/expert/professional) are independent checklists
  // that belong to a plane. Each has its own set of categories (Normal/Abnormal/Emergency/Reference).
  // They are stored in ability_variant_checklists[planeId][abilityVariant][category].

  /** Returns the abilityVariant names that have checklists for the given plane. */
  const getAbilityVariants = useCallback((planeId: string): string[] => {
    const found = new Set<string>();
    for (const source of [sharedAbilityVariantChecklists, customAbilityVariantChecklists]) {
      const planeEntry = source[planeId];
      if (planeEntry) {
        for (const av of Object.keys(planeEntry)) {
          found.add(av);
        }
      }
    }
    return Array.from(found);
  }, [sharedAbilityVariantChecklists, customAbilityVariantChecklists]);

  /** Returns the category names present for a specific abilityVariant checklist. Always includes 'Standard'. */
  const getAbilityVariantCategories = useCallback((planeId: string, abilityVariant: string): string[] => {
    const found = new Set<string>();
    for (const source of [sharedAbilityVariantChecklists, customAbilityVariantChecklists]) {
      const avEntry = source[planeId]?.[abilityVariant];
      if (avEntry) {
        for (const cat of Object.keys(avEntry)) {
          found.add(cat);
        }
      }
    }
    const categories = ['Standard'];
    for (const cat of found) {
      if (cat !== 'Standard') categories.push(cat);
    }
    return categories;
  }, [sharedAbilityVariantChecklists, customAbilityVariantChecklists]);

  /** Retrieves the checklist for an abilityVariant + category combination. */
  const getAbilityVariantChecklist = useCallback((planeId: string, abilityVariant: string, category: string): PlaneChecklist | null => {
    return (
      customAbilityVariantChecklists[planeId]?.[abilityVariant]?.[category] ??
      sharedAbilityVariantChecklists[planeId]?.[abilityVariant]?.[category] ??
      null
    );
  }, [customAbilityVariantChecklists, sharedAbilityVariantChecklists]);

  /** Saves a checklist for an abilityVariant + category combination. */
  const setAbilityVariantChecklist = useCallback((planeId: string, abilityVariant: string, category: string, checklist: PlaneChecklist) => {
    updateKey('ability_variant_checklists', (prev: Record<string, Record<string, Record<string, PlaneChecklist>>>) => ({
      ...prev,
      [planeId]: {
        ...prev[planeId],
        [abilityVariant]: {
          ...prev[planeId]?.[abilityVariant],
          [category]: checklist,
        },
      },
    }));
  }, [updateKey]);

  /** Deletes a category from an abilityVariant checklist.
   *  If no category is specified, deletes the entire abilityVariant entry. */
  const deleteAbilityVariantChecklist = useCallback((planeId: string, abilityVariant: string, category?: string) => {
    updateKey('ability_variant_checklists', (prev: Record<string, Record<string, Record<string, PlaneChecklist>>>) => {
      const planeEntry = { ...prev[planeId] };
      if (!planeEntry[abilityVariant]) return prev;
      if (category) {
        const avEntry = { ...planeEntry[abilityVariant] };
        delete avEntry[category];
        planeEntry[abilityVariant] = avEntry;
      } else {
        delete planeEntry[abilityVariant];
      }
      return { ...prev, [planeId]: planeEntry };
    });
  }, [updateKey]);

  const addCategory = useCallback((planeId: string, categoryName: string, checklist: PlaneChecklist) => {
    const categoryKey = `${planeId}::${categoryName}`;
    console.log('[useFleet addCategory] Adding category:', categoryName, 'for plane:', planeId, 'categoryKey:', categoryKey);
    // Use functional update to avoid stale closure over customChecklists
    updateKey('custom_checklists', (prev: Record<string, PlaneChecklist>) => ({ ...prev, [categoryKey]: { ...checklist, planeId: categoryKey } }));
  }, [updateKey]);

  const deleteCategory = useCallback((planeId: string, categoryName: string) => {
    if (categoryName === 'Standard') return;
    const categoryKey = `${planeId}::${categoryName}`;
    updateKey('custom_checklists', (prev: Record<string, PlaneChecklist>) => {
      const next = { ...prev };
      delete next[categoryKey];
      return next;
    });
    const progress = { ...progressData };
    delete progress[categoryKey];
    updateKey('checklist_progress', progress);
  }, [progressData, updateKey]);

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
    getCategories,
    addCategory,
    deleteCategory,
    getAbilityVariants,
    getAbilityVariantCategories,
    getAbilityVariantChecklist,
    setAbilityVariantChecklist,
    deleteAbilityVariantChecklist,
    refreshSharedPlanes,
  };
}
