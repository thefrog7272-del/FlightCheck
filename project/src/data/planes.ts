import type { Plane } from './types';

export const planes: Plane[] = [
  {
    id: 'c172',
    name: 'Cessna 172 Skyhawk',
    manufacturer: 'Cessna',
    image: '/planes/c172.jpg',
    type: 'GA'
  },
  {
    id: 'c208',
    name: 'Cessna 208 Caravan',
    manufacturer: 'Cessna',
    image: '/planes/c208.jpg',
    type: 'Utility Turboprop'
  },
  {
    id: 'b737',
    name: 'Boeing 737-800',
    manufacturer: 'Boeing',
    image: '/planes/b737.jpg',
    type: 'Airliner'
  },
  {
    id: 'a320',
    name: 'Airbus A320neo',
    manufacturer: 'Airbus',
    image: '/planes/a320.jpg',
    type: 'Airliner'
  }
];
