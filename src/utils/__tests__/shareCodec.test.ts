import { describe, it, expect } from 'vitest';
import { encodeChecklist, decodeChecklist } from '../shareCodec';

describe('shareCodec', () => {
  const testData = {
    plane: { id: 'test', name: 'Test Plane', manufacturer: 'Test', image: '', type: 'GA' },
    checklist: {
      planeId: 'test',
      phases: [
        {
          id: 'phase1',
          title: 'Phase 1',
          items: [{ id: 'item1', label: 'Item 1', expectedState: 'ON' }],
        },
      ],
    },
  };

  it('encodes and decodes round-trip', async () => {
    const encoded = await encodeChecklist(testData);
    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(0);

    const decoded = await decodeChecklist(encoded);
    expect(decoded).toEqual(testData);
  });

  it('encoded string starts with gz: or b64:', async () => {
    const encoded = await encodeChecklist(testData);
    expect(encoded.startsWith('gz:') || encoded.startsWith('b64:')).toBe(true);
  });

  it('throws on invalid input', async () => {
    await expect(decodeChecklist('invalid')).rejects.toThrow();
  });
});
