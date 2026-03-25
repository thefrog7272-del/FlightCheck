# FlightCheck

An interactive flight simulator checklist web app, built with React, TypeScript, and Vite. Designed to be used alongside MSFS, X-Plane, or any flight sim as a digital Electronic Flight Bag (EFB).

## Features

- **10 Built-in Aircraft** — Cessna 172, Cessna 208 Caravan, Boeing 737-800, Boeing 747-400, Airbus A320neo, Airbus A330-300, Bombardier CRJ-700, Beechcraft King Air 350, Cirrus SR22, Diamond DA62
- **Interactive Checklists** — Toggle items as you complete them, organized by flight phase
- **Overall & Per-Phase Progress** — Visual progress bars at both levels
- **Collapsible Phases** — Click phase headers to expand/collapse
- **Edit Mode** — Insert, delete, and reorder checklist items and phases inline
- **CSV Import/Export** — Add custom planes via CSV, download any checklist as CSV
- **Image Upload** — Attach aircraft images when importing
- **Search, Sort & Filter** — Find planes by name/manufacturer, sort by various criteria, filter by aircraft type
- **Delete & Restore** — Remove any plane (including defaults), restore with factory reset
- **Keyboard Shortcuts** — Ctrl+E (edit), Ctrl+S (download), Ctrl+P (print), Esc (close)
- **Print View** — Clean print-optimized layout for paper checklists
- **PWA Support** — Install as a standalone app, works offline
- **Dark Mode** — Optimized for low-light simulator environments
- **Responsive Design** — Works on desktop, tablet, and phone (EFB style)
- **Persistent State** — All progress and customizations saved to localStorage

## Getting Started

### With Docker (recommended)

```bash
docker rm -f flightcheck
docker build -t flightcheck .
docker run -d --name flightcheck -p 5173:5173 flightcheck
```

> The first command removes any previous container. You can ignore the error if no container exists yet.

Open [http://localhost:5173](http://localhost:5173) in your browser.

To stop and clean up:

```bash
docker stop flightcheck && docker rm flightcheck
```

### Without Docker

Requires [Node.js](https://nodejs.org) (v20+).

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Adding New Planes

**Via the app:** Click "Add Plane" on the home page and paste CSV data in this format:

```csv
name,manufacturer,type,image,phase,item,expectedState
"Piper Archer II","Piper","GA","","Pre-Flight","Master Switch","ON"
"Piper Archer II","Piper","GA","","Pre-Flight","Fuel Pump","ON"
```

**Via source code:** Add entries to `src/data/planes.ts` and `src/data/checklists.ts`.

## Tech Stack

- React 19 + TypeScript
- Vite 8
- React Router DOM
- Lucide React (Icons)
- CSS Modules
- Vite PWA Plugin

## Testing

```bash
npm run test
```
