/**
 * Regression tests for: "Boeing 777-300ER Beginner.json", "...Advanced.json", "...Expert.json"
 * must all produce the SAME base planeId ("boeing-777-300er") so they share one PlaneCard.
 *
 * The logic under test is the variant-stripping section of useImportHandlers (Format 6).
 * We inline the algorithm here so the test is self-contained and doesn't require a full
 * React environment.
 */
import { describe, expect, it } from 'vitest';
import { normalizeAbilityVariant } from '../abilityVariants';
import { ABILITY_VARIANTS } from '../../data/types';

/** Mirrors the detection + stripping logic in useImportHandlers Format 6 block */
function detectAndNormalize(aircraft: string, nickname?: string): { planeId: string; variant: string | null } {
  let name = aircraft;
  const nicknameLower = typeof nickname === 'string' ? nickname.toLowerCase() : '';

  const detectedAbilityVariant = normalizeAbilityVariant(
    ABILITY_VARIANTS.find(v => nicknameLower.includes(v)) ??
    ABILITY_VARIANTS.find(v => name.toLowerCase().includes(v)) ??
    null,
  );

  if (detectedAbilityVariant) {
    const stripped = name
      .replace(new RegExp(`\\b${detectedAbilityVariant}\\b`, 'gi'), '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    if (stripped) name = stripped;
  }

  const planeId = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return { planeId, variant: detectedAbilityVariant };
}

describe('Format 6 variant name normalization', () => {
  it('strips variant from aircraft when it appears in both aircraft and nickname', () => {
    // Case: aircraft = "Boeing 777-300ER Beginner", nickname contains "Beginner"
    const r = detectAndNormalize('Boeing 777-300ER Beginner', 'Boeing 777-300ER Beginner');
    expect(r.variant).toBe('beginner');
    expect(r.planeId).toBe('boeing-777-300er');
  });

  it('strips variant from aircraft when detected from aircraft only (no nickname)', () => {
    const r = detectAndNormalize('Boeing 777-300ER Expert');
    expect(r.variant).toBe('expert');
    expect(r.planeId).toBe('boeing-777-300er');
  });

  it('strips variant from aircraft when nickname has variant but aircraft also has it', () => {
    // All three 777 files share the same base planeId
    const beginner = detectAndNormalize('Boeing 777-300ER Beginner', 'Boeing 777-300ER Beginner Checklist');
    const advanced  = detectAndNormalize('Boeing 777-300ER Advanced', 'Boeing 777-300ER Advanced Checklist');
    const expert    = detectAndNormalize('Boeing 777-300ER Expert',   'Boeing 777-300ER Expert Checklist');
    expect(beginner.planeId).toBe('boeing-777-300er');
    expect(advanced.planeId).toBe('boeing-777-300er');
    expect(expert.planeId).toBe('boeing-777-300er');
    expect(beginner.variant).toBe('beginner');
    expect(advanced.variant).toBe('advanced');
    expect(expert.variant).toBe('expert');
  });

  it('does not strip when aircraft name is already clean (variant only in nickname)', () => {
    // aircraft = "Boeing 777-300ER", nickname = "777 Beginner"
    const r = detectAndNormalize('Boeing 777-300ER', '777 Beginner');
    expect(r.variant).toBe('beginner');
    expect(r.planeId).toBe('boeing-777-300er');
  });

  it('leaves non-variant planes unchanged', () => {
    const r = detectAndNormalize('Airbus A320');
    expect(r.variant).toBeNull();
    expect(r.planeId).toBe('airbus-a320');
  });
});
