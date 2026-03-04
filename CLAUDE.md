# da-moon-mechanics

Interactive 3D Sun-Earth-Moon orbital mechanics visualization with accurate astronomical data.

## Full Specification

See `PROJECT_SPEC.md` for the complete project spec including architecture, technical decisions, and feature details.

## Tech Stack

- **React 18+** with **React Three Fiber (R3F)** for 3D scene
- **Vite** for build tooling
- **Tailwind CSS** for UI styling
- **astronomy-engine** (npm) for all positional/phase/eclipse calculations
- **Three.js** (via R3F) for rendering

## Commands

- `npm run dev` — Start dev server (verify after every build step)
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build locally

## Project Structure

```
src/
├── main.jsx                    # Entry point
├── App.jsx                     # Canvas + UI overlay layout
├── components/
│   ├── scene/                  # 3D objects (Sun, Earth, Moon, overlays)
│   ├── camera/                 # Camera controls + presets
│   └── ui/                     # Floating panels, time controls, readouts
├── hooks/                      # useSimulationTime, useAstronomy, useNotableEvents
├── utils/                      # Coordinate transforms, scale constants, texture loading
└── constants.js                # Physical constants, defaults
public/
├── textures/                   # NASA texture maps (4K Earth/Moon, 2K Sun)
└── CNAME                       # Contains: damoon.mattyarri.com
```

## Build Order

Follow these steps sequentially. After each step: verify with `npm run dev`, then `git commit`.

- [x] Step 0: Initialize repo, install dependencies, create this file
- [x] Step 1: **Scaffold** — Vite + React + R3F + Tailwind. Empty canvas with OrbitControls. Confirm it runs.
- [x] Step 2: **Sun + Earth** — Textured spheres, point light on Sun, Earth rotation + 23.4° axial tilt. Confirm shadows work.
- [x] Step 3: **Moon + Astronomy Engine** — Integrate astronomy-engine. Position Moon accurately for current date. Verify against known phase.
- [x] Step 4: **Time system** — `useSimulationTime` hook. Play/pause, speed control. Bodies animate correctly.
- [x] Step 5: **Moon phase + data readouts** — Phase name, illumination %, floating HUD panel (minimal, expandable).
- [x] Step 6: **Orbital overlays** — Moon orbital plane (semi-transparent disc), Earth axis line, ecliptic plane. Toggle controls.
- [x] Step 7: **Orbit trail** — Faded trail line behind the Moon showing recent path.
- [x] Step 8: **Scale toggle** — Exaggerated (default) vs. accurate scale modes with smooth transition.
- [x] Step 9: **Camera presets** — Ecliptic top-down view + Earth surface view. Animated transitions between presets.
- [x] Step 10: **Date picker + notable events** — Calendar date scrubber, pre-computed events dropdown (eclipses, solstices, equinoxes, supermoons ±2 years).
- [ ] Step 11: **Visual polish** — Starfield/skybox, texture quality, shadow tuning, UI polish.
- [ ] Step 12: **Deploy** — GitHub Actions workflow for GitHub Pages, `public/CNAME` file for `damoon.mattyarri.com`.

**Currently on: Step 11**

Update the checkbox and "Currently on" line after completing each step.

## Code Conventions

- Use JSX (not TSX) — this is a JavaScript project
- React functional components with hooks only
- Use `useFrame` from R3F for per-frame animation logic
- All astronomical calculations go through `astronomy-engine` — never hardcode orbital positions
- Coordinate system: ecliptic plane = XZ plane, Y-axis = ecliptic north
- Astronomy Engine returns equatorial coordinates (J2000) — always convert to ecliptic for the scene
- Keep UI components (src/components/ui/) separate from 3D scene components (src/components/scene/)
- Tailwind for all UI styling — no separate CSS files for UI components

## Key Dependencies

```json
{
  "@react-three/fiber": "^8",
  "@react-three/drei": "^9",
  "three": "^0.160",
  "astronomy-engine": "^2",
  "react": "^18",
  "react-dom": "^18"
}
```

## Deployment

- GitHub Pages from `gh-pages` branch
- GitHub Actions: on push to main → `npm ci && npm run build` → deploy `dist/`
- `public/CNAME` must contain `damoon.mattyarri.com` (Vite copies this to `dist/`)
- Cloudflare DNS: CNAME `damoon` → `mattyarri.github.io`

## Important Notes

- Textures are large (4K = ~5-10MB each). Store in `public/textures/`, do NOT commit low-quality placeholders as permanent — use the real NASA textures from the start.
- Shadow mapping for eclipses needs a custom shadow camera frustum due to the large scene scale differences between exaggerated and accurate modes.
- The Moon's orbital inclination (~5.14°) should be computed from Astronomy Engine data, not hardcoded, since the nodes precess over an 18.6-year cycle.
- Earth surface camera view: position camera on Earth's surface at ~40°N latitude, looking toward the Moon. Camera must rotate with Earth.
