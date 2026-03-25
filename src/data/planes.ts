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
  },
  {
    id: 'b747',
    name: 'Boeing 747-400',
    manufacturer: 'Boeing',
    image: '/planes/b747.svg',
    type: 'Airliner'
  },
  {
    id: 'crj7',
    name: 'Bombardier CRJ-700',
    manufacturer: 'Bombardier',
    image: '/planes/crj7.svg',
    type: 'Regional Jet'
  },
  {
    id: 'b350',
    name: 'Beechcraft King Air 350',
    manufacturer: 'Beechcraft',
    image: '/planes/b350.svg',
    type: 'Turboprop'
  },
  {
    id: 'sr22',
    name: 'Cirrus SR22',
    manufacturer: 'Cirrus',
    image: '/planes/sr22.svg',
    type: 'GA'
  },
  {
    id: 'da62',
    name: 'Diamond DA62',
    manufacturer: 'Diamond',
    image: '/planes/da62.svg',
    type: 'GA Twin'
  },
  {
    id: 'a330',
    name: 'Airbus A330-300',
    manufacturer: 'Airbus',
    image: '/planes/a330.svg',
    type: 'Widebody'
  }
];
