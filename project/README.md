# Interactive Plane Checklist

A responsive web application for flight simulator checklists, built with React, TypeScript, and Vite.

## Features

- **Interactive Checklists:** Toggle items as you complete them.
- **Flight Phases:** Organized by phase (Pre-Start, Taxi, Takeoff, etc.).
- **Progress Tracking:** Visual progress bars for each phase.
- **Dark Mode:** Optimized for low-light simulator environments.
- **Responsive Design:** Works on tablets and phones (EFB style).

## Getting Started

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Start the development server:
    ```bash
    npm run dev
    ```

3.  Open [http://localhost:5173](http://localhost:5173) in your browser.

## Adding New Planes

1.  Add plane metadata to `src/data/planes.ts`.
2.  Add checklist data to `src/data/checklists.ts`.
    - Ensure the `planeId` matches the `id` in `planes.ts`.

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router DOM
- Lucide React (Icons)
- CSS Modules

## Testing

Run tests with:
```bash
npm run test
```
(Requires `vitest` setup)
