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
    id: record.plane_id,
    name: record.name,
    manufacturer: record.manufacturer,
    image: record.image,
    type: record.type,
    sim: (record.sim as Plane['sim']) || undefined,
    author: record.author ?? undefined,
    author_weblink: record.author_weblink ?? undefined,
    ability_variant: record.ability_variant ?? null,
    addon_developer_variant: record.addon_developer_variant ?? null,
  };
}

function mapToChecklist(record: SharedChecklistRecord): PlaneChecklist {
  return {
    planeId: record.plane_id,
    phases: JSON.parse(record.phases),
  };
}

function checklistKey(record: SharedChecklistRecord): string {
  if (record.category && record.category.toLowerCase() !== 'normal') {
    return `${record.plane_id}::${record.category}`;
  }
  return record.plane_id;
}

export function useSharedPlanes() {
  // Read cache fresh on each mount so newly imported planes are visible
  // immediately without waiting for the API round-trip.
  const [sharedPlanes, setSharedPlanes] = useState<Plane[]>(() => {
    const cache = loadCache();
    console.log('[FlightCheck SharedPlanes] Initial cache:', cache ? `${cache.planes.length} planes, age ${Math.round((Date.now() - cache.timestamp) / 60000)}min` : 'none');
    return cache?.planes ?? [];
  });
  const [sharedChecklists, setSharedChecklists] = useState<Record<string, PlaneChecklist>>(
    () => loadCache()?.checklists ?? {},
  );
  const [loading, setLoading] = useState(() => {
    const cache = loadCache();
    return !cache || cache.planes.length === 0;
  });

  const fetchFromApi = useCallback(async () => {
    console.log('[FlightCheck SharedPlanes] Fetching from API...');
    try {
      const [planeRecords, checklistRecords] = await Promise.all([
        listSharedPlanes(),
        listAllSharedChecklists(),
      ]);

      console.log(`[FlightCheck SharedPlanes] API returned ${planeRecords.length} planes, ${checklistRecords.length} checklists`);
      if (planeRecords.length > 0) {
        const planes = planeRecords.map(mapToPlane);
        const checklists: Record<string, PlaneChecklist> = {};
        for (const record of checklistRecords) {
          try {
            checklists[checklistKey(record)] = mapToChecklist(record);
          } catch { /* skip invalid JSON */ }
        }

        setSharedPlanes(planes);
        setSharedChecklists(checklists);
        saveCache({ planes, checklists, timestamp: Date.now() });
        return true;
      }
      console.log('[FlightCheck SharedPlanes] API returned 0 planes');
      return false;
    } catch (err) {
      console.error('[FlightCheck SharedPlanes] API fetch failed:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const cache = loadCache();
    const hasCachedData = cache != null && cache.planes.length > 0;

    async function sync() {
      const success = await fetchFromApi();
      if (cancelled) return;
      if (!success && !hasCachedData) {
        console.log('[FlightCheck SharedPlanes] API failed, no cache → falling back to static data');
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

  return { 
    sharedPlanes, 
    sharedChecklists, 
    sharedLoading: loading, 
    refreshSharedPlanes: fetchFromApi 
  };
}
