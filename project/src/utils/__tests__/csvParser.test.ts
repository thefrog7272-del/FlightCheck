import { describe, it, expect } from 'vitest';
import { parsePlaneCsv } from '../csvParser';

describe('csvParser', () => {
  const sampleCsv = `name,manufacturer,type,image,phase,item,expectedState
"Cirrus SR22","Cirrus Aircraft","GA","https://images.unsplash.com/photo-1583483259885-b77d6ba2f0b9?w=1200","Pre-Flight","Pitot Cover","REMOVED"
"Cirrus SR22","Cirrus Aircraft","GA","https://images.unsplash.com/photo-1583483259885-b77d6ba2f0b9?w=1200","Pre-Flight","Master Switch","ON"
"Cirrus SR22","Cirrus Aircraft","GA","https://images.unsplash.com/photo-1583483259885-b77d6ba2f0b9?w=1200","Before Takeoff","Caps Safety Pin","REMOVED"
"Cirrus SR22","Cirrus Aircraft","GA","https://images.unsplash.com/photo-1583483259885-b77d6ba2f0b9?w=1200","Before Takeoff","Flaps","50%"`;

  it('correctly parses all text fields and groups phases', () => {
    const { plane, checklist } = parsePlaneCsv(sampleCsv);

    // Verify Plane Details
    expect(plane.name).toBe('Cirrus SR22');
    expect(plane.manufacturer).toBe('Cirrus Aircraft');
    expect(plane.type).toBe('GA');
    expect(plane.image).toBe('https://images.unsplash.com/photo-1583483259885-b77d6ba2f0b9?w=1200');

    // Verify Checklist Structure
    expect(checklist.phases.length).toBe(2);
    
    const preFlight = checklist.phases.find(p => p.title === 'Pre-Flight');
    expect(preFlight).toBeDefined();
    expect(preFlight?.items.length).toBe(2);
    expect(preFlight?.items[0].label).toBe('Pitot Cover');
    expect(preFlight?.items[0].expectedState).toBe('REMOVED');
    expect(preFlight?.items[1].label).toBe('Master Switch');
    expect(preFlight?.items[1].expectedState).toBe('ON');

    const beforeTakeoff = checklist.phases.find(p => p.title === 'Before Takeoff');
    expect(beforeTakeoff).toBeDefined();
    expect(beforeTakeoff?.items.length).toBe(2);
    expect(beforeTakeoff?.items[1].label).toBe('Flaps');
    expect(beforeTakeoff?.items[1].expectedState).toBe('50%');
  });

  it('handles quoted values with commas correctly', () => {
    const complexCsv = `name,manufacturer,type,image,phase,item,expectedState
"Mooney M20","Mooney","GA","","Landing","Flaps","FULL, DOWN"`;
    const { checklist } = parsePlaneCsv(complexCsv);
    expect(checklist.phases[0].items[0].expectedState).toBe('FULL, DOWN');
  });
});
