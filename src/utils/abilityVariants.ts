import { ABILITY_VARIANTS, type AbilityVariant } from '../data/types';

const ABILITY_VARIANT_SET = new Set<string>(ABILITY_VARIANTS);

export function normalizeAbilityVariant(value: string | null | undefined): AbilityVariant | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return ABILITY_VARIANT_SET.has(normalized) ? (normalized as AbilityVariant) : null;
}

export function sortAbilityVariants(values: readonly string[]): AbilityVariant[] {
  const unique = new Set<AbilityVariant>();
  for (const value of values) {
    const normalized = normalizeAbilityVariant(value);
    if (normalized) unique.add(normalized);
  }
  return ABILITY_VARIANTS.filter(v => unique.has(v));
}
