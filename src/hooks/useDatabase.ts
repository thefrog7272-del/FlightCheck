import { useState, useEffect, useRef, useCallback } from 'react';
import { loadDb, saveKey, resetDb as apiResetDb, type DbState } from '../api/db';

const DEBOUNCE_MS = 500;

function migrateFromLocalStorage(): Partial<DbState> | null {
  const migrated: Partial<DbState> = {};
  let hasMigrationData = false;

  const customPlanes = localStorage.getItem('custom_planes');
  if (customPlanes) {
    try {
      migrated.custom_planes = JSON.parse(customPlanes);
      hasMigrationData = true;
    } catch { /* ignore malformed data */ }
  }

  const customChecklists = localStorage.getItem('custom_checklists');
  if (customChecklists) {
    try {
      migrated.custom_checklists = JSON.parse(customChecklists);
      hasMigrationData = true;
    } catch { /* ignore malformed data */ }
  }

  const deletedPlanes = localStorage.getItem('deleted_static_planes');
  if (deletedPlanes) {
    try {
      migrated.deleted_static_planes = JSON.parse(deletedPlanes);
      hasMigrationData = true;
    } catch { /* ignore malformed data */ }
  }

  // Collect checklist_progress_* keys
  const progress: Record<string, Record<string, boolean>> = {};
  let hasProgress = false;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('checklist_progress_')) {
      try {
        const planeId = key.replace('checklist_progress_', '');
        progress[planeId] = JSON.parse(localStorage.getItem(key)!);
        hasProgress = true;
      } catch { /* ignore malformed data */ }
    }
  }
  if (hasProgress) {
    migrated.checklist_progress = progress;
    hasMigrationData = true;
  }

  return hasMigrationData ? migrated : null;
}

function clearMigratedLocalStorage() {
  localStorage.removeItem('custom_planes');
  localStorage.removeItem('custom_checklists');
  localStorage.removeItem('deleted_static_planes');

  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('checklist_progress_')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

function isDbEmpty(db: DbState): boolean {
  return (
    db.custom_planes.length === 0 &&
    Object.keys(db.custom_checklists).length === 0 &&
    db.deleted_static_planes.length === 0 &&
    Object.keys(db.checklist_progress).length === 0
  );
}

const FALLBACK_KEY = 'flightcheck_db';

function loadFromLocalStorage(): DbState {
  try {
    const stored = localStorage.getItem(FALLBACK_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  // Also try migrating old-style keys
  const migrated = migrateFromLocalStorage();
  if (migrated) {
    const db = { ...({ custom_planes: [], custom_checklists: {}, deleted_static_planes: [], checklist_progress: {}, favorite_planes: [], recently_used: [], item_notes: {}, timer_data: {} } as DbState), ...migrated };
    clearMigratedLocalStorage();
    return db;
  }
  return { custom_planes: [], custom_checklists: {}, deleted_static_planes: [], checklist_progress: {}, favorite_planes: [], recently_used: [], item_notes: {}, timer_data: {} };
}

function saveToLocalStorage(data: DbState) {
  console.log('>>>> saveToLocalStorage called, keys:', Object.keys(data));
  try { 
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(data)); 
    console.log('>>>> localStorage.setItem succeeded');
  } catch (e) { 
    console.log('>>>> localStorage.setItem failed:', e); 
  } 
}

export function useDatabase() {
  const [data, setData] = useState<DbState | null>(null);
  const [loading, setLoading] = useState(true);
  const [useApi, setUseApi] = useState(true);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    loadDb()
      .then(async (db) => {
        if (isDbEmpty(db)) {
          const migrated = migrateFromLocalStorage();
          if (migrated) {
            const merged: DbState = { ...db, ...migrated };
            const promises = (Object.keys(migrated) as (keyof DbState)[]).map((key) =>
              saveKey(key, migrated[key]),
            );
            await Promise.all(promises);
            clearMigratedLocalStorage();
            setData(merged);
            setLoading(false);
            return;
          }
        }
        setData(db);
        setLoading(false);
      })
      .catch(() => {
        // API unavailable — fall back to localStorage
        setUseApi(false);
        setData(loadFromLocalStorage());
        setLoading(false);
      });
  }, []);

  const updateKey = useCallback(
    <K extends keyof DbState>(key: K, value: DbState[K] | ((prev: DbState[K]) => DbState[K])) => {
      console.log('>>>> useDatabase updateKey called:', key, 'value type:', typeof value);
      // Update local state immediately and always persist to localStorage as a
      // reliable fallback (the static Amplify deployment has no /api backend, so
      // localStorage is the only durable store; always writing it avoids losing
      // data during the brief startup window before useApi flips to false).
      setData((prev) => {
        if (!prev) return prev;
        const prevValue = prev[key];
        const resolvedValue = typeof value === 'function' ? (value as (p: DbState[K]) => DbState[K])(prevValue) : value;
        const next = { ...prev, [key]: resolvedValue };
        saveToLocalStorage(next);
        return next;
      });

      if (useApi) {
        // Debounce the API write
        if (timers.current[key]) {
          clearTimeout(timers.current[key]);
        }
        timers.current[key] = setTimeout(() => {
          // For functional updates, resolve against current API state
          if (typeof value === 'function') {
            // Skip functional API updates for now — they're primarily for localStorage
            delete timers.current[key];
            return;
          }
          saveKey(key, value);
          delete timers.current[key];
        }, DEBOUNCE_MS);
      }
    },
    [useApi],
  );

  const resetAll = useCallback(async () => {
    const fresh: DbState = { custom_planes: [], custom_checklists: {}, deleted_static_planes: [], checklist_progress: {}, favorite_planes: [], recently_used: [], item_notes: {}, timer_data: {} };
    if (useApi) {
      await apiResetDb();
      setData(await loadDb());
    } else {
      saveToLocalStorage(fresh);
      setData(fresh);
    }
  }, [useApi]);

  // Clean up pending timers on unmount
  useEffect(() => {
    const currentTimers = timers.current;
    return () => {
      Object.values(currentTimers).forEach(clearTimeout);
    };
  }, []);

  return { data, loading, updateKey, resetAll };
}
