export type SimPlatform = 'msfs2020' | 'msfs2024' | 'both';

export interface Plane {
  id: string;
  name: string;
  manufacturer: string;
  image: string;
  type: string;
  sim?: SimPlatform;
}

export interface ChecklistItem {
  id: string;
  label: string;
  expectedState?: string;
  notes?: string;
}

export interface ChecklistPhase {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface PlaneChecklist {
  planeId: string;
  phases: ChecklistPhase[];
}
