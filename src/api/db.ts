import type { Plane, PlaneChecklist } from '../data/types';

const API_BASE = '/api';

export interface DbState {
  custom_planes: Plane[];
  custom_checklists: Record<string, PlaneChecklist>;
  ability_variant_checklists: Record<string, Record<string, Record<string, PlaneChecklist>>>;
  deleted_static_planes: string[];
  checklist_progress: Record<string, Record<string, boolean>>;
  favorite_planes: string[];
  recently_used: Array<{ planeId: string; timestamp: number }>;
  item_notes: Record<string, string>;
  timer_data: Record<string, { startTime?: number; elapsed?: number; completed?: number }>;
}

export async function loadDb(): Promise<DbState> {
  const res = await fetch(`${API_BASE}/db`);
  if (!res.ok) throw new Error(`Failed to load database: ${res.statusText}`);
  return res.json();
}

export async function saveDb(db: DbState): Promise<void> {
  const res = await fetch(`${API_BASE}/db`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(db),
  });
  if (!res.ok) throw new Error(`Failed to save database: ${res.statusText}`);
}

export async function saveKey(key: keyof DbState, value: unknown): Promise<void> {
  const res = await fetch(`${API_BASE}/db/${key}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  });
  if (!res.ok) throw new Error(`Failed to save key "${key}": ${res.statusText}`);
}

export async function resetDb(): Promise<void> {
  const res = await fetch(`${API_BASE}/db`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to reset database: ${res.statusText}`);
}
