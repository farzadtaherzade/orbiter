/* ISS tracking via wheretheiss.at — keyless, CORS-enabled, 1 req/sec limit. */

export interface IssPosition {
  lat: number;
  lon: number;
  altitudeKm: number;
  velocityKmh: number;
  timestamp: number;
  visibility: "daylight" | "eclipsed";
}

interface RawIss {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  timestamp: number;
  visibility: string;
}

export async function fetchIssPosition(): Promise<IssPosition> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544", {
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`ISS API responded ${res.status}`);
    const raw = (await res.json()) as RawIss;
    return {
      lat: raw.latitude,
      lon: raw.longitude,
      altitudeKm: raw.altitude,
      velocityKmh: raw.velocity,
      timestamp: raw.timestamp,
      visibility: raw.visibility === "daylight" ? "daylight" : "eclipsed",
    };
  } finally {
    clearTimeout(timer);
  }
}

/* Ground-track prediction: up to 10 timestamps per call. A full orbit
   (~92.9 min) sampled every 5 min = 19 points = 2 calls. */
export interface TrackPoint {
  lat: number;
  lon: number;
  t: number;
}

export async function fetchIssTrack(minutesAhead = 95, stepMin = 5): Promise<TrackPoint[]> {
  const now = Math.floor(Date.now() / 1000);
  const timestamps: number[] = [];
  for (let m = 0; m <= minutesAhead; m += stepMin) timestamps.push(now + m * 60);

  const batches: number[][] = [];
  for (let i = 0; i < timestamps.length; i += 10) batches.push(timestamps.slice(i, i + 10));

  const results = await Promise.all(
    batches.map(async (batch) => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 12000);
      try {
        const res = await fetch(
          `https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps=${batch.join(
            ","
          )}&units=kilometers`,
          { signal: ctrl.signal }
        );
        if (!res.ok) throw new Error(`track ${res.status}`);
        return (await res.json()) as { latitude: number; longitude: number; timestamp: number }[];
      } finally {
        clearTimeout(timer);
      }
    })
  );

  return results
    .flat()
    .map((p) => ({ lat: p.latitude, lon: p.longitude, t: p.timestamp }))
    .sort((a, b) => a.t - b.t);
}

/* ISS crew — via our own route handler (open-notify is HTTP-only). */
export interface CrewMember {
  name: string;
  craft: string;
}

export async function fetchIssCrew(): Promise<CrewMember[]> {
  const res = await fetch("/api/iss/crew");
  if (!res.ok) throw new Error(`crew ${res.status}`);
  const json = (await res.json()) as { people: { name: string; craft: string }[]; number: number };
  return json.people.map((p) => ({ name: p.name, craft: p.craft }));
}
