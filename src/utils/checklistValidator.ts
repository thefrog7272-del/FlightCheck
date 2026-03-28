import type { Plane, PlaneChecklist } from '../data/types';

export type WarningLevel = 'error' | 'warning' | 'info';

export interface ImportWarning {
  level: WarningLevel;
  message: string;
}

/**
 * Validates a parsed checklist and returns any issues found.
 * Warnings don't block import — they inform the user what may need manual editing.
 */
export function validateChecklist(checklist: PlaneChecklist, plane?: Plane): ImportWarning[] {
  const warnings: ImportWarning[] = [];
  const { phases } = checklist;

  if (phases.length === 0) {
    warnings.push({ level: 'error', message: 'No checklist phases found' });
    return warnings;
  }

  const totalItems = phases.reduce((s, p) => s + p.items.length, 0);

  // Items missing expectedState
  const missingState = phases.flatMap(p => p.items.filter(i => !i.expectedState));
  if (missingState.length > 0) {
    if (missingState.length === totalItems) {
      warnings.push({
        level: 'warning',
        message: 'No items have an expected state (e.g. "ON", "SET") — they may need manual editing',
      });
    } else {
      warnings.push({
        level: 'warning',
        message: `${missingState.length} of ${totalItems} items missing expected state`,
      });
    }
  }

  // Duplicate items within a phase
  for (const phase of phases) {
    const seen = new Map<string, number>();
    for (const item of phase.items) {
      const key = item.label.toLowerCase();
      seen.set(key, (seen.get(key) || 0) + 1);
    }
    const dupes = [...seen.entries()].filter(([, count]) => count > 1).map(([label]) => label);
    if (dupes.length > 0) {
      const names = dupes.slice(0, 3).map(d => `"${d}"`).join(', ');
      const suffix = dupes.length > 3 ? ` and ${dupes.length - 3} more` : '';
      warnings.push({
        level: 'warning',
        message: `"${phase.title}" has duplicate items: ${names}${suffix}`,
      });
    }
  }

  // Phase named "General" (auto-generated fallback when no header was detected)
  if (phases.some(p => p.title === 'General')) {
    warnings.push({
      level: 'warning',
      message: '"General" phase was auto-generated — no section header was detected for those items',
    });
  }

  // Duplicate phase names
  const phaseNames = phases.map(p => p.title.toLowerCase());
  const dupPhases = [...new Set(phaseNames.filter((n, i) => phaseNames.indexOf(n) !== i))];
  if (dupPhases.length > 0) {
    warnings.push({
      level: 'warning',
      message: `Duplicate phase names: ${dupPhases.map(d => `"${d}"`).join(', ')}`,
    });
  }

  // Very short phases (1 item) — likely parsing errors
  const shortPhases = phases.filter(p => p.items.length === 1);
  if (shortPhases.length > 0 && shortPhases.length <= 5) {
    warnings.push({
      level: 'info',
      message: `${shortPhases.length} phase(s) have only 1 item: ${shortPhases.map(p => `"${p.title}"`).join(', ')}`,
    });
  } else if (shortPhases.length > 5) {
    warnings.push({
      level: 'info',
      message: `${shortPhases.length} phases have only 1 item — some section headers may have been misdetected`,
    });
  }

  // Very long labels (possible parsing errors — two items merged)
  const longLabels = phases.flatMap(p => p.items.filter(i => i.label.length > 80));
  if (longLabels.length > 0) {
    warnings.push({
      level: 'warning',
      message: `${longLabels.length} item(s) have unusually long labels — possible parsing error`,
    });
  }

  // Plane metadata
  if (plane && (!plane.name || plane.name === 'Unknown Aircraft')) {
    warnings.push({
      level: 'info',
      message: 'Aircraft name not detected — set it manually before importing',
    });
  }

  return warnings;
}

/**
 * Format warnings into a readable string for alert messages.
 */
export function formatWarnings(warnings: ImportWarning[]): string {
  if (warnings.length === 0) return '';
  const lines = warnings.map(w => {
    const prefix = w.level === 'error' ? 'Error' : w.level === 'warning' ? 'Warning' : 'Note';
    return `${prefix}: ${w.message}`;
  });
  return '\n\n' + lines.join('\n');
}
