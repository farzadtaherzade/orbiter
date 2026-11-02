/* Cosmic scale explorer — characteristic sizes in meters.
   Sources: NASA fact sheets, JPL, ESA, IAU. */

export interface ScaleObject {
  name: string;
  /** characteristic size in meters (diameter / length) */
  size: number;
  domain: "quantum" | "microscopic" | "human" | "planetary" | "stellar" | "galactic" | "cosmic";
  note: string;
}

export const SCALE_OBJECTS: ScaleObject[] = [
  { name: "Proton", size: 1.7e-15, domain: "quantum", note: "A point-like baryon; the nucleus of hydrogen" },
  { name: "Hydrogen atom", size: 1.1e-10, domain: "quantum", note: "One electron orbiting a proton" },
  { name: "DNA helix width", size: 2.5e-9, domain: "quantum", note: "The double helix is ~2.5 nm across" },
  { name: "Influenza virus", size: 1.0e-7, domain: "microscopic", note: "~100 nm — between chemistry and life" },
  { name: "Red blood cell", size: 8.4e-6, domain: "microscopic", note: "Oxygen ferry; 2 million made every second" },
  { name: "Grain of sand", size: 5.0e-4, domain: "human", note: "0.5 mm quartz" },
  { name: "Human being", size: 1.7, domain: "human", note: "Roughly the midpoint of the cosmic scale in log-space" },
  { name: "Blue whale", size: 27, domain: "human", note: "The largest animal in Earth's history" },
  { name: "Burj Khalifa", size: 828, domain: "human", note: "The tallest structure ever built" },
  { name: "Mount Everest", size: 8849, domain: "human", note: "Above sea level — a dust speck on Earth's radius" },
  { name: "Ceres", size: 9.4e5, domain: "planetary", note: "The largest asteroid / dwarf planet" },
  { name: "The Moon", size: 3.47e6, domain: "planetary", note: "Earth's companion, 384,400 km away" },
  { name: "Mars", size: 6.78e6, domain: "planetary", note: "Half Earth's diameter" },
  { name: "Earth", size: 1.27e7, domain: "planetary", note: "12,756 km across" },
  { name: "Neptune", size: 4.93e7, domain: "planetary", note: "The outermost true planet" },
  { name: "Jupiter", size: 1.40e8, domain: "planetary", note: "11 Earths fit across it" },
  { name: "The Sun", size: 1.39e9, domain: "stellar", note: "109 Earth diameters wide" },
  { name: "Earth's orbit (1 AU)", size: 3.0e11, domain: "stellar", note: "150 million km radius around the Sun" },
  { name: "Betelgeuse", size: 1.2e12, domain: "stellar", note: "A red supergiant — would engulf Jupiter's orbit" },
  { name: "Solar System (Neptune's orbit)", size: 9.0e12, domain: "stellar", note: "The realm of the planets" },
  { name: "One light-year", size: 9.46e15, domain: "cosmic", note: "9.46 trillion km" },
  { name: "Orion Nebula", size: 2.3e17, domain: "cosmic", note: "A stellar nursery 24 ly wide" },
  { name: "Milky Way", size: 1.0e21, domain: "galactic", note: "~105,000 light-years of stars" },
  { name: "Andromeda Galaxy", size: 2.1e21, domain: "galactic", note: "Our galactic twin, closing at 110 km/s" },
  { name: "Local Group", size: 1.0e23, domain: "galactic", note: "~10 million ly of gravitationally bound galaxies" },
  { name: "Laniakea Supercluster", size: 5.2e24, domain: "cosmic", note: "100,000 galaxies streaming toward a great attractor" },
  { name: "Observable Universe", size: 8.8e26, domain: "cosmic", note: "93 billion light-years of everything we can ever see" },
];

export const SCALE_MIN = Math.log10(SCALE_OBJECTS[0].size);
export const SCALE_MAX = Math.log10(SCALE_OBJECTS[SCALE_OBJECTS.length - 1].size);

export function formatSize(m: number): string {
  if (m < 1e-3) {
    if (m < 1e-12) return (m / 1e-15).toFixed(m < 1e-14 ? 0 : 1) + " fm";
    return (m * 1e9).toFixed(m < 1e-9 ? 0 : 1) + " nm";
  }
  if (m < 1) return (m * 1000).toFixed(0) + " mm";
  if (m < 1000) return m.toFixed(1) + " m";
  if (m < 1e6) return (m / 1000).toFixed(1) + " km";
  if (m < 1e11) return (m / 1000).toLocaleString("en-US", { maximumFractionDigits: 0 }) + " km";
  const ly = m / 9.4607e15;
  if (ly >= 1) {
    if (ly < 1e6) return ly.toFixed(ly < 10 ? 1 : 0) + " light-years";
    if (ly < 1e9) return (ly / 1e6).toFixed(ly < 1e7 ? 1 : 0) + " million ly";
    return (ly / 1e9).toFixed(0) + " billion ly";
  }
  const km = m / 1000;
  if (km < 1e9) return (km / 1e6).toFixed(1) + " million km";
  return (m / 1e9).toFixed(1) + " billion km";
}
