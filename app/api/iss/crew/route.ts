import { NextResponse } from "next/server";

/* open-notify.org only serves over plain HTTP, which browsers block on
   https pages — proxy it server-side. Upstream outage → 502. */
export async function GET() {
  try {
    const res = await fetch("http://api.open-notify.org/astros.json", {
      signal: AbortSignal.timeout(9000),
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `upstream ${res.status}` },
        { status: 502 }
      );
    }
    const json = await res.json();
    const response = {
      number: json.number as number,
      people: (json.people as { name: string; craft: string }[]) ?? [],
    };
    return NextResponse.json(response, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    return NextResponse.json({ error: "crew feed unreachable" }, { status: 502 });
  }
}
