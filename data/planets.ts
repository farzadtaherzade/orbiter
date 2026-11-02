/* Planetary fact sheet — values from NASA/JPL planetary fact sheets
   https://science.nasa.gov/solar-system/planets/ and NSSDC. */

export interface Planet {
  id: string;
  name: string;
  tagline: string;
  description: string;
  /** equatorial diameter, km */
  diameterKm: number;
  /** mass relative to Earth */
  massEarth: number;
  /** surface gravity m/s² */
  gravity: number;
  /** sidereal rotation period, hours (negative = retrograde) */
  rotationHours: number;
  /** solar day length, hours */
  solarDayHours: number;
  /** orbital period, Earth days */
  orbitDays: number;
  /** semi-major axis, millions of km */
  distanceMkm: number;
  /** mean temperature, °C */
  tempC: number;
  moons: number;
  eccentricity: number;
  inclinationDeg: number;
  axialTiltDeg: number;
  color: string;
  texture: string;
  bumpTexture?: string;
  ring?: { inner: number; outer: number; texture: string };
  type: "terrestrial" | "gas giant" | "ice giant";
}

export const SUN = {
  name: "Sun",
  diameterKm: 1_392_700,
  massEarth: 333_000,
  tempSurfaceC: 5505,
  tempCoreC: 15_000_000,
  description:
    "A G-type main-sequence star holding 99.86% of the Solar System's mass. Its core fuses ~600 million tons of hydrogen every second.",
};

export const PLANETS: Planet[] = [
  {
    id: "mercury",
    name: "Mercury",
    tagline: "The scorched sprinter",
    description:
      "The smallest planet and nearest to the Sun. With almost no atmosphere, its surface swings from 430°C in daylight to −180°C at night.",
    diameterKm: 4879,
    massEarth: 0.055,
    gravity: 3.7,
    rotationHours: 1407.6,
    solarDayHours: 4222.6,
    orbitDays: 88.0,
    distanceMkm: 57.9,
    tempC: 167,
    moons: 0,
    eccentricity: 0.206,
    inclinationDeg: 7.0,
    axialTiltDeg: 0.03,
    color: "#b1a8a0",
    texture: "/textures/mercury.jpg",
    bumpTexture: "/textures/mercury_bump.jpg",
    type: "terrestrial",
  },
  {
    id: "venus",
    name: "Venus",
    tagline: "The runaway greenhouse",
    description:
      "Wrapped in sulfuric-acid clouds and 92 bar of CO₂, Venus is the hottest planet at 464°C — hot enough to melt lead. It rotates backwards, so its day outlasts its year.",
    diameterKm: 12104,
    massEarth: 0.815,
    gravity: 8.9,
    rotationHours: -5832.5,
    solarDayHours: 2802,
    orbitDays: 224.7,
    distanceMkm: 108.2,
    tempC: 464,
    moons: 0,
    eccentricity: 0.007,
    inclinationDeg: 3.4,
    axialTiltDeg: 177.4,
    color: "#e0c48f",
    texture: "/textures/venus.jpg",
    bumpTexture: "/textures/venus_bump.jpg",
    type: "terrestrial",
  },
  {
    id: "earth",
    name: "Earth",
    tagline: "The pale blue dot",
    description:
      "The only world known to harbor life. 71% of its surface is ocean, and its nitrogen–oxygen atmosphere is continuously respired by the biosphere.",
    diameterKm: 12756,
    massEarth: 1,
    gravity: 9.8,
    rotationHours: 23.9,
    solarDayHours: 24,
    orbitDays: 365.25,
    distanceMkm: 149.6,
    tempC: 15,
    moons: 1,
    eccentricity: 0.017,
    inclinationDeg: 0.0,
    axialTiltDeg: 23.4,
    color: "#5f8fd0",
    texture: "/textures/earth_day_4k.jpg",
    bumpTexture: "/textures/earth_bump_roughness_clouds_4k.jpg",
    type: "terrestrial",
  },
  {
    id: "mars",
    name: "Mars",
    tagline: "The rust frontier",
    description:
      "Home to Olympus Mons, the tallest volcano in the Solar System, and Valles Marineris, a canyon system that would span the United States. Active rovers explore its surface today.",
    diameterKm: 6792,
    massEarth: 0.107,
    gravity: 3.7,
    rotationHours: 24.6,
    solarDayHours: 24.7,
    orbitDays: 687,
    distanceMkm: 228.0,
    tempC: -65,
    moons: 2,
    eccentricity: 0.094,
    inclinationDeg: 1.8,
    axialTiltDeg: 25.2,
    color: "#c1613b",
    texture: "/textures/mars.jpg",
    bumpTexture: "/textures/mars_bump.jpg",
    type: "terrestrial",
  },
  {
    id: "jupiter",
    name: "Jupiter",
    tagline: "The gravitational shepherd",
    description:
      "More massive than all other planets combined. Its Great Red Spot is a storm wider than Earth that has raged for centuries, and its magnetosphere is the largest structure in the Solar System.",
    diameterKm: 142984,
    massEarth: 317.8,
    gravity: 23.1,
    rotationHours: 9.9,
    solarDayHours: 9.9,
    orbitDays: 4331,
    distanceMkm: 778.5,
    tempC: -110,
    moons: 95,
    eccentricity: 0.049,
    inclinationDeg: 1.3,
    axialTiltDeg: 3.1,
    color: "#c8a06e",
    texture: "/textures/jupiter.jpg",
    type: "gas giant",
  },
  {
    id: "saturn",
    name: "Saturn",
    tagline: "The jewel of the system",
    description:
      "Less dense than water, with a ring system of near-pure water ice spanning 280,000 km yet only ~10 m thick in places. 274 moons are now recognized — the most of any planet.",
    diameterKm: 120536,
    massEarth: 95.2,
    gravity: 9.0,
    rotationHours: 10.7,
    solarDayHours: 10.7,
    orbitDays: 10747,
    distanceMkm: 1432.0,
    tempC: -140,
    moons: 274,
    eccentricity: 0.052,
    inclinationDeg: 2.5,
    axialTiltDeg: 26.7,
    color: "#d9c38a",
    texture: "/textures/saturn.jpg",
    ring: { inner: 1.24, outer: 2.27, texture: "/textures/saturn_ring.jpg" },
    type: "gas giant",
  },
  {
    id: "uranus",
    name: "Uranus",
    tagline: "The sideways world",
    description:
      "Knocked onto its side by an ancient impact, Uranus rolls around the Sun with a 98° axial tilt — each pole gets 42 years of continuous sunlight, then 42 years of night.",
    diameterKm: 51118,
    massEarth: 14.5,
    gravity: 8.7,
    rotationHours: -17.2,
    solarDayHours: 17.2,
    orbitDays: 30589,
    distanceMkm: 2867.0,
    tempC: -195,
    moons: 28,
    eccentricity: 0.047,
    inclinationDeg: 0.8,
    axialTiltDeg: 97.8,
    color: "#9fd8dd",
    texture: "/textures/uranus.jpg",
    type: "ice giant",
  },
  {
    id: "neptune",
    name: "Neptune",
    tagline: "The deep blue gale",
    description:
      "The windiest world known — supersonic jet streams reach 2,100 km/h. Discovered by mathematics before telescopes: its position was predicted from Uranus's orbital wobbles.",
    diameterKm: 49528,
    massEarth: 17.1,
    gravity: 11.0,
    rotationHours: 16.1,
    solarDayHours: 16.1,
    orbitDays: 59800,
    distanceMkm: 4515.0,
    tempC: -200,
    moons: 16,
    eccentricity: 0.010,
    inclinationDeg: 1.8,
    axialTiltDeg: 28.3,
    color: "#4d6fe3",
    texture: "/textures/neptune.jpg",
    type: "ice giant",
  },
];

export function formatBig(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + "M";
  if (n >= 1e3) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return n.toString();
}
