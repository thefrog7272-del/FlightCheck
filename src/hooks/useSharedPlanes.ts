import { useState, useEffect, useCallback } from 'react';
import { listSharedPlanes, listAllSharedChecklists, type SharedPlaneRecord, type SharedChecklistRecord } from '../api/sharedPlanes';
import { planes as staticPlanes } from '../data/planes';
import { checklists as staticChecklists } from '../data/checklists';
import type { Plane, PlaneChecklist } from '../data/types';
import { normalizeAbilityVariant } from '../utils/abilityVariants';

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
  const [sharedPlanes, setSharedPlanes] = useState<Plane[]>([]);
  const [sharedChecklists, setSharedChecklists] = useState<Record<string, PlaneChecklist>>({});
  const [sharedAbilityVariantChecklists, setSharedAbilityVariantChecklists] = useState<
    Record<string, Record<string, Record<string, PlaneChecklist>>>
  >({});
  const [loading, setLoading] = useState(true);

  const fetchFromApi = useCallback(async () => {
    console.log('[FlightCheck SharedPlanes] Fetching from API...');
    try {
      const [planeRecords, checklistRecords] = await Promise.all([
        listSharedPlanes(),
        listAllSharedChecklists(),
      ]);

      console.log(`[FlightCheck SharedPlanes] API returned ${planeRecords.length} planes, ${checklistRecords.length} checklists`);
      if (planeRecords.length > 0 || checklistRecords.length > 0) {
        const planes = planeRecords.map(mapToPlane);
        const checklists: Record<string, PlaneChecklist> = {};
        const abilityVariantChecklists: Record<string, Record<string, Record<string, PlaneChecklist>>> = {};

        for (const record of checklistRecords) {
          try {
            if (record.plane_id.includes('||')) {
              const [basePlaneIdRaw, abilityVariantRaw] = record.plane_id.split('||');
              const abilityVariant = normalizeAbilityVariant(abilityVariantRaw);
              if (!basePlaneIdRaw || !abilityVariant) continue;
              const basePlaneId = basePlaneIdRaw.toLowerCase();
              const category = record.category && record.category.toLowerCase() !== 'normal' ? record.category : 'Standard';
              if (!abilityVariantChecklists[basePlaneId]) abilityVariantChecklists[basePlaneId] = {};
              if (!abilityVariantChecklists[basePlaneId][abilityVariant]) abilityVariantChecklists[basePlaneId][abilityVariant] = {};
              abilityVariantChecklists[basePlaneId][abilityVariant][category] = mapToChecklist({
                ...record,
                plane_id: basePlaneId,
              });
              continue;
            }

            checklists[checklistKey(record)] = mapToChecklist(record);
          } catch {
            /* skip invalid JSON */
          }
        }

        setSharedPlanes(planes);
        setSharedChecklists(checklists);
        setSharedAbilityVariantChecklists(abilityVariantChecklists);
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

    async function sync() {
      const success = await fetchFromApi();
      if (cancelled) return;
      if (!success) {
        console.log('[FlightCheck SharedPlanes] API failed, no cache → falling back to static data');
        setSharedPlanes(staticPlanes);
        setSharedChecklists(staticChecklists);
        setSharedAbilityVariantChecklists({});
      }
      setLoading(false);
    }

    sync();

    return () => { cancelled = true; };
  }, [fetchFromApi]);

  return { 
    sharedPlanes, 
    sharedChecklists, 
    sharedAbilityVariantChecklists,
    sharedLoading: loading, 
    refreshSharedPlanes: fetchFromApi 
  };
}
