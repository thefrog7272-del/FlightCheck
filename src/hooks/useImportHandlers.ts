import { useState, useCallback } from 'react';
import { parsePlaneCsv } from '../utils/csvParser';
import { crossDeduplicateCategories } from '../utils/checklistDedup';
import { enrichPlane } from '../utils/enrichPlane';
import { validateChecklist, formatWarnings } from '../utils/checklistValidator';
import {
  createSharedPlane,
  createSharedChecklist,
  createPendingSubmission,
  listSharedPlanes,
  listAllSharedChecklists,
  updateSharedPlane,
  updateSharedChecklist,
  deleteSharedChecklist as _deleteSharedChecklist,
} from '../api/sharedPlanes';
import type { Plane, PlaneChecklist } from '../data/types';

// ── Suppress unused import warning (deleteSharedChecklist kept for future use) ──
void _deleteSharedChecklist;

// ── Ability variants ─────────────────────────────────────────────────────────
// A JSON import's `nickname` field is scanned (case-insensitive) for one of
// these keywords to tag the plane with an ability variant. Multiple variants
// of the same aircraft coexist as separate shared_planes rows that share `name`
// but have distinct `plane_id`s (slug + variant suffix).
const ABILITY_VARIANTS = ['Beginner', 'Assist', 'Easy', 'Basic', 'Essential', 'Intermediate', 'Paper', 'Original Plus', 'Original', 'Normal', 'Standard',  'Advanced', 'Extended', 'Expert', 'Professional'] as const;
type AbilityVariant = typeof ABILITY_VARIANTS[number];

export function deriveAbilityVariant(nickname: unknown): {
  variant: AbilityVariant | null;
  slugSuffix: string;
} {
  if (typeof nickname !== 'string' || !nickname.trim()) {
    return { variant: null, slugSuffix: '' };
  }
  const lower = nickname.toLowerCase();
  for (const v of ABILITY_VARIANTS) {
    if (lower.includes(v.toLowerCase())) {
      return { variant: v, slugSuffix: `-${v.toLowerCase()}` };
    }
  }
  return { variant: null, slugSuffix: '' };
}

// ── Addon developer variants ─────────────────────────────────────────────────
// The `nickname` (and as a fallback, the `aircraft` field itself) is scanned
// for one of these known MSFS addon developer names. The matched keyword
// becomes `addon_developer_variant` and contributes a slug suffix to plane_id,
// so rows like FlyByWire A320neo and iniBuilds A320neo coexist under the same
// display `name` but with distinct `plane_id`s.
//
// ORDER MATTERS. The first keyword whose lowercase appears in the nickname
// wins, so longer / more specific brand names must come before any keyword
// that is a substring of them (e.g. "FlyByWire" before a hypothetical "Fly").
const ADDON_DEVELOPERS = [
  'FlyByWire',
  'Horizon Simulations',
  'Hype Performance Group',
  'Working Title',
  'IndiaFoxtEcho',
  'Aeroplane Heaven',
  'BlueBird Simulations',
  'BlackBox Simulations',
  'NEMETH Designs',
  'Just Flight',
  'Parallel 42',
  'DC Designs',
  'SC Designs',
  'iniBuilds',
  'Aerosoft',
  'Leonardo',
  'Headwind',
  'Flysimware',
  'CowanSim',
  'Carenado',
  'Milviz',
  'Fenix',
  'PMDG',
  'Salty',
  'FSReborn',
  'Got Friends',
  'Asobo',
] as const;
type AddonDeveloper = typeof ADDON_DEVELOPERS[number];

export function deriveAddonDeveloper(...sources: unknown[]): {
  developer: AddonDeveloper | null;
  slugSuffix: string;
} {
  const haystack = sources
    .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    .join(' ')
    .toLowerCase();
  if (!haystack) return { developer: null, slugSuffix: '' };
  for (const dev of ADDON_DEVELOPERS) {
    if (haystack.includes(dev.toLowerCase())) {
      const slug = dev.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      return { developer: dev, slugSuffix: `-${slug}` };
    }
  }
  return { developer: null, slugSuffix: '' };
}

// Remove a matched keyword (developer or ability) from an aircraft name string
// so different variants of the same airframe collapse to a single display name
// (e.g. "FlyByWire A320neo" + "iniBuilds A320neo" both become "A320neo" and
// group into one PlaneCard). Strips any leftover separators / double spaces.
// Falls back to the original name if stripping would leave an empty string.
export function stripVariantKeywordFromName(name: string, keyword: string | null): string {
  if (!keyword) return name;
  // Allow flexible whitespace inside multi-word keywords ("Just Flight").
  const escaped = keyword
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\s+/g, '\\s+');
  const cleaned = name
    .replace(new RegExp(escaped, 'gi'), '')
    // Collapse whitespace + dangling separators (-, _, slashes) created by the strip.
    .replace(/[\s_/\\-]{2,}/g, ' ')
    .replace(/^[\s_/\\-]+|[\s_/\\-]+$/g, '')
    .trim();
  return cleaned || name;
}

interface UseImportHandlersParams {
  planes: Plane[];
  addPlane: (plane: Plane, checklist: PlaneChecklist) => void;
  addCategory: (planeId: string, categoryName: string, checklist: PlaneChecklist) => void;
  importFleet: (json: unknown) => { planes: number; checklists: number; progress: number };
  isAdmin: boolean;
  refreshSharedPlanes: () => Promise<void | boolean>;
  onImportComplete?: () => void;
}

export function useImportHandlers({
  planes,
  addPlane,
  addCategory,
  importFleet,
  isAdmin,
  refreshSharedPlanes,
  onImportComplete,
}: UseImportHandlersParams) {
  const [csvInput, setCsvInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<string | null>(null);

  // ── Core: save a single plane+checklist to Supabase (admin) or localStorage ──
  const importPlane = useCallback(async (plane: Plane, checklist: PlaneChecklist) => {
    console.log(`[FlightCheck Import] isAdmin=${isAdmin}, plane=${plane.id} "${plane.name}", phases=${checklist.phases.length}, items=${checklist.phases.reduce((s, p) => s + p.items.length, 0)}`);

    // Auto-enrich missing fields in the background before saving
    if (!plane.image || !plane.manufacturer || !plane.type || plane.type === 'GA') {
      try {
        const enriched = await enrichPlane(plane.name, {
          image: plane.image,
          manufacturer: plane.manufacturer,
          type: plane.type,
        });
        if (enriched.image && !plane.image) plane = { ...plane, image: enriched.image };
        if (enriched.manufacturer && !plane.manufacturer) plane = { ...plane, manufacturer: enriched.manufacturer };
        if (enriched.type && (!plane.type || plane.type === 'GA')) plane = { ...plane, type: enriched.type };
        console.log('[FlightCheck Import] Enriched:', enriched);
      } catch (e) {
        console.warn('[FlightCheck Import] Enrichment failed (non-fatal):', e);
      }
    }

    let supabaseSuccess = false;
    if (isAdmin) {
      console.log('[FlightCheck Import] Admin path → saving to Supabase...');
      try {
        const existingPlanes = await listSharedPlanes();
        const existing = existingPlanes.find(p => p.plane_id === plane.id);

        if (existing) {
          console.log('[FlightCheck Import] Plane already exists, updating...');
          await updateSharedPlane(existing.id, {
            name: plane.name,
            manufacturer: plane.manufacturer,
            image: plane.image,
            type: plane.type,
            sim: plane.sim || null,
            author: plane.author,
            author_weblink: plane.author_weblink,
            ability_variant: plane.ability_variant ?? null,
            addon_developer_variant: plane.addon_developer_variant ?? null,
          });
          const existingChecklists = await listAllSharedChecklists();
          const existingCl = existingChecklists.find(
            c => c.plane_id === plane.id && c.category.toLowerCase() === 'normal',
          );
          if (existingCl) {
            await updateSharedChecklist(existingCl.id, JSON.stringify(checklist.phases));
          } else {
            await createSharedChecklist({ plane_id: plane.id, category: 'normal', phases: JSON.stringify(checklist.phases) });
          }
          supabaseSuccess = true;
        } else {
          const planeResult = await createSharedPlane({
            plane_id: plane.id,
            name: plane.name,
            manufacturer: plane.manufacturer,
            image: plane.image,
            type: plane.type,
            sim: plane.sim || null,
            sort_order: null,
            author: plane.author,
            author_weblink: plane.author_weblink,
            ability_variant: plane.ability_variant ?? null,
            addon_developer_variant: plane.addon_developer_variant ?? null,
          });
          if (planeResult) {
            console.log('[FlightCheck Import] Plane created, saving checklist...');
            await createSharedChecklist({
              plane_id: plane.id,
              category: 'normal',
              phases: JSON.stringify(checklist.phases),
            });
            supabaseSuccess = true;
          }
        }
      } catch (error) {
        console.log('[FlightCheck Import] Supabase error:', error);
      }

      if (supabaseSuccess) {
        console.log('[FlightCheck Import] Clearing cache and refreshing...');
        try { localStorage.removeItem('shared_planes_cache'); } catch { /* */ }
        await refreshSharedPlanes();
        console.log('[FlightCheck Import] Refresh complete');
        onImportComplete?.();
        return;
      }
    }

    console.log('[FlightCheck Import] Non-admin path → saving to localStorage');
    addPlane(plane, checklist);
    onImportComplete?.();
  }, [isAdmin, addPlane, refreshSharedPlanes, onImportComplete]);

  // ── CSV import (modal textarea / file upload) ──
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleImport = async () => {
    try {
      if (!csvInput.trim()) {
        alert('Please paste or upload CSV content first.');
        return;
      }
      const { plane, checklist, categories } = parsePlaneCsv(csvInput);
      console.log('[FlightCheck Import] Parsed plane:', plane, 'checklist phases:', checklist.phases.length, 'categories:', Object.keys(categories));

      if (checklist.phases.length === 0 && Object.keys(categories).length === 0) {
        alert('CSV was parsed but no checklist phases/items were found. Check your CSV format.');
        return;
      }

      if (imagePreview) plane.image = imagePreview;

      const totalItems = checklist.phases.reduce((sum, p) => sum + p.items.length, 0);
      const csvWarnings = formatWarnings(validateChecklist(checklist, plane));

      console.log('[FlightCheck Import] Adding plane to localStorage:', plane.id);
      addPlane(plane, checklist);

      const categoryKeys = Object.keys(categories);
      console.log('[FlightCheck Import] Adding categories:', categoryKeys);
      for (const categoryName of categoryKeys) {
        addCategory(plane.id, categoryName, categories[categoryName]);
      }

      const totalCategoryItems = categoryKeys.reduce(
        (sum: number, cat: string) =>
          sum + (categories[cat]?.phases.reduce((s: number, p: { items: unknown[] }) => s + p.items.length, 0) || 0),
        0,
      );

      setTimeout(() => {
        alert(
          `Imported "${plane.name}" with ${checklist.phases.length} phase(s), ${totalItems} main items, ` +
          `and ${categoryKeys.length} category(ies) with ${totalCategoryItems} items.` +
          `${isAdmin ? ' (saved to shared database)' : ''}${csvWarnings}`,
        );
        if (!isAdmin) {
          const submitToAll = window.confirm(
            `Would you also like to submit "${plane.name}" for all users? (Requires admin approval)`,
          );
          if (submitToAll) {
            createPendingSubmission({
              name: plane.name,
              manufacturer: plane.manufacturer,
              image: plane.image || null,
              type: plane.type,
              sim: plane.sim || null,
              phases: JSON.stringify(checklist.phases),
              submitted_by: null,
              status: 'pending',
            });
            alert('Submitted for review! An admin will approve it shortly.');
          }
        }
      }, 100);

      setCsvInput('');
      setImagePreview(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to parse CSV');
    }
  };

  // ── JSON file import (Formats 1-6) ──
  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const json = JSON.parse(reader.result as string);

        // ── Format 1: Flat array [{ name, manufacturer, phase, item, expectedState, category? }, ...] ──
        if (Array.isArray(json) && json.length > 0 && json[0].phase && json[0].item) {
          const first = json[0];
          const name = first.name || file.name.replace(/\.[^.]+$/, '');
          const planeId = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const plane = {
            id: planeId, name, manufacturer: first.manufacturer || '',
            image: first.image || '', type: first.type || 'GA',
          };

          const MAIN_KEY = '__main__';
          const categoryPhaseMaps = new Map<string, Map<string, {
            id: string; title: string;
            items: { id: string; label: string; expectedState?: string; reference?: string }[];
          }>>();

          for (const row of json) {
            const phaseTitle = row.phase?.trim();
            const itemLabel = row.item?.trim();
            if (!phaseTitle || !itemLabel) continue;

            const rowCategory = (
              row.category || row.checklistCategory ||
              row['checklist category'] || row['Checklist Category'] || ''
            ).trim();
            const isMain =
              !rowCategory ||
              rowCategory.toLowerCase() === 'normal checklist' ||
              rowCategory.toLowerCase() === 'standard';
            const mapKey = isMain ? MAIN_KEY : rowCategory;

            if (!categoryPhaseMaps.has(mapKey)) categoryPhaseMaps.set(mapKey, new Map());
            const phasesMap = categoryPhaseMaps.get(mapKey)!;

            if (!phasesMap.has(phaseTitle)) {
              const phaseId = phaseTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
              phasesMap.set(phaseTitle, { id: phaseId, title: phaseTitle, items: [] });
            }
            const phase = phasesMap.get(phaseTitle)!;
            phase.items.push({
              id: `${phase.id}-${phase.items.length}`,
              label: itemLabel,
              expectedState: row.expectedState?.trim() || undefined,
              reference: row.reference?.trim() || undefined,
            });
          }

          const mainPhasesMap = categoryPhaseMaps.get(MAIN_KEY) ?? new Map();
          const phases = Array.from(mainPhasesMap.values());
          const totalItems = phases.reduce((sum, p) => sum + p.items.length, 0);
          const checklist = { planeId, phases };

          const jsoncategorys: Record<string, { planeId: string; phases: typeof phases }> = {};
          for (const [key, phasesMap] of categoryPhaseMaps) {
            if (key === MAIN_KEY) continue;
            jsoncategorys[key] = { planeId, phases: Array.from(phasesMap.values()) };
          }

          const jsonWarnings = formatWarnings(validateChecklist(checklist, plane));
          await importPlane(plane, checklist);
          setImportSummary(
            `Imported "${name}" with ${phases.length} phase(s) and ${totalItems} item(s).` +
            `${isAdmin ? ' (shared)' : ''}${jsonWarnings}`,
          );

          if (!isAdmin) {
            const submitToAll = window.confirm(
              `Would you also like to submit "${name}" for all users? (Requires admin approval)`,
            );
            if (submitToAll) {
              await createPendingSubmission({
                name, manufacturer: plane.manufacturer, image: plane.image || null,
                type: plane.type, sim: undefined, phases: JSON.stringify(phases),
                submitted_by: null, status: 'pending',
              });
              setImportSummary(prev => (prev || '') + ' Submitted for community review!');
            }
          }

          for (const [categoryName, categoryChecklist] of Object.entries(jsoncategorys)) {
            if (!planes.some(p => p.id === planeId)) await importPlane(plane, checklist);
            addCategory(planeId, categoryName, categoryChecklist);
          }
          if (Object.keys(jsoncategorys).length > 0) {
            setImportSummary(
              prev => (prev || '') +
              ` Also imported ${Object.keys(jsoncategorys).length} category(s): ${Object.keys(jsoncategorys).join(', ')}`,
            );
          }
          return;
        }

        // ── Format 2: { plane: {...}, checklist: {...} } ──
        if (json.plane && json.checklist && json.checklist.phases) {
          await importPlane(json.plane, json.checklist);
          const fmt2Warnings = formatWarnings(validateChecklist(json.checklist, json.plane));
          setImportSummary(`Imported "${json.plane.name}" successfully.${isAdmin ? ' (shared)' : ''}${fmt2Warnings}`);
          return;
        }

        // ── Format 3: { name, phases } or { planeId, phases } ──
        if (json.phases && Array.isArray(json.phases)) {
          const name = json.name || json.planeId || file.name.replace(/\.[^.]+$/, '');
          const planeId = (json.planeId || name).toLowerCase().replace(/[^a-z0-9]/g, '-');
          const plane = { id: planeId, name, manufacturer: json.manufacturer || '', image: json.image || '', type: json.type || 'GA' };
          const checklist = { planeId, phases: json.phases };
          await importPlane(plane, checklist);
          const fmt3Warnings = formatWarnings(validateChecklist(checklist, plane));
          setImportSummary(`Imported "${name}" with ${json.phases.length} phase(s).${isAdmin ? ' (shared)' : ''}${fmt3Warnings}`);
          return;
        }

        // ── Format 4: Fleet backup { version: 1, ... } ──
        if (json.version === 1) {
          const result = importFleet(json);
          setImportSummary(
            `Imported ${result.planes} plane(s), ${result.checklists} checklist(s), ${result.progress} progress record(s).`,
          );
          onImportComplete?.();
          return;
        }

        // ── Format 5: { custom_planes / custom_checklists } (no version) ──
        if (json.custom_planes || json.custom_checklists) {
          const result = importFleet({ ...json, version: 1 });
          setImportSummary(`Imported ${result.planes} plane(s), ${result.checklists} checklist(s).`);
          onImportComplete?.();
          return;
        }

        // ── Format 6: { aircraft, checklist: [{ name|title, type?, items: [{callout, response, "type:"}] }] } ──
        if (json.aircraft && Array.isArray(json.checklist) && json.checklist.length > 0) {
          const getPhaseTitle = (phase: Record<string, unknown>): string => {
            for (const key of Object.keys(phase)) {
              if (key.trim().toLowerCase() === 'title' || key.trim().toLowerCase() === 'name') {
                const val = phase[key];
                if (typeof val === 'string' && val.trim()) return val.trim();
              }
            }
            return '';
          };

          const CATEGORY_KEYS = ['Emergency', 'Abnormal', 'Reference'] as const;
          type CategoryKey = typeof CATEGORY_KEYS[number];
          const normaliseCategory = (raw: unknown): CategoryKey | null => {
            if (!raw || typeof raw !== 'string') return null;
            const lower = raw.trim().toLowerCase();
            if (lower === 'emergency') return 'Emergency';
            if (lower === 'abnormal') return 'Abnormal';
            if (lower === 'reference') return 'Reference';
            return null;
          };

          const rawName = String(json.aircraft);
          const isChecklistReaderFormat = 'nickname' in json;
          const nickname = isChecklistReaderFormat ? (json as { nickname?: unknown }).nickname : undefined;
          // `nickname` is scanned for ability-variant keywords and addon-developer
          // keywords. Matches become `ability_variant` / `addon_developer_variant`
          // and contribute slug suffixes to plane_id so every (name × developer ×
          // ability) combo gets its own shared_planes row instead of overwriting.
          // Developer also falls back to the raw aircraft string (e.g. "Fenix A320"
          // without a nickname).
          const { variant: abilityVariant, slugSuffix: abilitySuffix } = deriveAbilityVariant(nickname);
          const { developer: addonDeveloper, slugSuffix: devSuffix } = deriveAddonDeveloper(nickname, rawName);
          // Strip the matched developer / ability keywords from the displayed
          // name so all variants of the same airframe collapse to the same
          // `name` and Home.tsx groups them into one PlaneCard. Without this,
          // `aircraft: "FlyByWire A320neo"` and `aircraft: "iniBuilds A320neo"`
          // would render as two separate cards.
          const name = stripVariantKeywordFromName(
            stripVariantKeywordFromName(rawName, addonDeveloper),
            abilityVariant,
          );
          const planeId = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + devSuffix + abilitySuffix;
          const plane: Plane = {
            id: planeId,
            name,
            manufacturer: '',
            image: '',
            type: 'GA',
            ability_variant: abilityVariant,
            addon_developer_variant: addonDeveloper,
            ...(isChecklistReaderFormat ? {
              author: 'Checklist based on SimFlightChris Checklist Reader format',
              author_weblink: 'https://flightsim.to/addon/96054/checklist-reader-voice-controlled-checklist-tool-beta-v1-0-0',
            } : {}),
          };

          const categoryPhases: Record<CategoryKey, Array<{ id: string; title: string; items: { id: string; label: string; expectedState?: string }[] }>> = {
            Emergency: [], Abnormal: [], Reference: [],
          };
          const mainPhases: typeof categoryPhases['Emergency'] = [];

          (json.checklist as Array<Record<string, unknown>>).forEach((phase, pi) => {
            const phaseTitle = getPhaseTitle(phase) || `Phase ${pi + 1}`;
            const phaseId = phaseTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') + `-${pi}`;
            const phaseCategory = normaliseCategory(phase['type']);

            const buckets: Record<'main' | CategoryKey, { id: string; label: string; expectedState?: string; annotationType?: 'caution' | 'note' | 'warning' }[]> = {
              main: [], Emergency: [], Abnormal: [], Reference: [],
            };

            ((phase['items'] ?? []) as Array<Record<string, unknown>>).forEach((item, ii) => {
              const itemId = `${phaseId}-${ii}`;
              const itemCategory = normaliseCategory(item['type:']) ?? phaseCategory;
              const bucket: 'main' | CategoryKey = itemCategory ?? 'main';

              if (item['pause'] && Array.isArray(item['pause'])) {
                const noteText = String(item['pause'][1] ?? item['pause'][0] ?? '');
                if (noteText) buckets[bucket].push({ id: itemId, label: noteText });
              } else if (item['callout']) {
                const rawType = typeof item['type'] === 'string' ? item['type'].toLowerCase() : null;
                if (rawType === 'caution' || rawType === 'note' || rawType === 'warning') {
                  buckets[bucket].push({ id: itemId, label: String(item['callout']), annotationType: rawType });
                } else {
                  buckets[bucket].push({
                    id: itemId,
                    label: String(item['callout']),
                    ...(item['response'] ? { expectedState: String(item['response']) } : {}),
                  });
                }
              }
            });

            if (buckets.main.length > 0) mainPhases.push({ id: phaseId, title: phaseTitle, items: buckets.main });
            for (const cat of CATEGORY_KEYS) {
              if (buckets[cat].length > 0) {
                categoryPhases[cat].push({ id: `${phaseId}-${cat.toLowerCase()}`, title: phaseTitle, items: buckets[cat] });
              }
            }
          });

          // Cross-category dedup: if Emergency and Abnormal have the same phase
          // (same title + ≥70% item similarity), keep only the Emergency one.
          const dedupMap = crossDeduplicateCategories({
            ...categoryPhases,
            __main__: mainPhases,
          } as unknown as Record<string, { title: string; items: { label: string }[] }[]>);
          const dedupedMain = (dedupMap['__main__'] ?? mainPhases) as typeof mainPhases;
          for (const cat of CATEGORY_KEYS) {
            categoryPhases[cat] = (dedupMap[cat] ?? categoryPhases[cat]) as typeof categoryPhases[typeof cat];
          }

          const checklist = { planeId, phases: dedupedMain };
          await importPlane(plane, checklist);

          const importedCategories: string[] = [];
          for (const cat of CATEGORY_KEYS) {
            if (categoryPhases[cat].length > 0) {
              const categoryChecklist = { planeId, phases: categoryPhases[cat] };
              if (isAdmin) {
                const allCl = await listAllSharedChecklists();
                const existing = allCl.find(c => c.plane_id === planeId && c.category === cat);
                if (existing) {
                  await updateSharedChecklist(existing.id, JSON.stringify(categoryPhases[cat]));
                } else {
                  await createSharedChecklist({ plane_id: planeId, category: cat, phases: JSON.stringify(categoryPhases[cat]) });
                }
              } else {
                addCategory(planeId, cat, categoryChecklist);
              }
              importedCategories.push(cat);
            }
          }

          const fmt6Warnings = formatWarnings(validateChecklist(checklist, plane));
          const mainItemCount = dedupedMain.reduce((s, p) => s + p.items.length, 0);
          const catSummary = importedCategories.length > 0 ? ` + categories: ${importedCategories.join(', ')}` : '';
          setImportSummary(
            `Imported "${name}" with ${dedupedMain.length} phase(s) and ${mainItemCount} item(s)${catSummary}.` +
            `${isAdmin ? ' (shared)' : ''}${fmt6Warnings}`,
          );
          return;
        }

        alert('Unrecognized JSON format. Supported: flat array of items, { plane, checklist }, { phases }, or fleet backup.');
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return {
    csvInput,
    setCsvInput,
    imagePreview,
    setImagePreview,
    importSummary,
    setImportSummary,
    importPlane,
    handleImport,
    handleJsonImport,
    handleFileChange,
  };
}
