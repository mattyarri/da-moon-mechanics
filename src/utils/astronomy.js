import { Body, HelioVector, GeoVector, MoonPhase, Illumination, MakeTime } from 'astronomy-engine';

// J2000 obliquity of the ecliptic in radians
const OBLIQUITY = 23.4392911 * (Math.PI / 180);
const COS_OBL = Math.cos(OBLIQUITY);
const SIN_OBL = Math.sin(OBLIQUITY);

/**
 * Convert equatorial J2000 vector (AU) to ecliptic Cartesian (AU).
 */
function equatorialToEcliptic(vec) {
  return {
    x: vec.x,
    y: vec.y * COS_OBL + vec.z * SIN_OBL,
    z: -vec.y * SIN_OBL + vec.z * COS_OBL,
  };
}

/**
 * Map ecliptic Cartesian to scene coordinates.
 * Scene: XZ = ecliptic plane, Y = ecliptic north.
 */
function eclipticToScene(ecl) {
  return [ecl.x, ecl.z, -ecl.y];
}

/**
 * Scale a scene position vector by a factor.
 */
function scalePosition([x, y, z], factor) {
  return [x * factor, y * factor, z * factor];
}

function crossProduct([ax, ay, az], [bx, by, bz]) {
  return [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx];
}

/**
 * Get all body positions and phase data for a given Date.
 * Returns positions in scene coordinates, scaled to the given scale config.
 */
export function getAstronomyData(date, scale) {
  const astroTime = MakeTime(date);

  // Earth heliocentric position (equatorial J2000, AU)
  const earthEqAU = HelioVector(Body.Earth, astroTime);
  const earthEcl = equatorialToEcliptic(earthEqAU);
  const earthScene = eclipticToScene(earthEcl);

  // Scale Earth position: map ~1 AU to earthOrbitRadius
  const earthDist = Math.sqrt(earthEcl.x ** 2 + earthEcl.y ** 2 + earthEcl.z ** 2);
  const earthScaleFactor = scale.earthOrbitRadius / earthDist;
  const earthPos = scalePosition(earthScene, earthScaleFactor);

  // Moon geocentric position (equatorial J2000, AU)
  const moonEqAU = GeoVector(Body.Moon, astroTime, true);
  const moonEcl = equatorialToEcliptic(moonEqAU);
  const moonScene = eclipticToScene(moonEcl);

  // Scale Moon position relative to Earth: map ~0.00257 AU to moonOrbitRadius
  const moonDist = Math.sqrt(moonEcl.x ** 2 + moonEcl.y ** 2 + moonEcl.z ** 2);
  const moonScaleFactor = scale.moonOrbitRadius / moonDist;
  const moonRelPos = scalePosition(moonScene, moonScaleFactor);

  // Moon absolute scene position = Earth + scaled Moon offset
  const moonPos = [
    earthPos[0] + moonRelPos[0],
    earthPos[1] + moonRelPos[1],
    earthPos[2] + moonRelPos[2],
  ];

  // Phase data
  const phaseAngle = MoonPhase(astroTime);
  const illum = Illumination(Body.Moon, astroTime);

  // Earth-Moon distance in km (1 AU = 149,597,870.7 km)
  const moonDistKm = moonDist * 149597870.7;

  // Moon orbital plane normal: cross product of Moon positions at two times
  const futureTime = MakeTime(new Date(date.getTime() + 7 * 86400000));
  const moonFutureEq = GeoVector(Body.Moon, futureTime, true);
  const moonFutureEcl = equatorialToEcliptic(moonFutureEq);
  const moonFutureScene = eclipticToScene(moonFutureEcl);

  // Cross product of current and future Moon geocentric vectors (in scene coords)
  const normal = crossProduct(moonScene, moonFutureScene);
  const len = Math.sqrt(normal[0] ** 2 + normal[1] ** 2 + normal[2] ** 2);
  const moonOrbitalNormal = [normal[0] / len, normal[1] / len, normal[2] / len];

  return {
    earthPos,
    moonPos,
    moonPhaseAngle: phaseAngle,
    moonIllumination: illum.phase_fraction * 100,
    moonPhaseName: getPhaseName(phaseAngle),
    moonDistanceKm: moonDistKm,
    moonOrbitalNormal,
  };
}

/**
 * Compute Moon orbit trail points (trailing behind current position).
 * Returns array of [x, y, z] scene positions, oldest to newest.
 */
export function getMoonOrbitTrail(date, scale, numPoints = 128) {
  const ORBITAL_PERIOD_MS = 27.3 * 86400000;
  const step = ORBITAL_PERIOD_MS / numPoints;
  const points = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = new Date(date.getTime() - ORBITAL_PERIOD_MS + i * step);
    const astroTime = MakeTime(t);

    const earthEq = HelioVector(Body.Earth, astroTime);
    const earthEcl = equatorialToEcliptic(earthEq);
    const earthScene = eclipticToScene(earthEcl);
    const earthDist = Math.sqrt(earthEcl.x ** 2 + earthEcl.y ** 2 + earthEcl.z ** 2);
    const earthScaleFactor = scale.earthOrbitRadius / earthDist;
    const earthPos = scalePosition(earthScene, earthScaleFactor);

    const moonEq = GeoVector(Body.Moon, astroTime, true);
    const moonEcl = equatorialToEcliptic(moonEq);
    const moonScene = eclipticToScene(moonEcl);
    const moonDist = Math.sqrt(moonEcl.x ** 2 + moonEcl.y ** 2 + moonEcl.z ** 2);
    const moonScaleFactor = scale.moonOrbitRadius / moonDist;
    const moonRelPos = scalePosition(moonScene, moonScaleFactor);

    points.push([
      earthPos[0] + moonRelPos[0],
      earthPos[1] + moonRelPos[1],
      earthPos[2] + moonRelPos[2],
    ]);
  }

  return points;
}

/**
 * Get the moon phase name from the phase angle (0-360°).
 */
function getPhaseName(angle) {
  if (angle < 22.5) return 'New Moon';
  if (angle < 67.5) return 'Waxing Crescent';
  if (angle < 112.5) return 'First Quarter';
  if (angle < 157.5) return 'Waxing Gibbous';
  if (angle < 202.5) return 'Full Moon';
  if (angle < 247.5) return 'Waning Gibbous';
  if (angle < 292.5) return 'Last Quarter';
  if (angle < 337.5) return 'Waning Crescent';
  return 'New Moon';
}
