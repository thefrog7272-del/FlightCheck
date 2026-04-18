export type SimPlatform = 'msfs2020' | 'msfs2024' | 'both';

export interface Plane {
  id: string;
  name: string;
  manufacturer: string;
  image: string;
  type: string;
  sim?: SimPlatform;
  author?: string;
  author_weblink?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  expectedState?: string;
  reference?: string;
  /** When set, this item is a caution/note/warning banner, not a checkable step. */
  annotationType?: 'caution' | 'note' | 'warning';
}

export interface PhaseAnnotation {
  type: 'caution' | 'note' | 'warning';
  text: string;
}

export interface ChecklistPhase {
  id: string;
  title: string;
  items: ChecklistItem[];
  annotations?: PhaseAnnotation[];
}

export interface PlaneChecklist {
  planeId: string;
  phases: ChecklistPhase[];
}
