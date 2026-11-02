/* NASA API clients — all typed, all with timeouts. Nothing here fabricates data. */

const NASA_API = "https://api.nasa.gov";
const KEY_STORAGE = "orbiter-nasa-key";
const DEFAULT_KEY = "DEMO_KEY";

export function getNasaKey(): string {
  if (typeof window === "undefined") return DEFAULT_KEY;
  return localStorage.getItem(KEY_STORAGE) || DEFAULT_KEY;
}

export function setNasaKey(key: string) {
  if (typeof window === "undefined") return;
  if (key.trim()) localStorage.setItem(KEY_STORAGE, key.trim());
  else localStorage.removeItem(KEY_STORAGE);
}

async function fetchJson<T>(url: string, timeoutMs = 14000): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) {
      throw new Error(
        res.status === 429
          ? "Rate limited — NASA API key quota exhausted"
          : `NASA API responded ${res.status}`
      );
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/* ── APOD ─────────────────────────────────────────────────────── */
export interface Apod {
  date: string;
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: "image" | "video";
  copyright?: string;
}

export async function fetchApod(date?: string): Promise<Apod> {
  const key = getNasaKey();
  const d = date ? `&date=${date}` : "";
  const apod = await fetchJson<Apod>(
    `${NASA_API}/planetary/apod?api_key=${key}${d}&thumbs=true`
  );
  // Some entries return a placeholder logo URL — treat as unusable.
  if (apod.url && apod.url.includes("nasa.gov/sites/default/files/thumbnails/image")) {
    throw new Error("APOD returned a placeholder image for this date");
  }
  return apod;
}

/* ── Near Earth Object feed ───────────────────────────────────── */
export interface NeoObject {
  id: string;
  name: string;
  absoluteMagnitude: number;
  diameterMinKm: number;
  diameterMaxKm: number;
  hazardous: boolean;
  closeApproachDate: string;
  velocityKmh: number;
  missDistanceKm: number;
  missDistanceAu: number;
  orbitingBody: string;
}

interface RawNeoFeed {
  near_earth_objects: Record<string, RawNeo[]>;
}
interface RawNeo {
  id: string;
  name: string;
  absolute_magnitude_h: number;
  estimated_diameter: {
    kilometers: { estimated_diameter_min: number; estimated_diameter_max: number };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: {
    close_approach_date_full?: string;
    close_approach_date: string;
    relative_velocity: { kilometers_per_hour: number };
    miss_distance: { kilometers: string; astronomical: string };
    orbiting_body: string;
  }[];
}

export async function fetchNeoFeed(days = 4): Promise<NeoObject[]> {
  const key = getNasaKey();
  const start = new Date();
  const end = new Date(Date.now() + days * 86400000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const raw = await fetchJson<RawNeoFeed>(
    `${NASA_API}/neo/rest/v1/feed?start_date=${fmt(start)}&end_date=${fmt(end)}&api_key=${key}`
  );
  const out: NeoObject[] = [];
  for (const list of Object.values(raw.near_earth_objects)) {
    for (const n of list) {
      const ca = n.close_approach_data[0];
      if (!ca) continue;
      out.push({
        id: n.id,
        name: n.name,
        absoluteMagnitude: n.absolute_magnitude_h,
        diameterMinKm: n.estimated_diameter.kilometers.estimated_diameter_min,
        diameterMaxKm: n.estimated_diameter.kilometers.estimated_diameter_max,
        hazardous: n.is_potentially_hazardous_asteroid,
        closeApproachDate: ca.close_approach_date_full ?? ca.close_approach_date,
        velocityKmh: ca.relative_velocity.kilometers_per_hour,
        missDistanceKm: Number(ca.miss_distance.kilometers),
        missDistanceAu: Number(ca.miss_distance.astronomical),
        orbitingBody: ca.orbiting_body,
      });
    }
  }
  return out.sort((a, b) => a.missDistanceKm - b.missDistanceKm);
}

/* ── DONKI solar flares ───────────────────────────────────────── */
export interface SolarFlare {
  id: string;
  classType: string;
  peakTime: string;
  sourceLocation: string | null;
  activeRegion: number | null;
}

interface RawFlare {
  flrID: string;
  classType: string;
  peakTime: string;
  sourceLocation?: string;
  activeRegionNum?: number;
}

export async function fetchSolarFlares(daysBack = 30): Promise<SolarFlare[]> {
  const key = getNasaKey();
  const start = new Date(Date.now() - daysBack * 86400000).toISOString().slice(0, 10);
  const raw = await fetchJson<RawFlare[]>(
    `${NASA_API}/DONKI/FLR?startDate=${start}&api_key=${key}`
  );
  return raw
    .map((f) => ({
      id: f.flrID,
      classType: f.classType,
      peakTime: f.peakTime,
      sourceLocation: f.sourceLocation ?? null,
      activeRegion: f.activeRegionNum ?? null,
    }))
    .sort((a, b) => b.peakTime.localeCompare(a.peakTime))
    .slice(0, 12);
}

/* ── EONET natural events ─────────────────────────────────────── */
export interface EonetEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  lon: number;
  lat: number;
  link: string;
}

interface RawEonet {
  events: {
    id: string;
    title: string;
    link: string;
    categories: { id: number; title: string }[];
    geometry: { date: string; type: string; coordinates: number[] | number[][] }[];
  }[];
}

export async function fetchEonetEvents(limit = 14): Promise<EonetEvent[]> {
  const raw = await fetchJson<RawEonet>(
    `https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=${limit}&sort=date-desc`
  );
  return raw.events
    .map((e) => {
      const geo = e.geometry[e.geometry.length - 1];
      const coords = Array.isArray(geo?.coordinates?.[0])
        ? (geo.coordinates[0] as number[])
        : (geo?.coordinates as number[]);
      return {
        id: e.id,
        title: e.title,
        category: e.categories[0]?.title ?? "Unknown",
        date: geo?.date ?? e.geometry[0]?.date ?? "",
        lon: coords?.[0] ?? 0,
        lat: coords?.[1] ?? 0,
        link: e.link,
      };
    })
    .filter((e) => e.date);
}

/* ── NASA Image & Video Library ───────────────────────────────── */
export interface NasaImageItem {
  nasaId: string;
  title: string;
  description: string;
  dateCreated: string;
  center: string;
  thumb: string;
  image: string;
}

interface RawImageSearch {
  collection: {
    items: {
      data: {
        nasa_id: string;
        title: string;
        description: string;
        date_created: string;
        center: string;
      }[];
      links: { href: string; rel: string }[];
    }[];
  };
}

export async function searchNasaImages(
  q: string,
  pageSize = 12,
  yearStart?: number
): Promise<NasaImageItem[]> {
  const year = yearStart ? `&year_start=${yearStart}` : "";
  const raw = await fetchJson<RawImageSearch>(
    `https://images-api.nasa.gov/search?q=${encodeURIComponent(
      q
    )}&media_type=image&page_size=${pageSize}${year}`
  );
  return raw.collection.items
    .map((item) => {
      const d = item.data[0];
      const thumb =
        item.links?.find((l) => l.rel === "preview")?.href ?? item.links?.[0]?.href ?? "";
      return {
        nasaId: d.nasa_id,
        title: d.title,
        description: d.description ?? "",
        dateCreated: d.date_created,
        center: d.center,
        thumb: thumb.replace(/^http:/, "https:"),
        image: `https://images-assets.nasa.gov/image/${d.nasa_id}/${d.nasa_id}~large.jpg`,
      };
    })
    .filter((i) => i.thumb);
}

/* ── Mars rover photos ────────────────────────────────────────── */
export interface MarsPhoto {
  id: number;
  sol: number;
  earthDate: string;
  camera: string;
  cameraFull: string;
  src: string;
  rover: string;
}

interface RawMarsPhotos {
  latest_photos: {
    id: number;
    sol: number;
    earth_date: string;
    img_src: string;
    camera: { name: string; full_name: string };
    rover: { name: string };
  }[];
}

export async function fetchMarsRoverPhotos(
  rover: "curiosity" | "perseverance" | "opportunity",
  count = 8
): Promise<MarsPhoto[]> {
  const key = getNasaKey();
  const raw = await fetchJson<RawMarsPhotos>(
    `${NASA_API}/mars-photos/api/v1/rovers/${rover}/latest_photos?api_key=${key}`
  );
  return raw.latest_photos.slice(0, count).map((p) => ({
    id: p.id,
    sol: p.sol,
    earthDate: p.earth_date,
    camera: p.camera.name,
    cameraFull: p.camera.full_name,
    src: p.img_src,
    rover: p.rover.name,
  }));
}

/* ── Exoplanet Archive (TAP) ──────────────────────────────────── */
export interface Exoplanet {
  name: string;
  host: string;
  radiusEarth: number | null;
  massEarth: number | null;
  orbitDays: number | null;
  discoveryYear: number;
  method: string;
  distanceLy: number | null;
  equilibriumTempK: number | null;
}

interface RawExo {
  pl_name: string;
  hostname: string;
  pl_rade: number | null;
  pl_bmasse: number | null;
  pl_orbper: number | null;
  disc_year: number;
  discoverymethod: string;
  sy_dist: number | null;
  pl_eqt: number | null;
}

export async function fetchExoplanets(limit = 900): Promise<Exoplanet[]> {
  const query = `select top ${limit} pl_name,hostname,pl_rade,pl_bmasse,pl_orbper,disc_year,discoverymethod,sy_dist,pl_eqt from ps where default_flag=1 and pl_rade is not null order by disc_year desc`;
  const raw = await fetchJson<RawExo[]>(
    `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=${encodeURIComponent(
      query
    )}&format=json`,
    20000
  );
  return raw.map((p) => ({
    name: p.pl_name,
    host: p.hostname,
    radiusEarth: p.pl_rade,
    massEarth: p.pl_bmasse,
    orbitDays: p.pl_orbper,
    discoveryYear: p.disc_year,
    method: p.discoverymethod,
    distanceLy: p.sy_dist,
    equilibriumTempK: p.pl_eqt,
  }));
}
