export interface Plane {
  id: string;
  name: string;
  manufacturer: string;
  image: string;
  type: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  expectedState?: string;
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
