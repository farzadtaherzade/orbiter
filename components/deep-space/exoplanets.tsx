"use client";

import { useMemo, useState } from "react";
import { useLiveData, ageOf, type DataState } from "@/hooks/use-live-data";
import { Panel, StatusBadge, SourceChip, Spinner } from "@/components/ui";

interface Exoplanet {
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

function radiusColor(r: number): string {
  if (r < 1.25) return "#c084fc"; // sub-Earth / rocky
  if (r < 2) return "#67e8f9"; // super-Earth
  if (r < 6) return "#4d8dff"; // Neptune-like
  return "#ffb454"; // Jupiter-like
}

/** Scatter: orbital period (log x) vs radius (log y), colored by class. */
function Scatter({ data, onPick, picked }: {
  data: Exoplanet[];
  onPick: (name: string) => void;
  picked: string | null;
}) {
  const W = 720;
  const H = 380;
  const pts = data
    .filter((p) => p.orbitDays && p.radiusEarth)
    .slice(0, 900);

  const x = (d: number) => (Math.log10(d) + 0.5) / (5.5 + 0.5) * W; // 0.3 → ~10^5.5 days
  const y = (r: number) => H - ((Math.log10(r) + 1.3) / (1.3 + 1.5)) * H; // 0.05 → 16 R⊕

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label="Scatter plot of discovered exoplanets by orbital period and radius"
    >
      {/* grid */}
      {[1, 10, 100, 1000, 10000, 100000].map((d) => (
        <g key={d}>
          <line x1={x(d)} y1={0} x2={x(d)} y2={H} stroke="#1c2b4d" strokeWidth="1" />
          <text x={x(d) + 4} y={H - 6} fill="#55688f" fontSize="9" fontFamily="IBM Plex Mono">
            {d < 365 ? `${d}d` : `${(d / 365.25).toFixed(d < 36500 ? 0 : 0)}yr`}
          </text>
        </g>
      ))}
      {[0.1, 1, 4, 16].map((r) => (
        <g key={r}>
          <line x1={0} y1={y(r)} x2={W} y2={y(r)} stroke="#1c2b4d" strokeWidth="1" />
          <text x={6} y={y(r) - 4} fill="#55688f" fontSize="9" fontFamily="IBM Plex Mono">
            {r} R⊕
          </text>
        </g>
      ))}
      {pts.map((p) => (
        <circle
          key={p.name}
          cx={x(Math.min(Math.max(p.orbitDays!, 0.32), 320000))}
          cy={y(Math.min(Math.max(p.radiusEarth!, 0.05), 15.5))}
          r={p.name === picked ? 5 : Math.max(1.6, Math.min(4.5, p.radiusEarth! * 0.8))}
          fill={p.name === picked ? "#e9f1ff" : radiusColor(p.radiusEarth!)}
          fillOpacity={p.name === picked ? 1 : 0.55}
          stroke={p.name === picked ? "#67e8f9" : "none"}
          strokeWidth="1.5"
          className="cursor-pointer transition-all"
          onClick={() => onPick(p.name)}
        >
          <title>{`${p.name} — ${p.radiusEarth!.toFixed(2)} R⊕, ${p.orbitDays!.toFixed(1)} d`}</title>
        </circle>
      ))}
    </svg>
  );
}

export function ExoplanetConsole() {
  const exo = useLiveData<Exoplanet[]>(
    "exoplanets",
    async () => {
      const res = await fetch("/api/exoplanets");
      if (!res.ok) throw new Error(`archive ${res.status}`);
      return (await res.json()) as Exoplanet[];
    },
    { pollMs: 60 * 60_000, fallback: [] }
  );

  const [method, setMethod] = useState<string>("All");
  const [yearMin, setYearMin] = useState(1992);
  const [maxRadius, setMaxRadius] = useState(16);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const list = exo.data.filter(
      (p) =>
        (method === "All" || p.method === method) &&
        p.discoveryYear >= yearMin &&
        (p.radiusEarth ?? 99) <= maxRadius &&
        (!query || p.name.toLowerCase().includes(query.toLowerCase()) || p.host.toLowerCase().includes(query.toLowerCase()))
    );
    return list;
  }, [exo.data, method, yearMin, maxRadius, query]);

  const selected = filtered.find((p) => p.name === picked) ?? null;
  const years = exo.data.map((p) => p.discoveryYear);
  const yearMax = years.length ? Math.max(...years) : 2026;
  const methodCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of exo.data) m.set(p.method, (m.get(p.method) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [exo.data]);

  const offline = exo.state === "sample";

  return (
    <Panel corners className="p-6 md:p-8">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold text-star">Exoplanet discovery console</h3>
          <p className="mt-1 text-xs text-dim">
            {offline
              ? "Live archive unreachable — showing nothing rather than inventing data."
              : `${filtered.length} of ${exo.data.length} confirmed worlds, queried live from the NASA Exoplanet Archive.`}
          </p>
        </div>
        <StatusBadge state={exo.state as DataState} age={ageOf(exo.fetchedAt)} />
      </div>

      {exo.state === "loading" && <div className="mt-8"><Spinner label="Querying the archive" /></div>}

      {!offline && exo.data.length > 0 && (
        <>
          {/* filters */}
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="method" className="mono-label mb-1.5 block">Discovery method</label>
              <select
                id="method"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="panel w-full px-3 py-2 font-mono text-xs text-star focus:border-cyan focus:outline-none"
              >
                <option value="All">All ({exo.data.length})</option>
                {methodCounts.map(([m, c]) => (
                  <option key={m} value={m}>
                    {m} ({c})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="year" className="mono-label mb-1.5 block">
                Discovered since {yearMin}
              </label>
              <input
                id="year"
                type="range"
                min={1992}
                max={yearMax}
                step={1}
                value={yearMin}
                onChange={(e) => setYearMin(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="radius" className="mono-label mb-1.5 block">
                Radius up to {maxRadius} R⊕
              </label>
              <input
                id="radius"
                type="range"
                min={0.5}
                max={16}
                step={0.5}
                value={maxRadius}
                onChange={(e) => setMaxRadius(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="search" className="mono-label mb-1.5 block">Search by name</label>
            <input
              id="search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Kepler-186, TRAPPIST, Proxima"
              className="panel w-full max-w-md px-3 py-2 font-mono text-xs text-star placeholder:text-faint focus:border-cyan focus:outline-none"
            />
          </div>

          {/* scatter + legend */}
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="panel overflow-x-auto p-3">
              <Scatter data={filtered} onPick={setPicked} picked={picked} />
            </div>
            <div>
              {selected ? (
                <div className="panel hud-corners p-5">
                  <div className="mono-label text-cyan">Selected world</div>
                  <h4 className="mt-1 font-display text-xl font-semibold text-star">{selected.name}</h4>
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                    {[
                      ["Host star", selected.host],
                      ["Radius", selected.radiusEarth ? `${selected.radiusEarth.toFixed(2)} R⊕` : "—"],
                      ["Mass", selected.massEarth ? `${selected.massEarth.toFixed(1)} M⊕` : "—"],
                      ["Orbit", selected.orbitDays ? `${selected.orbitDays.toFixed(1)} d` : "—"],
                      ["Found", String(selected.discoveryYear)],
                      ["Method", selected.method],
                      ["Distance", selected.distanceLy ? `${Math.round(selected.distanceLy)} ly` : "—"],
                      ["Eq. temp", selected.equilibriumTempK ? `${Math.round(selected.equilibriumTempK)} K` : "—"],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <dt className="mono-label mb-0.5">{k}</dt>
                        <dd className="font-mono text-xs text-star">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : (
                <div className="panel flex h-full flex-col justify-center p-5 text-center">
                  <div className="mono-label mb-2">Legend</div>
                  <div className="flex flex-col gap-2 text-left">
                    {[
                      ["#c084fc", "Rocky (under 1.25 R⊕)"],
                      ["#67e8f9", "Super-Earth (1.25–2 R⊕)"],
                      ["#4d8dff", "Neptune-like (2–6 R⊕)"],
                      ["#ffb454", "Jovian (over 6 R⊕)"],
                    ].map(([c, label]) => (
                      <div key={label} className="flex items-center gap-2.5 font-mono text-[11px] text-dim">
                        <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
                        {label}
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-[11px] leading-relaxed text-faint">
                    Click any point to inspect the planet. X-axis is orbital period
                    (log), Y-axis is radius (log).
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <div className="mt-6">
        <SourceChip source="NASA Exoplanet Archive (TAP)" href="https://exoplanetarchive.ipac.caltech.edu/" />
      </div>
    </Panel>
  );
}
