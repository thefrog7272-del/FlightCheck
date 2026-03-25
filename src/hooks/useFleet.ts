import { useLocalStorage } from './useLocalStorage';
import { planes as staticPlanes } from '../data/planes';
import { checklists as staticChecklists } from '../data/checklists';
import type { Plane, PlaneChecklist } from '../data/types';

/**
 * A hook to manage the aviation fleet, combining static and custom data.
 */
export function useFleet() {
  const [customPlanes, setCustomPlanes] = useLocalStorage<Plane[]>('custom_planes', []);
  const [customChecklists, setCustomChecklists] = useLocalStorage<Record<string, PlaneChecklist>>('custom_checklists', {});
  const [deletedStaticIds, setDeletedStaticIds] = useLocalStorage<string[]>('deleted_static_planes', []);

  // Filter out deleted static planes and combine with custom data
  const activeStaticPlanes = staticPlanes.filter(p => !deletedStaticIds.includes(p.id));
  const allPlanes = [...activeStaticPlanes, ...customPlanes];
  
  const allChecklists = { ...staticChecklists, ...customChecklists };

  /**
   * Adds a new plane and its checklist to the custom fleet.
   */
  const addPlaneToFleet = (newPlane: Plane, newChecklist: PlaneChecklist) => {
    // If it was a deleted static plane, remove it from deleted list
    if (deletedStaticIds.includes(newPlane.id)) {
      setDeletedStaticIds(prev => prev.filter(id => id !== newPlane.id));
    }

    const planeExistsInCustom = customPlanes.some(p => p.id === newPlane.id);
    
    if (planeExistsInCustom) {
      setCustomPlanes(prev => prev.map(p => p.id === newPlane.id ? newPlane : p));
      setCustomChecklists(prev => ({ ...prev, [newPlane.id]: newChecklist }));
    } else {
      setCustomPlanes(prev => [...prev, newPlane]);
      setCustomChecklists(prev => ({ ...prev, [newPlane.id]: newChecklist }));
    }
  };

  /**
   * Updates a checklist (saves to custom storage, even for static planes).
   */
  const updateChecklist = (planeId: string, checklist: PlaneChecklist) => {
    setCustomChecklists(prev => ({ ...prev, [planeId]: checklist }));
  };

  /**
   * Removes a plane and its checklist.
   */
  const deletePlaneFromFleet = (planeId: string) => {
    // Check if it's a static plane
    const isStatic = staticPlanes.some(p => p.id === planeId);

    if (isStatic) {
      setDeletedStaticIds(prev => [...prev, planeId]);
    } else {
      setCustomPlanes(prev => prev.filter(p => p.id !== planeId));
      setCustomChecklists(prev => {
        const next = { ...prev };
        delete next[planeId];
        return next;
      });
    }
  };

  /**
   * Resets the fleet to factory defaults.
   */
  const resetCustomFleet = () => {
    setCustomPlanes([]);
    setCustomChecklists({});
    setDeletedStaticIds([]);
  };

  return {
    planes: allPlanes,
    checklists: allChecklists,
    addPlane: addPlaneToFleet,
    updateChecklist,
    deletePlane: deletePlaneFromFleet,
    resetFleet: resetCustomFleet
  };
}
