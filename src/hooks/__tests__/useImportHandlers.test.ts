import { describe, it, expect } from 'vitest';
import { deriveAbilityVariant, deriveAddonDeveloper, stripVariantKeywordFromName } from '../useImportHandlers';

describe('deriveAbilityVariant', () => {
  it('returns null variant for empty / non-string nicknames', () => {
    expect(deriveAbilityVariant(undefined)).toEqual({ variant: null, slugSuffix: '' });
    expect(deriveAbilityVariant(null)).toEqual({ variant: null, slugSuffix: '' });
    expect(deriveAbilityVariant('')).toEqual({ variant: null, slugSuffix: '' });
    expect(deriveAbilityVariant('   ')).toEqual({ variant: null, slugSuffix: '' });
    expect(deriveAbilityVariant(42 as unknown)).toEqual({ variant: null, slugSuffix: '' });
  });

  it('matches each ability keyword case-insensitively inside the nickname', () => {
    expect(deriveAbilityVariant('Cessna Beginner pack')).toEqual({ variant: 'Beginner', slugSuffix: '-beginner' });
    expect(deriveAbilityVariant('my INTERMEDIATE build')).toEqual({ variant: 'Intermediate', slugSuffix: '-intermediate' });
    expect(deriveAbilityVariant('expert')).toEqual({ variant: 'Expert', slugSuffix: '-expert' });
    expect(deriveAbilityVariant('AdVaNcEd')).toEqual({ variant: 'Advanced', slugSuffix: '-advanced' });
    expect(deriveAbilityVariant('Professional flight profile')).toEqual({ variant: 'Professional', slugSuffix: '-professional' });
  });

  it('returns null variant when no keyword appears in the nickname', () => {
    expect(deriveAbilityVariant('Some unrelated label')).toEqual({ variant: null, slugSuffix: '' });
    expect(deriveAbilityVariant('Cold Start Preset')).toEqual({ variant: null, slugSuffix: '' });
  });

  it('returns the first keyword when multiple keywords are present', () => {
    // Keywords are tested in declared order: Beginner, Intermediate, Expert, Advanced, Professional
    expect(deriveAbilityVariant('Beginner/Expert combo')).toEqual({ variant: 'Beginner', slugSuffix: '-beginner' });
    expect(deriveAbilityVariant('Expert and Professional')).toEqual({ variant: 'Expert', slugSuffix: '-expert' });
  });
});

describe('deriveAddonDeveloper', () => {
  it('returns null for empty / non-string sources', () => {
    expect(deriveAddonDeveloper()).toEqual({ developer: null, slugSuffix: '' });
    expect(deriveAddonDeveloper(undefined, null)).toEqual({ developer: null, slugSuffix: '' });
    expect(deriveAddonDeveloper('', '   ')).toEqual({ developer: null, slugSuffix: '' });
  });

  it('matches known developer keywords case-insensitively', () => {
    expect(deriveAddonDeveloper('FlyByWire A32NX')).toEqual({ developer: 'FlyByWire', slugSuffix: '-flybywire' });
    expect(deriveAddonDeveloper('iniBuilds A320neo')).toEqual({ developer: 'iniBuilds', slugSuffix: '-inibuilds' });
    expect(deriveAddonDeveloper('fenix block 1')).toEqual({ developer: 'Fenix', slugSuffix: '-fenix' });
    expect(deriveAddonDeveloper('PMDG 737-800')).toEqual({ developer: 'PMDG', slugSuffix: '-pmdg' });
    expect(deriveAddonDeveloper('Asobo stock')).toEqual({ developer: 'Asobo', slugSuffix: '-asobo' });
  });

  it('handles multi-word developer names', () => {
    expect(deriveAddonDeveloper('Just Flight PA-28 Arrow')).toEqual({ developer: 'Just Flight', slugSuffix: '-just-flight' });
    expect(deriveAddonDeveloper('Hype Performance Group H145')).toEqual({ developer: 'Hype Performance Group', slugSuffix: '-hype-performance-group' });
    expect(deriveAddonDeveloper('Working Title CJ4')).toEqual({ developer: 'Working Title', slugSuffix: '-working-title' });
  });

  it('falls back across multiple sources (nickname, then aircraft name)', () => {
    expect(deriveAddonDeveloper(undefined, 'Fenix A320')).toEqual({ developer: 'Fenix', slugSuffix: '-fenix' });
    expect(deriveAddonDeveloper('plain nickname', 'iniBuilds A310')).toEqual({ developer: 'iniBuilds', slugSuffix: '-inibuilds' });
  });

  it('returns null when no developer keyword is present', () => {
    expect(deriveAddonDeveloper('Boeing 737', 'Boeing 737')).toEqual({ developer: null, slugSuffix: '' });
  });
});

describe('stripVariantKeywordFromName', () => {
  it('returns the name unchanged when keyword is null', () => {
    expect(stripVariantKeywordFromName('A320neo', null)).toBe('A320neo');
  });

  it('strips a single-word developer name and trims separators', () => {
    expect(stripVariantKeywordFromName('FlyByWire A320neo', 'FlyByWire')).toBe('A320neo');
    expect(stripVariantKeywordFromName('iniBuilds A320neo', 'iniBuilds')).toBe('A320neo');
    expect(stripVariantKeywordFromName('Asobo A320neo', 'Asobo')).toBe('A320neo');
    expect(stripVariantKeywordFromName('Fenix A320', 'Fenix')).toBe('A320');
  });

  it('strips multi-word developer names with flexible whitespace', () => {
    expect(stripVariantKeywordFromName('Just Flight PA-28', 'Just Flight')).toBe('PA-28');
    expect(stripVariantKeywordFromName('Hype Performance Group H145', 'Hype Performance Group')).toBe('H145');
  });

  it('handles separators left around the stripped keyword', () => {
    expect(stripVariantKeywordFromName('A320neo - FlyByWire', 'FlyByWire')).toBe('A320neo');
    expect(stripVariantKeywordFromName('A320neo_iniBuilds', 'iniBuilds')).toBe('A320neo');
  });

  it('falls back to the original name if stripping leaves an empty string', () => {
    expect(stripVariantKeywordFromName('Asobo', 'Asobo')).toBe('Asobo');
  });

  it('different developers of the same airframe collapse to the same name', () => {
    const names = ['FlyByWire A320neo', 'iniBuilds A320neo', 'Asobo A320neo'].map((n, i) =>
      stripVariantKeywordFromName(n, ['FlyByWire', 'iniBuilds', 'Asobo'][i]),
    );
    expect(new Set(names).size).toBe(1);
    expect(names[0]).toBe('A320neo');
  });
});
