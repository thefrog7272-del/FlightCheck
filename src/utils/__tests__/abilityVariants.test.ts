import { describe, expect, it } from 'vitest';
import { normalizeAbilityVariant, sortAbilityVariants } from '../abilityVariants';

describe('abilityVariants utils', () => {
  it('normalizes known variants to lowercase and rejects unknown values', () => {
    expect(normalizeAbilityVariant(' Beginner ')).toBe('beginner');
    expect(normalizeAbilityVariant('ADVANCED')).toBe('advanced');
    expect(normalizeAbilityVariant('expert')).toBe('expert');
    expect(normalizeAbilityVariant('professional')).toBe('professional');
    expect(normalizeAbilityVariant('novice')).toBeNull();
  });

  it('returns stable sorted variants and filters unknown keys', () => {
    expect(sortAbilityVariants(['expert', 'Beginner', 'novice', 'advanced', 'EXPERT'])).toEqual([
      'beginner',
      'advanced',
      'expert',
    ]);
  });
});
