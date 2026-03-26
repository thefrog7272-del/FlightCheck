import { useState, useEffect, useCallback } from 'react';
import { listSharedPlanes, listAllSharedChecklists, type SharedPlaneRecord, type SharedChecklistRecord } from '../api/sharedPlanes';
import { planes as staticPlanes } from '../data/planes';
import { checklists as staticChecklists } from '../data/checklists';
import type { Plane, PlaneChecklist } from '../data/types';

const CACHE_KEY = 'shared_planes_cache';

interface CachedData {
  planes: Plane[];
  checklists: Record<string, PlaneChecklist>;
  timestamp: number;
}

function loadCache(): CachedData | null {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) return null;
    const data = JSON.parse(stored) as CachedData;
    return data;
  } catch {
    return null;
  }
}

function saveCache(data: CachedData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch { /* quota exceeded */ }
}

function mapToPlane(record: SharedPlaneRecord): Plane {
  return {
    id: record.planeId,
    name: record.name,
    manufacturer: record.manufacturer,
    image: record.image,
    type: record.type,
    sim: (record.sim as Plane['sim']) || undefined,
  };
}

function mapToChecklist(record: SharedChecklistRecord): PlaneChecklist {
  return {
    planeId: record.planeId,
    phases: JSON.parse(record.phases),
  };
}

// Load cache once at module level to use as initial state
const initialCache = loadCache();

export function useSharedPlanes() {
  const [sharedPlanes, setSharedPlanes] = useState<Plane[]>(
    () => initialCache?.planes ?? [],
  );
  const [sharedChecklists, setSharedChecklists] = useState<Record<string, PlaneChecklist>>(
    () => initialCache?.checklists ?? {},
  );
  const [loading, setLoading] = useState(
    () => !initialCache || initialCache.planes.length === 0,
  );

  const fetchFromApi = useCallback(async () => {
    try {
      const [planeRecords, checklistRecords] = await Promise.all([
        listSharedPlanes(),
        listAllSharedChecklists(),
      ]);

      if (planeRecords.length > 0) {
        const planes = planeRecords.map(mapToPlane);
        const checklists: Record<string, PlaneChecklist> = {};
        for (const record of checklistRecords) {
          try {
            checklists[record.planeId] = mapToChecklist(record);
          } catch { /* skip invalid JSON */ }
        }

        setSharedPlanes(planes);
        setSharedChecklists(checklists);
        saveCache({ planes, checklists, timestamp: Date.now() });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const hasCachedData = initialCache && initialCache.planes.length > 0;

    async function sync() {
      const success = await fetchFromApi();
      if (cancelled) return;
      if (!success && !hasCachedData) {
        // Fall back to static data if API failed and no cache
        setSharedPlanes(staticPlanes);
        setSharedChecklists(staticChecklists);
      }
      if (!hasCachedData) {
        setLoading(false);
      }
    }

    sync();

    return () => { cancelled = true; };
  }, [fetchFromApi]);

  return { sharedPlanes, sharedChecklists, sharedLoading: loading, refreshSharedPlanes: fetchFromApi };
}
