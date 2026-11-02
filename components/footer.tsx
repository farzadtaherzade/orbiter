import Link from "next/link";

const SOURCES = [
  { label: "NASA APOD", href: "https://apod.nasa.gov/apod/astropix.html" },
  { label: "NeoWs", href: "https://ssd-api.jpl.nasa.gov/doc/cad.html" },
  { label: "DONKI", href: "https://kauai.ccmc.gsfc.nasa.gov/DONKI/" },
  { label: "EONET", href: "https://eonet.gsfc.nasa.gov/" },
  { label: "Image Library", href: "https://images.nasa.gov" },
  { label: "Exoplanet Archive", href: "https://exoplanetarchive.ipac.caltech.edu/" },
  { label: "Mars Photos", href: "https://mars.nasa.gov/rss/api/" },
  { label: "WhereTheISS.at", href: "https://wheretheiss.at/" },
];

export function Footer() {
  return (
    <footer className="border-t border-edge bg-abyss">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1fr_auto]">
          <div>
            <div className="flex items-center gap-3">
              <span className="relative inline-block h-5 w-5" aria-hidden>
                <span className="absolute inset-0 rounded-full border border-cyan/70" />
                <span className="absolute top-1/2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-nasa-bright" />
              </span>
              <span className="font-display font-bold tracking-[0.22em] text-star">ORBITER</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-dim">
              An independent deep-space observatory. Live telemetry and imagery are fetched
              directly from public NASA endpoints — when a feed is unreachable, archived
              samples are shown and clearly labeled. No data on this site is invented.
            </p>
            <p className="mt-4 max-w-md font-mono text-[10px] leading-relaxed tracking-[0.08em] text-faint">
              Not affiliated with NASA or any space agency. Imagery courtesy NASA/JPL-Caltech
              and partner institutions. Planet textures CC-BY Solar System Scope.
            </p>
          </div>
          <div>
            <div className="mono-label mb-4">Data Sources</div>
            <ul className="grid grid-cols-2 gap-x-10 gap-y-2">
              {SOURCES.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-dim transition-colors hover:text-cyan"
                  >
                    {s.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-edge pt-6 md:flex-row md:items-center md:justify-between">
          <span className="mono-label">Navigating the observable · EST. 2026</span>
          <div className="flex gap-5">
            <Link href="/observatory" className="mono-label transition-colors hover:text-cyan">Observatory</Link>
            <Link href="/missions" className="mono-label transition-colors hover:text-cyan">Missions</Link>
            <Link href="/lab" className="mono-label transition-colors hover:text-cyan">Lab</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
