export type SimPlatform = 'msfs2020' | 'msfs2024' | 'both';

export const ABILITY_VARIANTS = ['beginner', 'advanced', 'expert', 'professional'] as const;
export type AbilityVariant = typeof ABILITY_VARIANTS[number];

export interface Plane {
  id: string;
  name: string;
  manufacturer: string;
  image: string;
  type: string;
  sim?: SimPlatform;
  author?: string;
  author_weblink?: string;
  /** The ability-variant this plane represents, e.g. 'expert'. Set only on variant planes. */
  abilityVariant?: AbilityVariant;
  /** ID of the group/base plane. Set on variant planes so they can be grouped under one card. */
  groupId?: string;
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
