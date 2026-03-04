# How da moon mechanics works

A technical deep-dive into how this project turns astronomical math into an interactive 3D experience. Reading this should give you a working understanding of 3D web graphics, coordinate astronomy, and the React patterns that tie them together.

---

## Table of contents

1. [The big picture](#the-big-picture)
2. [How positions are computed](#how-positions-are-computed)
3. [The coordinate pipeline](#the-coordinate-pipeline)
4. [The scale problem](#the-scale-problem)
5. [How the 3D scene works](#how-the-3d-scene-works)
6. [The time simulation](#the-time-simulation)
7. [The camera system](#the-camera-system)
8. [Earth's rotation and axial tilt](#earths-rotation-and-axial-tilt)
9. [Moon tidal locking](#moon-tidal-locking)
10. [Orbital overlays and how planes work in 3D](#orbital-overlays-and-how-planes-work-in-3d)
11. [Finding eclipses and notable events](#finding-eclipses-and-notable-events)
12. [Architecture and data flow](#architecture-and-data-flow)
13. [Performance patterns](#performance-patterns)
14. [Deployment pipeline](#deployment-pipeline)
15. [Key lessons](#key-lessons)

---

## The big picture

This app does one core thing every frame:

1. Take the current simulation date/time
2. Ask an astronomy library "where is Earth? where is the Moon?" for that moment
3. Convert those positions into 3D coordinates
4. Render them with Three.js

Everything else — time controls, camera presets, overlays, phase readouts — is built on top of that loop.

The entire project is ~1,050 lines of source code across 20 files. There are no backend servers, no databases, no API calls. The astronomy library runs entirely in the browser using the same mathematical models (VSOP87 for planets, ELP/MPP02 for the Moon) used by professional astronomers. Accuracy: ±1 arcminute.

---

## How positions are computed

The `astronomy-engine` npm package is the single source of truth for all positions. We never hardcode orbital values.

```javascript
// src/utils/astronomy.js

import { Body, HelioVector, GeoVector, MakeTime } from 'astronomy-engine';

const astroTime = MakeTime(date);  // Convert JS Date → astronomy-engine time

// Where is Earth relative to the Sun? (heliocentric)
const earthEq = HelioVector(Body.Earth, astroTime);
// Returns: { x, y, z } in AU (astronomical units), equatorial J2000 frame

// Where is the Moon relative to Earth? (geocentric)
const moonEq = GeoVector(Body.Moon, astroTime, true);
// The `true` enables aberration correction (accounts for light travel time)
```

**What these functions actually compute:** VSOP87 is a set of trigonometric series with thousands of terms that model planetary positions. When you call `HelioVector(Body.Earth, time)`, it evaluates these series for the given time and returns Earth's position in 3D space. The precision comes from the sheer number of terms — each one represents a gravitational perturbation from another planet or effect.

---

## The coordinate pipeline

This is the trickiest part of the whole project. Astronomy Engine returns positions in **equatorial J2000 coordinates** — a reference frame aligned with Earth's equator as of January 1, 2000. But our scene uses the **ecliptic plane** (Earth's orbital plane around the Sun) as the ground plane.

The conversion is a single rotation around the X-axis by the obliquity of the ecliptic (23.44°):

```javascript
// The angle between Earth's equator and its orbital plane
const OBLIQUITY = 23.4392911 * (Math.PI / 180);
const COS_OBL = Math.cos(OBLIQUITY);
const SIN_OBL = Math.sin(OBLIQUITY);

// Equatorial → Ecliptic: rotate around X-axis
function equatorialToEcliptic(vec) {
  return {
    x: vec.x,                                    // X unchanged
    y: vec.y * COS_OBL + vec.z * SIN_OBL,       // Y and Z rotate
    z: -vec.y * SIN_OBL + vec.z * COS_OBL,
  };
}
```

Then we map ecliptic coordinates into our scene's coordinate system. Three.js uses Y-up by convention, and we want the ecliptic plane in XZ:

```javascript
// Ecliptic → Scene: remap axes
// ecliptic X → scene X
// ecliptic Y → scene -Z  (into the screen)
// ecliptic Z → scene Y   (up)
function eclipticToScene(ecl) {
  return [ecl.x, ecl.z, -ecl.y];
}
```

**Why this matters:** If you skip the equatorial→ecliptic conversion, the Moon's orbital plane appears tilted wrong, Earth's axial tilt points the wrong direction, and the seasons don't line up with the Sun. The coordinate transform is the foundation that makes everything else accurate.

The full pipeline for every frame:

```
Astronomy Engine (equatorial J2000, AU)
    → equatorialToEcliptic()
    → eclipticToScene()
    → scalePosition()
    → [x, y, z] scene coordinates
```

---

## The scale problem

Space is mostly empty. Real proportions:

| Measurement | Value | Problem |
|---|---|---|
| Sun radius | 109× Earth's radius | Sun would fill the screen |
| Earth-Sun distance | 23,481× Earth's radius | Earth would be invisible |
| Moon's radius | 0.27× Earth's radius | Moon is a speck |
| Earth-Moon distance | 60× Earth's radius | Moon is far from Earth |

If we render at true scale, you'd see either the Sun or the Earth, never both. The Moon would be a dot.

**Solution: two scale modes.**

```javascript
// constants.js

// Exaggerated: everything visible at once
export const EXAGGERATED_SCALE = {
  sunRadius: 20,
  earthRadius: 5,
  moonRadius: 1.4,
  earthOrbitRadius: 200,   // Sun-Earth distance compressed
  moonOrbitRadius: 30,     // Earth-Moon distance compressed
};

// Accurate: true ratios, normalized to Earth radius = 1
export const ACCURATE_SCALE = {
  sunRadius: 109.2,
  earthRadius: 1,
  moonRadius: 0.273,
  earthOrbitRadius: 23481,
  moonOrbitRadius: 60.3,
};
```

The key insight: **we scale distances and sizes separately for Earth's orbit and the Moon's orbit.** This means the Moon doesn't disappear into the Earth-Sun distance. Both modes preserve all angular relationships (orbital inclination, phase angles, axial tilt), so the physics stays correct even when sizes are wrong.

```javascript
// In astronomy.js — how scaling works:

// Scale Earth to its orbit radius
const earthDist = magnitude(earthEcl);  // actual distance in AU
const earthScaleFactor = scale.earthOrbitRadius / earthDist;
const earthPos = scalePosition(earthScene, earthScaleFactor);

// Scale Moon separately, relative to Earth
const moonDist = magnitude(moonEcl);    // actual distance in AU
const moonScaleFactor = scale.moonOrbitRadius / moonDist;
const moonRelPos = scalePosition(moonScene, moonScaleFactor);

// Moon's final position = Earth + scaled offset
const moonPos = [
  earthPos[0] + moonRelPos[0],
  earthPos[1] + moonRelPos[1],
  earthPos[2] + moonRelPos[2],
];
```

---

## How the 3D scene works

### React Three Fiber (R3F)

Instead of writing imperative Three.js:

```javascript
// Traditional Three.js — you wouldn't want to manage this with React state
const geometry = new THREE.SphereGeometry(5, 64, 64);
const material = new THREE.MeshStandardMaterial({ map: texture });
const mesh = new THREE.Mesh(geometry, material);
mesh.position.set(x, y, z);
scene.add(mesh);
```

R3F lets you write it declaratively as JSX:

```jsx
// React Three Fiber — composable, reactive, works with React state
<mesh position={[x, y, z]} castShadow receiveShadow>
  <sphereGeometry args={[5, 64, 64]} />
  <meshStandardMaterial map={texture} />
</mesh>
```

Every Three.js class has a JSX equivalent. Props map directly to Three.js properties. When React state changes (like `position`), R3F efficiently updates only the changed properties — no full scene rebuild.

### The scene tree

```jsx
// SolarSystem.jsx — the full scene in ~12 lines of JSX
<Suspense fallback={null}>
  <TimeAdvancer advance={advance} />       {/* drives the clock */}
  <Starfield />                            {/* 3000 background points */}
  <Sun scale={scale} />                    {/* emissive sphere + light */}
  <Earth position={earthPos} simTime={simTime} scale={scale} />
  <Moon position={moonPos} earthPos={earthPos} scale={scale} />
  {overlays.orbitTrail && <OrbitTrail />}   {/* conditional rendering */}
  {overlays.orbitalPlane && <OrbitalPlane />}
  {overlays.eclipticPlane && <EclipticPlane />}
  {overlays.axisLine && <AxisLine />}
</Suspense>
```

`<Suspense>` handles async texture loading — the scene doesn't render until all textures are ready.

### Lighting and shadows

```jsx
// Sun.jsx — the Sun provides all scene lighting
<pointLight
  castShadow
  intensity={5}
  decay={0}                    // No distance falloff (space has no atmosphere)
  shadow-mapSize-width={2048}  // Shadow resolution
  shadow-mapSize-height={2048}
  shadow-camera-far={scale.earthOrbitRadius * 2}
/>
```

Setting `decay={0}` is physically unrealistic but necessary — real inverse-square falloff would make Earth impossibly dim at this scale. The Sun is the only light source. An ambient light at 0.15 intensity provides subtle fill so the dark sides of Earth/Moon aren't pure black.

Earth and Moon both `castShadow` and `receiveShadow`, which is what makes lunar eclipses visible — Earth's shadow actually falls on the Moon mesh.

---

## The time simulation

Time is decoupled from real time through a speed multiplier:

```javascript
// hooks/useSimulationTime.js

const [simTime, setSimTime] = useState(() => new Date());  // starts at "now"
const [speed, setSpeed] = useState(3600);  // default: 1 hour per second

const advance = useCallback((deltaSec) => {
  if (!isPlaying) return;
  setSimTime(prev => new Date(prev.getTime() + deltaSec * speed * 1000));
  //                                            ↑ frame delta × speed multiplier
}, [isPlaying, speed]);
```

`advance` is called every frame by a tiny component inside the Canvas:

```javascript
// TimeAdvancer.jsx — the bridge between R3F's render loop and React state
import { useFrame } from '@react-three/fiber';

export default function TimeAdvancer({ advance }) {
  useFrame((state, delta) => advance(delta));
  // delta = seconds since last frame (typically ~0.016 at 60fps)
  // At speed=86400 (1 day/sec): advance = 0.016 * 86400 * 1000 = ~1,382,400 ms per frame
  return null;
}
```

The speed presets:

| Label | Speed value | What it means |
|---|---|---|
| 1x | 1 | Real time — Moon moves imperceptibly |
| 1 hr/s | 3,600 | One hour of time per second |
| 1 day/s | 86,400 | One full Earth rotation per second |
| 1 mo/s | 2,592,000 | One full lunar cycle per ~second |

---

## The camera system

The camera controller is the most complex component (~146 lines). It manages three modes:

### Free mode
Standard OrbitControls from drei — drag to rotate, scroll to zoom. Nothing special.

### Top-down mode
Camera snaps above the ecliptic plane looking down at Earth, then **tracks** Earth as it orbits:

```javascript
// CameraController.jsx — top-down tracking in useFrame
if (cameraMode === 'topDown' && controlsRef.current) {
  const height = camera.position.y - controlsRef.current.target.y;
  controlsRef.current.target.set(earthPos[0], earthPos[1], earthPos[2]);
  camera.position.set(earthPos[0], earthPos[1] + height, earthPos[2]);
}
```

Zoom still works (OrbitControls enabled but rotation/pan disabled). Clicking breaks to free mode:

```javascript
canvas.addEventListener('pointerdown', handleInteraction);
// On click: if not transitioning, switch to 'free'
```

### Earth surface mode
Camera sits on Earth's surface at 40°N latitude, rotating with the planet, looking at the Moon:

```javascript
// Compute position on Earth's surface
const gmstHours = SiderealTime(MakeTime(simTime));
const rotationY = (gmstHours / 24) * Math.PI * 2;

const r = scale.earthRadius * 1.05;  // slightly above surface
const localX = r * cosLat * Math.sin(rotationY);
const localY = r * sinLat;
const localZ = r * cosLat * Math.cos(rotationY);

// Apply Earth's axial tilt
const tiltedX = localX;
const tiltedY = localY * Math.cos(tilt) + localZ * Math.sin(tilt);
const tiltedZ = -localY * Math.sin(tilt) + localZ * Math.cos(tilt);

// Set camera position (relative to Earth center)
camera.position.set(earthPos[0] + tiltedX, earthPos[1] + tiltedY, earthPos[2] + tiltedZ);

// "Up" direction = radially outward from Earth center
camera.up.copy(new THREE.Vector3(tiltedX, tiltedY, tiltedZ).normalize());

// Look at the Moon
camera.lookAt(moonPos[0], moonPos[1], moonPos[2]);
```

**Critical detail:** OrbitControls must be completely unmounted (`return null`) in this mode. Even with `enabled={false}`, OrbitControls fights with manual camera positioning and causes jitter.

### Animated transitions
All mode switches animate over 1 second using cubic ease-out:

```javascript
function startTransition(transitionRef, camera, controlsRef, toPos, toTarget) {
  const t = transitionRef.current;
  t.active = true;
  t.start = performance.now() / 1000;
  t.duration = 1.0;
  t.fromPos = camera.position.clone();
  t.toPos = toPos;
  // ...
}

// In useFrame:
const ease = 1 - Math.pow(1 - progress, 3);  // cubic ease-out
camera.position.lerpVectors(t.fromPos, t.toPos, ease);
```

---

## Earth's rotation and axial tilt

Two separate rotations, applied in nested groups:

```jsx
// Earth.jsx
<group position={earthPos}>                    {/* 1. Place at orbital position */}
  <group rotation={[-AXIAL_TILT_RAD, 0, 0]}>  {/* 2. Tilt 23.4° around X-axis */}
    <mesh rotation={[0, rotationY, 0]}>        {/* 3. Spin around Y-axis */}
      <sphereGeometry />
    </mesh>
  </group>
</group>
```

**Why the tilt is `[-AXIAL_TILT_RAD, 0, 0]` (negative X rotation):**

In our scene, +Y is ecliptic north. Earth's north pole needs to tilt toward ecliptic longitude 270° (the direction of the June solstice). In our coordinate mapping, ecliptic longitude 270° maps to scene +Z. A negative rotation around X tilts +Y toward +Z. This means:

- At June solstice: Earth is at ecliptic longitude ~90° (scene -Z direction from Sun), so the north pole tilts **toward** the Sun. Northern hemisphere summer.
- At December solstice: Earth is at ecliptic longitude ~270° (scene +Z direction), north pole tilts **away** from Sun. Northern hemisphere winter.

**Why we use GMST for rotation:**

Earth's spin is computed using Greenwich Mean Sidereal Time, not a simple timer:

```javascript
import { SiderealTime, MakeTime } from 'astronomy-engine';

const gmstHours = SiderealTime(MakeTime(simTime));
const rotationY = (gmstHours / 24) * Math.PI * 2;
```

GMST tells you the exact angle of the Prime Meridian relative to the stars for any date. This means continents are in the correct position relative to the Sun — you'll see daylight on the correct side of Earth for any given date. An earlier version just divided Unix timestamp by sidereal day length, which gave wrong continent positions.

---

## Moon tidal locking

The Moon always shows the same face to Earth. We compute the facing direction from the Earth-Moon vector:

```javascript
// Moon.jsx
const rotation = useMemo(() => {
  const dx = earthPos[0] - position[0];
  const dy = earthPos[1] - position[1];
  const dz = earthPos[2] - position[2];

  const yaw = Math.atan2(dx, dz);                    // horizontal facing
  const dist = Math.sqrt(dx * dx + dz * dz);
  const pitch = -Math.atan2(dy, dist);                // vertical tilt

  return [pitch, yaw, 0];
}, [position, earthPos]);
```

The pitch component accounts for the Moon's ~5.14° orbital inclination — when the Moon is above or below the ecliptic, it tilts slightly to keep facing Earth.

---

## Orbital overlays and how planes work in 3D

### Moon's orbital plane

The Moon's orbit is inclined ~5.14° to the ecliptic, and this angle **precesses** over an 18.6-year cycle (the nodes drift). So we compute it dynamically:

```javascript
// astronomy.js — compute orbital plane normal via cross product

// Get Moon's direction now and 7 days from now
const moonNow = eclipticToScene(equatorialToEcliptic(GeoVector(Body.Moon, now, true)));
const moonFuture = eclipticToScene(equatorialToEcliptic(GeoVector(Body.Moon, future, true)));

// Cross product gives a vector perpendicular to both = the orbital plane normal
const normal = crossProduct(moonNow, moonFuture);
// Normalize it
const len = Math.sqrt(normal[0]**2 + normal[1]**2 + normal[2]**2);
const moonOrbitalNormal = [normal[0]/len, normal[1]/len, normal[2]/len];
```

Then we orient a ring to face that direction:

```jsx
// OrbitalPlane.jsx
const quaternion = useMemo(() => {
  const up = new THREE.Vector3(0, 0, 1);       // ring's default normal
  const normal = new THREE.Vector3(...moonOrbitalNormal);
  return new THREE.Quaternion().setFromUnitVectors(up, normal);
}, [moonOrbitalNormal]);

<mesh position={earthPos} quaternion={quaternion}>
  <ringGeometry args={[innerRadius, outerRadius, 128]} />
  <meshBasicMaterial color="#4488ff" transparent opacity={0.08} side={DoubleSide} />
</mesh>
```

**The `setFromUnitVectors` trick:** Given two unit vectors, this creates a quaternion that rotates from one to the other. Since `ringGeometry` has its default normal along +Z `(0,0,1)`, we rotate from `(0,0,1)` to the Moon's orbital normal. This is much cleaner than manually computing Euler angles.

### Computing inclination for the HUD

```javascript
// DataReadouts.jsx
// The ecliptic normal in scene space is [0, 1, 0] (Y-up)
// Dot product with orbital normal's Y component gives cos(angle)
const inclination = Math.acos(Math.abs(moonOrbitalNormal[1])) * (180 / Math.PI);
// Result: ~5.14° (varies slightly due to precession)
```

---

## Finding eclipses and notable events

On mount, we search ±2 years for interesting dates:

```javascript
// hooks/useNotableEvents.js

// Lunar eclipses: chain through SearchLunarEclipse → NextLunarEclipse
let eclipse = SearchLunarEclipse(startDate);
while (eclipse.peak.date < endDate) {
  events.push({ type: `Lunar eclipse (${eclipse.kind})`, date: eclipse.peak.date });
  eclipse = NextLunarEclipse(eclipse.peak.date);
}

// Seasons: Astronomy Engine computes exact solstice/equinox times
const s = Seasons(year);
// s.mar_equinox, s.jun_solstice, s.sep_equinox, s.dec_solstice

// Supermoons: full moon within 2 days of perigee
let fullMoon = SearchMoonPhase(180, startDate, 40);  // 180° = full moon
// Then find nearest perigee (apsis.kind === 0) and check if < 2 days apart
```

**What makes a supermoon:** A supermoon occurs when a full moon coincides with lunar perigee (closest approach to Earth). The Moon's orbit is elliptical, so its distance varies ~12%. When full moon happens near perigee, the Moon appears ~7% larger and ~15% brighter. We detect this by finding full moons (`SearchMoonPhase(180, ...)`) and checking if perigee (`SearchLunarApsis` where `kind === 0`) falls within 2 days.

---

## Architecture and data flow

```
App.jsx (root)
│
├── State:
│   ├── simTime, isPlaying, speed     ← useSimulationTime()
│   ├── astroData                     ← useAstronomy(simTime, scale)
│   ├── events                        ← useNotableEvents()
│   ├── overlays                      ← useState({...})
│   ├── cameraMode                    ← useState('free')
│   └── accurateScale                 ← useState(false)
│
├── Canvas (3D scene)
│   ├── SolarSystem
│   │   ├── TimeAdvancer  ─── calls advance(delta) every frame
│   │   ├── Starfield
│   │   ├── Sun           ─── emissive sphere + point light at origin
│   │   ├── Earth         ─── position from astroData.earthPos
│   │   ├── Moon          ─── position from astroData.moonPos
│   │   └── Overlays      ─── conditionally rendered
│   └── CameraController  ─── manages OrbitControls + presets
│
└── UI Overlays (absolute positioned HTML over canvas)
    ├── DataReadouts      ─── top-left, phase + expandable details
    ├── CameraPresets     ─── top-center, mode buttons
    ├── ViewToggles       ─── top-right, checkboxes + scale toggle
    ├── InfoPanel         ─── modal, first-visit welcome
    └── TimeControls      ─── bottom-center, play/speed/date/events
```

**Key principle:** UI (HTML/CSS/Tailwind) and scene (Three.js/R3F) are completely separate. They share state through React props from App.jsx. This means you can change the UI without touching any 3D code and vice versa.

---

## Performance patterns

### useMemo everywhere

Astronomy calculations are expensive. We memoize aggressively:

```javascript
// useAstronomy.js — only recompute when time or scale changes
const timestamp = date.getTime();  // stable primitive for dependency
return useMemo(() => getAstronomyData(date, scale), [timestamp, scale]);
```

**Why `timestamp` instead of `date`:** React's dependency check uses `Object.is()`. Two `Date` objects with the same time are different objects (`Object.is(new Date(0), new Date(0))` is `false`). Using `getTime()` produces a number, which compares by value.

### Orbit trail throttling

```javascript
// OrbitTrail.jsx — recompute only every 10 simulated minutes
const trailKey = Math.floor(simTime.getTime() / 600000);

const positions = useMemo(() => {
  const trail = getMoonOrbitTrail(simTime, scale, 200);  // 200 points × full astronomy calc each
  return new Float32Array(trail.flat());
}, [trailKey, scale]);  // trailKey only changes every 600,000ms of sim time
```

The `key={trailKey}` on the `<line>` element forces R3F to remount the geometry when the trail updates. This is necessary because R3F doesn't detect changes to typed arrays in buffer attributes — a limitation of how Three.js and React's reconciler interact.

### Starfield stability

```javascript
// Starfield.jsx — computed once, never changes
const positions = useMemo(() => { /* ... */ }, []);  // empty deps = compute once
```

3,000 stars with random positions on a sphere. Computed on mount, never recomputed. The empty dependency array `[]` is the key.

### Error boundary for resilience

```javascript
// App.jsx — catches WebGL crashes and texture load failures
class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return <div>Something went wrong. <button>Reload</button></div>;
    }
    return this.props.children;
  }
}
```

Without this, any WebGL error (context loss, texture 404, GPU crash) produces a white screen with no feedback. The error boundary catches the crash and shows a reload button instead.

---

## Deployment pipeline

```
git push origin main
    → GitHub Actions triggers (.github/workflows/deploy.yml)
    → ubuntu runner: checkout → setup node 20 → npm ci → npm run build
    → actions/upload-pages-artifact (uploads dist/)
    → actions/deploy-pages (publishes to GitHub Pages)
    → Cloudflare DNS proxies damoon.mattyarri.com → mattyarri.github.io
    → Cloudflare edge caches static assets (textures, JS, CSS)
```

**The base path lesson:** GitHub Pages serves repos at `username.github.io/repo-name/`. With a custom domain, it serves at the root `/`. Vite's `base` config controls how asset URLs are generated. We set `base: '/'` because the custom domain serves from root. If you're using the GitHub Pages URL directly, you need `base: '/da-moon-mechanics/'`.

Texture paths use `import.meta.env.BASE_URL` to stay correct regardless of base:

```javascript
const texture = useTexture(`${import.meta.env.BASE_URL}textures/earth_daymap.jpg`);
```

---

## Key lessons

### 1. Coordinate transforms are everything
The single most important piece of code is the equatorial→ecliptic→scene pipeline. Get it wrong and nothing looks right. Get it right and everything — phases, eclipses, seasons, axial tilt — falls into place for free.

### 2. Declarative 3D changes the game
R3F lets you think about 3D scenes the same way you think about UI: as a tree of components with props. State changes flow down, the framework handles the imperative Three.js calls. This is what made a ~1,000 line project possible.

### 3. Separate what changes from what doesn't
Starfield positions: computed once. Astronomy data: recomputed when time changes. Orbit trail: recomputed every 10 simulated minutes. Matching update frequency to actual change frequency is what keeps 60fps with heavy math.

### 4. The scale problem is a design problem, not a math problem
You can't show accurate scale and have everything visible. Instead of picking one, we built two modes and let the user switch. Both preserve the angular relationships that matter for understanding the physics.

### 5. Camera control is a state machine
Free orbit, top-down tracking, and Earth surface view each have completely different update logic. Trying to make one camera "mode" handle all three leads to fighting between OrbitControls and manual positioning. The solution: treat them as distinct states, animate transitions between them, and fully unmount controls that would interfere.

### 6. Don't hardcode orbital mechanics
The Moon's orbital inclination precesses. Earth's distance from the Sun varies. Orbital periods aren't exact round numbers. By computing everything from astronomy-engine rather than hardcoding values, the visualization stays accurate across centuries of simulated time without any special cases.

### 7. Error boundaries aren't optional for WebGL
3D rendering can fail in ways that regular web apps don't — GPU context loss, texture decode failures, shader compilation errors. Without an error boundary, the React tree unmounts silently, leaving a white screen. Always wrap your Canvas.

### 8. Textures dominate load time
The JavaScript for this entire app is ~500KB. The textures are ~5.5MB. On the web, asset size matters more than code size. Downsizing from 8K to 4K textures cut load time by 75% with no visible quality loss at the scales we're rendering.
