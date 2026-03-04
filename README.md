# da moon mechanics

An interactive 3D visualization of the Sun-Earth-Moon system demonstrating lunar orbital mechanics and moon phases using accurate astronomical data.

**[Live demo](https://mattyarri.github.io/da-moon-mechanics/)**

## What it does

Explore the orbital mechanics behind lunar phases, eclipses, and the seasons. Every position is computed from real astronomical data — what you see matches the actual sky for any date.

- Scrub through time from real-time to one month per second
- Toggle overlays: Moon's tilted orbital plane, ecliptic plane, Earth's axis, orbit trail
- Switch between exaggerated and true-to-scale distances
- Jump to notable events: eclipses, solstices, equinoxes, supermoons
- View from free orbit, ecliptic top-down, or Earth's surface at 40°N

## Tech stack

- **React Three Fiber** — declarative 3D via React
- **Astronomy Engine** — VSOP87/ELP ephemeris models for positions, phases, and eclipses
- **Vite** + **Tailwind CSS** — build tooling and UI styling
- **GitHub Pages** — static deployment via GitHub Actions

## Running locally

```bash
npm install
npm run dev
```

## Sources

- [Astronomy Engine](https://github.com/cosinekitty/astronomy) — orbital calculations (±1 arcminute accuracy)
- [Solar System Scope](https://www.solarsystemscope.com/textures/) — texture maps derived from NASA imagery
