import { useCallback, useMemo } from 'react';
import { useDatabase } from './useDatabase';
import { planes as staticPlanes } from '../data/planes';
import { checklists as staticChecklists } from '../data/checklists';
import type { Plane, PlaneChecklist } from '../data/types';

export function useFleet() {
  const { data, loading, updateKey, resetAll } = useDatabase();

  const customPlanes = data?.custom_planes ?? [];
  const customChecklists = data?.custom_checklists ?? {};
  const deletedStaticIds = data?.deleted_static_planes ?? [];
  const favoriteIds = data?.favorite_planes ?? [];

  const toggleFavorite = useCallback((planeId: string) => {
    const current = data?.favorite_planes ?? [];
    if (current.includes(planeId)) {
      updateKey('favorite_planes', current.filter(id => id !== planeId));
    } else {
      updateKey('favorite_planes', [...current, planeId]);
    }
  }, [data?.favorite_planes, updateKey]);

  const allPlanes = useMemo(() => {
    const active = staticPlanes.filter(p => !deletedStaticIds.includes(p.id));
    return [...active, ...customPlanes];
  }, [customPlanes, deletedStaticIds]);

  const allChecklists = useMemo(
    () => ({ ...staticChecklists, ...customChecklists }),
    [customChecklists],
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
    const isStatic = staticPlanes.some(p => p.id === planeId);
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
        if (staticChecklists[planeId] && !customChecklists[planeId]) {
          updateKey('custom_checklists', { ...customChecklists, [planeId]: staticChecklists[planeId] });
        }
      }
    } else {
      updateKey('custom_planes', customPlanes.map(p => p.id === planeId ? updatedPlane : p));
    }
  }, [allPlanes, customPlanes, customChecklists, deletedStaticIds, updateKey]);

  const deletePlane = useCallback((planeId: string) => {
    const isStatic = staticPlanes.some(p => p.id === planeId);
    if (isStatic) {
      updateKey('deleted_static_planes', [...deletedStaticIds, planeId]);
    } else {
      updateKey('custom_planes', customPlanes.filter(p => p.id !== planeId));
      const next = { ...customChecklists };
      delete next[planeId];
      updateKey('custom_checklists', next);
    }
  }, [customPlanes, customChecklists, deletedStaticIds, updateKey]);

  const resetFleet = useCallback(() => {
    resetAll();
  }, [resetAll]);

  // Checklist progress
  const progressData = data?.checklist_progress ?? {};

  const getProgress = useCallback((planeId: string): Record<string, boolean> => {
    return progressData[planeId] ?? {};
  }, [progressData]);

  const setProgress = useCallback((planeId: string, progress: Record<string, boolean>) => {
    updateKey('checklist_progress', { ...progressData, [planeId]: progress });
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
    loading,
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
  };
}
