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
  /**
   * Optional ability variant tag (Beginner, Intermediate, Expert, Advanced, Professional).
   * When present, multiple Plane records can share the same `name` and differ
   * only by `id` + `ability_variant`.
   */
  ability_variant?: string | null;
  /**
   * Optional MSFS addon developer tag (FlyByWire, iniBuilds, Asobo, Fenix, …).
   * Multiple Plane records can share the same `name` and differ by the
   * (`addon_developer_variant`, `ability_variant`) pair. Null means "default /
   * stock" — the UI labels it "Default" in the variant picker.
   */
  addon_developer_variant?: string | null;
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
