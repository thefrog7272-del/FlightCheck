import type { PlaneChecklist, ChecklistPhase } from '../data/types';

/** Priority order for cross-category dedup: lower number = higher priority (wins). */
const CROSS_CAT_PRIORITY: Record<string, number> = {
  Emergency: 0,
  Abnormal: 1,
  Reference: 2,
  __main__: 3,
};

/** Jaccard similarity on character bigrams between two strings (case-insensitive). */
function bigramSimilarity(a: string, b: string): number {
  const bigrams = (s: string) => {
    const norm = s.toLowerCase().replace(/\s+/g, ' ').trim();
    const set = new Set<string>();
    for (let i = 0; i < norm.length - 1; i++) set.add(norm.slice(i, i + 2));
    return set;
  };
  const aB = bigrams(a);
  const bB = bigrams(b);
  if (aB.size === 0 && bB.size === 0) return 1;
  if (aB.size === 0 || bB.size === 0) return 0;
  let intersection = 0;
  for (const bg of aB) { if (bB.has(bg)) intersection++; }
  return intersection / (aB.size + bB.size - intersection);
}

/**
 * Fraction of items in the phase with more items that have a fuzzy match
 * (≥80% bigram similarity) in the other phase, normalised by max item count.
 */
function phaseItemSimilarity(
  a: { items: { label: string }[] },
  b: { items: { label: string }[] },
): number {
  if (a.items.length === 0 && b.items.length === 0) return 1;
  if (a.items.length === 0 || b.items.length === 0) return 0;
  const ITEM_FUZZY_THRESHOLD = 0.8;
  let matches = 0;
  for (const ai of a.items) {
    for (const bi of b.items) {
      if (bigramSimilarity(ai.label, bi.label) >= ITEM_FUZZY_THRESHOLD) {
        matches++;
        break;
      }
    }
  }
  return matches / Math.max(a.items.length, b.items.length);
}

/**
 * Given a map of { categoryName → phases }, removes phases from lower-priority
 * categories when a higher-priority category already has a phase with the same
 * title and ≥70% item similarity.
 * Priority: Emergency > Abnormal > Reference > __main__ (normal).
 */
export function crossDeduplicateCategories<T extends { title: string; items: { label: string }[] }>(
  categoryMap: Record<string, T[]>,
): Record<string, T[]> {
  const THRESHOLD = 0.7;
  const allPairs: Array<{ cat: string; phase: T; priority: number }> = [];
  for (const [cat, phases] of Object.entries(categoryMap)) {
    const priority = CROSS_CAT_PRIORITY[cat] ?? 99;
    for (const phase of phases) {
      allPairs.push({ cat, phase, priority });
    }
  }
  console.log('[Dedup] crossDeduplicateCategories: categories =', Object.keys(categoryMap), 'total phases =', allPairs.length);
  const excluded = new Set<T>();
  for (const high of allPairs) {
    for (const low of allPairs) {
      if (high.cat === low.cat) continue;
      if (high.priority >= low.priority) continue;
      if (high.phase.title.trim().toLowerCase() !== low.phase.title.trim().toLowerCase()) continue;
      const sim = phaseItemSimilarity(high.phase, low.phase);
      console.log(`[Dedup] Comparing "${high.phase.title}" (${high.cat}) vs "${low.phase.title}" (${low.cat}): similarity=${sim.toFixed(2)}`);
      if (sim >= THRESHOLD) {
        console.log(`[Dedup] DROPPING "${low.phase.title}" from ${low.cat} — superseded by ${high.cat}`);
        excluded.add(low.phase);
      }
    }
  }
  const result: Record<string, T[]> = {};
  for (const [cat, phases] of Object.entries(categoryMap)) {
    result[cat] = phases.filter(p => !excluded.has(p));
  }
  return result;
}

/**
 * Apply crossDeduplicateCategories across a main checklist and a categories map
 * (keyed as planeId::categoryName). Returns updated checklist and categories.
 */
export function deduplicateChecklistWithCategories(
  planeId: string,
  checklist: PlaneChecklist,
  categories: Record<string, PlaneChecklist>,
): { checklist: PlaneChecklist; categories: Record<string, PlaneChecklist> } {
  // Build a flat map of category name → phases for dedup
  const catMap: Record<string, ChecklistPhase[]> = { __main__: checklist.phases };
  for (const [key, cl] of Object.entries(categories)) {
    const catName = key.startsWith(`${planeId}::`) ? key.slice(planeId.length + 2) : key;
    catMap[catName] = cl.phases;
  }

  const deduped = crossDeduplicateCategories(catMap);

  const newChecklist: PlaneChecklist = { ...checklist, phases: deduped['__main__'] ?? checklist.phases };
  const newCategories: Record<string, PlaneChecklist> = {};
  for (const [key, cl] of Object.entries(categories)) {
    const catName = key.startsWith(`${planeId}::`) ? key.slice(planeId.length + 2) : key;
    newCategories[key] = { ...cl, phases: deduped[catName] ?? cl.phases };
  }

  return { checklist: newChecklist, categories: newCategories };
}
