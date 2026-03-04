# da-moon-mechanics — Project Spec

## Overview

An interactive 3D visualization of the Sun-Earth-Moon system that demonstrates lunar orbital mechanics and moon phases using accurate astronomical data. Users can explore the system from multiple camera angles, scrub through time, and observe how orbital geometry produces the lunar phases we see from Earth.

**Repo:** `github.com/mattyarri/da-moon-mechanics`
**Hosting:** GitHub Pages → Cloudflare subdomain (`damoon.mattyarri.com`)

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| 3D Engine | Three.js via **React Three Fiber (R3F)** | Declarative 3D components + React's state management for the complex UI controls |
| Framework | **React 18+** | Handles play/pause, speed, date picker, toggles, dropdowns naturally as state |
| Build tool | **Vite** | Fast dev server, simple config, great R3F support |
| Astronomy data | **Astronomy Engine** (`astronomy-engine` npm) | Browser-native JS library, VSOP87-based, ±1 arcminute accuracy, calculates Sun/Moon/Earth positions, phases, eclipses |
| Styling | **Tailwind CSS** | Utility-first, fast iteration on the floating UI panels |
| Deployment | **GitHub Pages** via GitHub Actions | Static build, auto-deploys on push to main |
| DNS | **Cloudflare** | CNAME subdomain pointing to GitHub Pages |

### Why React Three Fiber over alternatives

- **Vanilla Three.js** — imperative code ("create sphere, set position, call render"). Gets messy with complex state like play/pause, speed controls, date scrubbing, toggle panels. Fine for simple demos, but this project has a lot of UI alongside the 3D scene.
- **React Three Fiber (R3F)** — wraps Three.js objects as React components. You write `<mesh position={[x,y,z]}>` instead of `new THREE.Mesh()`. React manages all the UI state, and R3F bridges it to the 3D scene. The `useFrame` hook gives you access to the render loop. Most widely used Three.js framework, largest ecosystem.
- **Svelte + Threlte** — similar concept to R3F but with Svelte. Lighter runtime, but smaller community and fewer examples. Good choice for simpler projects.

---

## Core Features

### 1. Accurate 3D Solar System (Sun-Earth-Moon)

**Bodies rendered:**
- **Sun** — Emissive sphere at origin, point light source for scene illumination and shadow casting
- **Earth** — Textured sphere (NASA Blue Marble or equivalent), rotating on its axis with 23.4° axial tilt
- **Moon** — Textured sphere (NASA CGI Moon Kit / Clementine data), tidally locked to Earth

**Positional accuracy:**
- All positions computed via Astronomy Engine's `GeoVector()` and `HelioVector()` functions
- Positions update each animation frame based on the current simulation datetime
- Coordinate system: ecliptic plane as the reference XZ plane, Y-axis pointing to ecliptic north

### 2. Orbital Mechanics Overlays

**Moon's orbital plane:**
- Semi-transparent disc/ring showing the Moon's orbital plane
- Inclined ~5.14° to the ecliptic (computed from actual data, not hardcoded)
- Sized and positioned so the plane visually intersects Earth, showing where it falls relative to continents
- Toggleable on/off

**Earth's axial tilt:**
- Visible axis line through Earth's poles at 23.4° from ecliptic normal
- Axis line extends beyond the sphere for clarity
- Toggleable on/off

**Ecliptic plane:**
- Optional faint grid or disc showing the Sun-Earth orbital plane as reference
- Toggleable on/off

### 3. Visual Features

**Textures:**
- NASA high-resolution texture maps for Earth, Moon, and Sun
- Target resolution: 4K (4096x2048) for Earth and Moon, 2K for Sun (~5-10MB per texture)
- Earth: diffuse map + (stretch: bump map, specular map, cloud layer, night lights)
- Moon: diffuse map + displacement map for surface detail
- Sun: emissive texture
- Textures stored in `public/textures/` — Cloudflare edge-caches these automatically, no separate CDN needed
- Stretch: progressive loading (show 1K immediately, swap to 4K when loaded)

**Starfield / Skybox:**
- Background star field for spatial context (cube map or particle system)

**Shadow casting:**
- Directional light from Sun casts Earth's shadow onto the Moon
- Critical for visualizing lunar eclipses when scrubbing to eclipse events
- Three.js shadow maps enabled on the relevant light and meshes

**Orbit trail lines:**
- Faded trail showing the Moon's recent orbital path
- Computed from Astronomy Engine positions over a trailing time window
- Rendered as a Line2 or custom shader with opacity falloff

### 4. Scale Toggle

Two modes, switchable via a toggle in the UI:

**Exaggerated mode (default):**
- Body sizes enlarged for visibility
- Distances compressed so Sun, Earth, and Moon are all visible simultaneously
- Orbital mechanics and inclinations remain accurate in angle/proportion
- Sun at manageable size (not overwhelming the scene)

**Accurate scale mode:**
- True relative sizes and distances
- Requires smart camera positioning — zoom presets help navigate
- May need distance labels since the Moon becomes very small relative to Earth-Sun distance
- Sun will be off-screen at Earth-zoom levels (which is itself educational)

### 5. Time Controls

**Play / Pause:**
- Toggle button to start/stop the simulation
- When paused, the scene is static at the current datetime

**Speed control:**
- Slider or preset buttons: 1x, 10x, 100x, 1000x real-time
- 1x ≈ imperceptible motion (good for examining a frozen moment)
- 100x ≈ ~1 lunar cycle per ~7 hours
- 1000x ≈ ~1 lunar cycle per ~43 minutes
- Consider also offering "1 day/sec" and "1 month/sec" as intuitive speed labels

**Date scrubber:**
- Calendar date picker to jump to any date
- Scrubbing updates the 3D scene in real-time
- Displays current simulation date/time prominently

**Notable events dropdown:**
- Pre-computed list of upcoming notable events using Astronomy Engine:
  - Solar eclipses
  - Lunar eclipses
  - Solstices and equinoxes
  - Supermoons (perigee full moons)
- Clicking an event jumps the simulation to that date
- Events computed on load for ±2 years from current date

### 6. Camera System

**Free orbit camera (always available):**
- Click-and-drag to rotate around the scene
- Scroll to zoom in/out
- R3F's `OrbitControls` with damping enabled
- Configurable min/max zoom distance

**Camera presets (buttons in the UI):**

| Preset | Description |
|--------|-------------|
| **Ecliptic top-down** | Camera positioned above the ecliptic plane, looking down. Shows orbital paths, inclination of Moon's plane, and full system geometry. Good default view. |
| **Earth surface** | Camera positioned on Earth's surface (mid-northern latitudes), looking up at the sky. Shows what the Moon phase actually looks like from a human perspective. Rotates with Earth. Most intuitive for understanding phases. |

Smooth animated transitions between presets (camera lerp over ~1 second).

### 7. Data Readouts (HUD)

Floating overlay panel, minimal by default, expandable on click:

**Always visible (compact):**
- Current simulation date and time (UTC)
- Moon phase name (e.g. "Waxing Gibbous") + illumination percentage

**Expanded panel:**
- Distance: Earth–Moon (km)
- Orbital inclination angle readout (Moon's plane vs ecliptic)
- Next upcoming eclipse (type + date)
- Earth's current season (Northern Hemisphere)

---

## Architecture

```
da-moon-mechanics/
├── public/
│   └── textures/           # NASA texture maps (Earth, Moon, Sun, starfield)
├── src/
│   ├── main.jsx            # Entry point
│   ├── App.jsx             # Top-level layout: Canvas + UI overlay
│   ├── components/
│   │   ├── scene/
│   │   │   ├── SolarSystem.jsx    # Parent: positions Sun, Earth, Moon
│   │   │   ├── Sun.jsx            # Emissive sphere + point light
│   │   │   ├── Earth.jsx          # Textured sphere, axial tilt, rotation
│   │   │   ├── Moon.jsx           # Textured sphere, tidal lock
│   │   │   ├── OrbitalPlane.jsx   # Translucent disc for Moon's orbit
│   │   │   ├── EclipticPlane.jsx  # Reference plane overlay
│   │   │   ├── AxisLine.jsx       # Earth's tilted axis visualization
│   │   │   ├── OrbitTrail.jsx     # Moon's faded path trail
│   │   │   └── Starfield.jsx      # Background stars
│   │   ├── camera/
│   │   │   ├── CameraController.jsx  # OrbitControls + preset transitions
│   │   │   └── EarthSurfaceCamera.jsx # Special camera for surface view
│   │   └── ui/
│   │       ├── ControlPanel.jsx      # Floating expandable panel
│   │       ├── TimeControls.jsx      # Play/pause, speed, date picker
│   │       ├── NotableEvents.jsx     # Dropdown of eclipses, solstices, etc.
│   │       ├── ViewToggles.jsx       # Scale mode, overlay toggles
│   │       ├── CameraPresets.jsx     # Preset view buttons
│   │       └── DataReadouts.jsx      # Phase, distance, inclination, etc.
│   ├── hooks/
│   │   ├── useSimulationTime.js   # Manages sim datetime, play/pause, speed
│   │   ├── useAstronomy.js        # Wraps Astronomy Engine calculations
│   │   └── useNotableEvents.js    # Pre-computes events on mount
│   ├── utils/
│   │   ├── astronomy.js           # Astronomy Engine helpers, coordinate transforms
│   │   ├── scales.js              # Exaggerated vs accurate scale constants
│   │   └── textures.js            # Texture loader config
│   └── constants.js               # Physical constants, default settings
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## Key Technical Decisions

### Astronomy Engine Integration

```javascript
// Pseudocode for position calculation each frame
import { Body, HelioVector, GeoVector, MoonPhase, Illumination } from 'astronomy-engine';

function getPositions(date) {
  // Earth position relative to Sun (heliocentric)
  const earthHelio = HelioVector(Body.Earth, date);
  
  // Moon position relative to Earth (geocentric)
  const moonGeo = GeoVector(Body.Moon, date);
  
  // Moon phase angle and illumination
  const phase = MoonPhase(date);          // 0-360°
  const illum = Illumination(Body.Moon, date);
  
  return { earthHelio, moonGeo, phase, illum };
}
```

Astronomy Engine returns positions in equatorial coordinates (J2000). We'll need to rotate into ecliptic coordinates for the visualization, since the ecliptic plane is our reference XZ plane. Astronomy Engine provides `Ecliptic()` and rotation functions for this.

### Scale System

```javascript
// Exaggerated mode (default)
const EXAGGERATED = {
  sunRadius: 20,
  earthRadius: 5,
  moonRadius: 1.4,
  earthOrbitRadius: 200,    // Sun-Earth distance
  moonOrbitRadius: 30,      // Earth-Moon distance
};

// Accurate mode — true ratios
// Sun radius: 696,340 km, Earth: 6,371 km, Moon: 1,737 km
// Sun-Earth: 149,600,000 km, Earth-Moon: 384,400 km
const ACCURATE = {
  // Normalized to Earth radius = 1
  sunRadius: 109.2,
  earthRadius: 1,
  moonRadius: 0.273,
  earthOrbitRadius: 23481,
  moonOrbitRadius: 60.3,
};
```

### Shadow Mapping for Eclipses

Three.js shadow maps with a directional light from the Sun. Key settings:
- `light.castShadow = true`
- Earth and Moon both cast and receive shadows
- Shadow map resolution high enough to show umbra/penumbra at Moon scale
- May need a custom shadow camera frustum to handle the large scene distances

### Notable Events Pre-computation

On app mount, use Astronomy Engine to search for events in a ±2 year window:

```javascript
import { SearchLunarEclipse, SearchMoonPhase, Seasons } from 'astronomy-engine';

// Find next lunar eclipse
let eclipse = SearchLunarEclipse(new Date());

// Find next full moon
let fullMoon = SearchMoonPhase(180, new Date(), 30); // 180° = full

// Get solstices/equinoxes for current year
let seasons = Seasons(2026);
```

---

## Deployment

### GitHub Pages

1. Vite builds to `dist/`
2. GitHub Actions workflow on push to `main`:
   - `npm ci && npm run build`
   - Deploy `dist/` to `gh-pages` branch
3. Enable GitHub Pages from `gh-pages` branch in repo settings

### Cloudflare Subdomain

1. In Cloudflare DNS for `mattyarri.com`:
   - Add CNAME record: `damoon` → `mattyarri.github.io`
2. In repo, create `public/CNAME` file containing `damoon.mattyarri.com`
3. In GitHub Pages settings, set custom domain to `damoon.mattyarri.com`
4. Cloudflare SSL: set to "Full" mode (GitHub Pages provides its own cert)

---

## Build Approach

This project will be built iteratively with Claude Code, shipping v1 with all features. Suggested build order to maintain a working app at each step:

1. **Scaffold** — Vite + React + R3F + Tailwind. Empty canvas with OrbitControls. Confirm it runs.
2. **Sun + Earth** — Place textured spheres, add point light on Sun, Earth rotation + axial tilt. Confirm shadows work.
3. **Moon + Astronomy Engine** — Integrate Astronomy Engine. Position Moon accurately for current date. Verify against known phase.
4. **Time system** — Implement `useSimulationTime` hook. Play/pause, speed control. Bodies animate.
5. **Moon phase + data readouts** — Calculate and display phase name, illumination %, data panel.
6. **Orbital overlays** — Moon orbital plane disc, Earth axis line, ecliptic plane. Toggle controls.
7. **Orbit trail** — Faded trail line behind the Moon.
8. **Scale toggle** — Implement exaggerated vs. accurate modes with smooth transition.
9. **Camera presets** — Ecliptic top-down + Earth surface view. Animated transitions.
10. **Date picker + notable events** — Calendar scrubber, event pre-computation, dropdown.
11. **Visual polish** — Starfield, texture upgrades, shadow tuning, UI polish.
12. **Deploy** — GitHub Actions workflow, Cloudflare DNS setup.

---

## Stretch Goals (Post-v1)

- Mobile/touch support (pinch-to-zoom, touch orbit)
- Earth cloud layer animation
- Night-side city lights on Earth
- Lunar libration visualization
- "What's happening now" mode — synced to real current time
- Shareable URLs with encoded date + camera position
- Educational annotations / guided tour mode
- Additional bodies (inner planets, ISS)

---

## Resources

- **Astronomy Engine:** https://github.com/cosinekitty/astronomy
- **NASA CGI Moon Kit:** https://svs.gsfc.nasa.gov/cgi-bin/search.cgi?value=CGIMoonKit
- **NASA Blue Marble textures:** https://visibleearth.nasa.gov/collection/1484/blue-marble
- **Solar textures:** https://www.solarsystemscope.com/textures/
- **Three.js docs:** https://threejs.org/docs/
- **React Three Fiber docs:** https://r3f.docs.pmnd.rs/
- **Earth Space Lab (reference):** https://www.earthspacelab.com/app/moon-phases/
- **UNL Lunar Phase Simulator (reference):** https://ccnmtl.github.io/astro-simulations/lunar-phase-simulator/
