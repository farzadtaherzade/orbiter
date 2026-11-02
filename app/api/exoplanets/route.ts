import { NextResponse } from "next/server";

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

/* NASA Exoplanet Archive TAP service, proxied + cached so the heavy
   catalog query hits the archive at most once per 6 h across all clients. */
let cache: { at: number; data: RawExo[] } | null = null;
const TTL = 6 * 3600_000;

export async function GET() {
  if (cache && Date.now() - cache.at < TTL) {
    return NextResponse.json(cache.data, {
      headers: { "X-Cache": "HIT" },
    });
  }
  try {
    const query =
      "select top 900 pl_name,hostname,pl_rade,pl_bmasse,pl_orbper,disc_year,discoverymethod,sy_dist,pl_eqt from ps where default_flag=1 and pl_rade is not null order by disc_year desc";
    const res = await fetch(
      `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=${encodeURIComponent(
        query
      )}&format=json`,
      { signal: AbortSignal.timeout(25000) }
    );
    if (!res.ok) throw new Error(`archive ${res.status}`);
    const data = (await res.json()) as RawExo[];
    cache = { at: Date.now(), data };
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=21600" },
    });
  } catch (e) {
    if (cache) return NextResponse.json(cache.data, { headers: { "X-Cache": "STALE" } });
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "archive unreachable" },
      { status: 502 }
    );
  }
}
