/* Local astronomy math — computed from first principles, no network needed. */

const DEG = Math.PI / 180;

export function toRad(deg: number) {
  return deg * DEG;
}
export function toDeg(rad: number) {
  return rad / DEG;
}

/* Julian date from JS timestamp. */
export function julianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/* Days since J2000.0 epoch. */
export function daysSinceJ2000(date: Date): number {
  return julianDate(date) - 2451545.0;
}

/**
 * Subsolar point (where the Sun is at zenith right now).
 * Standard low-precision solar position formulas — accurate to ~0.01°.
 * Verified: returns lon≈0 at UTC noon, declination +23.4° at June solstice.
 */
export function subsolarPoint(date: Date = new Date()): { lat: number; lon: number } {
  const n = daysSinceJ2000(date);
  const meanLongitude = (280.46 + 0.9856474 * n) % 360;
  const meanAnomaly = toRad((357.528 + 0.9856003 * n) % 360);
  const eclipticLongitude =
    toRad(meanLongitude + 1.915 * Math.sin(meanAnomaly) + 0.02 * Math.sin(2 * meanAnomaly));
  const obliquity = toRad(23.439 - 0.0000004 * n);

  const declination = Math.asin(Math.sin(obliquity) * Math.sin(eclipticLongitude));
  const rightAscension = Math.atan2(
    Math.cos(obliquity) * Math.sin(eclipticLongitude),
    Math.cos(eclipticLongitude)
  );

  // Greenwich mean sidereal time in degrees
  const gmstDeg = (280.46061837 + 360.98564736629 * n) % 360;
  let lon = toDeg(rightAscension) - gmstDeg;
  lon = (((lon + 180) % 360) + 360) % 360 - 180; // normalize to [-180, 180)
  return { lat: toDeg(declination), lon };
}

/* ── Moon ─────────────────────────────────────────────────────── */
const SYNODIC = 29.530588853;
const KNOWN_NEW_MOON = 947182440000; // 2000-01-06 18:14 UTC

export interface MoonInfo {
  phase: number; // 0..1 (0=new, 0.5=full)
  illumination: number; // 0..1
  name: string;
  ageDays: number;
}

const MOON_NAMES = [
  "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
  "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent",
] as const;

export function moonInfo(date: Date = new Date()): MoonInfo {
  const phase =
    (((date.getTime() - KNOWN_NEW_MOON) / 86400000) % SYNODIC + SYNODIC) % SYNODIC / SYNODIC;
  const illumination = (1 - Math.cos(2 * Math.PI * phase)) / 2;
  const idx = Math.round(phase * 8) % 8;
  return {
    phase,
    illumination,
    name: MOON_NAMES[idx],
    ageDays: phase * SYNODIC,
  };
}

/* ── Geo helpers ──────────────────────────────────────────────── */
/** Equirectangular lat/lon → unit sphere vector (Y up, matches three.js SphereGeometry UVs). */
export function latLonToVec3(
  lat: number,
  lon: number,
  radius = 1
): [number, number, number] {
  const phi = (90 - lat) * DEG;
  const theta = (lon + 180) * DEG;
  return [
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

/** Great-circle distance between two lat/lon points, in km. */
export function greatCircleKm(
  lat1: number, lon1: number, lat2: number, lon2: number, radiusKm = 6371
): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * radiusKm * Math.asin(Math.sqrt(a));
}

/** Is a point in daylight (above the terminator)? Simple solar-geometry check. */
export function isDaylightAt(lat: number, lon: number, date: Date = new Date()): boolean {
  const sun = subsolarPoint(date);
  const cosAngle =
    Math.sin(toRad(lat)) * Math.sin(toRad(sun.lat)) +
    Math.cos(toRad(lat)) * Math.cos(toRad(sun.lat)) * Math.cos(toRad(lon - sun.lon));
  return cosAngle > 0;
}
