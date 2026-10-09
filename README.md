# Interactive 3D Building — Lumen Residencias

A frontend demo for the **LABS** section of [thelucho.dev](https://www.thelucho.dev).

This project is part of a series of small, self-contained experiments I build to explore interaction, motion, and visual techniques before taking them into client or product work. Each demo isolates one idea. Here, that idea is an **explorable 3D building** for a real estate launch.

---

## What this demo explores

The Hero is a **3D building you can browse unit by unit**.

The building is generated entirely in code from a single data file (`src/data/building.ts`): a ground-floor lobby, eight residential floors, and a rooftop amenity level with a pool. Floors 2 to 7 split into two units (A with balcony, B without); floors 1 and 8 are full-floor units. Nothing about the units is hardcoded in the scene or the UI.

Drag to rotate the building. Hovering a unit "turns its lights on" — a warm emissive interior plus a single point light that moves to whichever unit is active. Clicking opens a side panel (a bottom sheet on mobile) with the unit's floor plan, areas, rooms, and price, plus an inquiry form that stays local to the demo. A vertical floor selector mirrors the 3D view and works as the accessible, keyboard-friendly way in.

The scene keeps cost low: shared geometries and materials, instanced meshes, cached shadows, and a capped device pixel ratio. Auto-rotation and transitions respect `prefers-reduced-motion`.

The rest of the page is a fictional development (Lumen Residencias, Los Aromos 1240) that gives the building a real layout to live in. Everything is static — no backend, no API routes, no external services.

---

## Stack

| Piece | Role |
| --- | --- |
| [Next.js](https://nextjs.org) | App Router, TypeScript, and the build |
| [three.js](https://threejs.org) | 3D rendering |
| [React Three Fiber](https://r3f.docs.pmnd.rs) + [drei](https://drei.docs.pmnd.rs) | Scene, controls, shadows, and clouds |
| [Zustand](https://zustand.docs.pmnd.rs) | UI state shared between the canvas and the interface |
| [Tailwind CSS](https://tailwindcss.com) | Styling |
| [Lenis](https://lenis.darkroom.engineering) | Smooth scrolling |
| [Phosphor Icons](https://phosphoricons.com) | Icons |
| Instrument Serif + Manrope | Type, loaded via `next/font/google` |
| [Vitest](https://vitest.dev) | Tests for building data and layout |

---

## Run it locally

Node `>= 20.9` is required.

```sh
npm install
npm run dev
```

The site starts at `http://localhost:3000`.

| Command | What it does |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build locally |
| `npm run lint` | Lint with ESLint |
| `npm test` | Run the Vitest suite |

---

## More from LABS

This is one demo in an ongoing series. The rest live on [thelucho.dev](https://www.thelucho.dev).
