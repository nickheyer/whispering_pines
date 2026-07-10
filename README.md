# Whispering Pines

A cozy-with-a-dark-secret farming/adventure game in the browser. Farm, fish, build, befriend (or romance) the townsfolk, descend the grotto, and unravel what's actually going on in Whispering Pines — across multiple story cycles.

Rendered in 3D with [three.js](https://threejs.org/) on a single canvas, with a React HUD on top. No backend — saves live in `localStorage` (3 slots).

## Run It

```bash
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

Other scripts:

```bash
npm run build     # production build to dist/
npm run preview   # serve the production build locally
npm run lint      # eslint
```

## Controls

- **WASD / arrows** — move
- **E** — interact / place buildings
- **Space** — use tool / attack
- **T** — pet / companion
- **B** — build menu · **M** — map · **J** — journal
- **1–0** — select tool
- Touch controls appear automatically on mobile.

## Project Layout

```
src/
├── main.jsx              # entry point
├── App.jsx               # app root, renders the game page
├── index.css             # tailwind + theme variables
├── pages/
│   └── GamePage.jsx      # canvas + all HUD/overlay wiring
├── game/                 # the engine — plain JS, no React
│   ├── engine.js         # main Game class: loop, input, state
│   ├── renderer3d.js     # three.js scene/render pipeline
│   ├── constants.js      # items, tools, shops, buildables
│   ├── maps.js           # zone/tile definitions
│   ├── saveManager.js    # localStorage save slots
│   ├── story.js          # story beats, cycles, endings
│   └── ...               # enemies, fishing, romance, weather, etc.
├── components/
│   ├── game/             # HUD panels & overlays (shop, journal, ...)
│   └── ui/button.jsx     # shadcn button (the only ui primitive used)
└── lib/utils.js          # cn() classname helper
```

The split to know: `src/game/` is a self-contained engine that talks to React through a single state-callback (`onState` in `GamePage.jsx`), and `src/components/game/` are the presentational panels the HUD opens. If you're adding gameplay, start in `src/game/engine.js`; if you're adding UI, start in `GamePage.jsx`.

## Stack

React 18 · Vite · three.js · Tailwind CSS · framer-motion · lucide-react
