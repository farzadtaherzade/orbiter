"use client";

import { useIssPosition } from "@/hooks/use-iss";
import { ageOf, type DataState } from "@/hooks/use-live-data";
import { useNow } from "@/hooks/use-now";
import { moonInfo } from "@/lib/astronomy";
import { StatusBadge } from "@/components/ui";
import { METEOR_SHOWERS, isShowerActive } from "@/data/events";

function daysUntilPeak(peakMonth: number, peakDay: number): number {
  const now = new Date();
  let peak = new Date(now.getFullYear(), peakMonth - 1, peakDay);
  if (peak < now) peak = new Date(now.getFullYear() + 1, peakMonth - 1, peakDay);
  return Math.ceil((peak.getTime() - now.getTime()) / 86400000);
}

function endInDays(s: { endMonth: number; endDay: number; startMonth: number }, now: Date): number {
  const end = new Date(s.endMonth < s.startMonth ? now.getFullYear() + 1 : now.getFullYear(), s.endMonth - 1, s.endDay);
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000));
}

/** Small moon phase glyph drawn from real current illumination. */
function MoonGlyph({ size = 44, date }: { size?: number; date: Date | null }) {
  if (!date) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={size / 2 - 1} fill="#0e1830" stroke="#1c2b4d" />
      </svg>
    );
  }
  const { phase, illumination } = moonInfo(date);
  const r = size / 2 - 1;
  const c = size / 2;
  const e2 = r * Math.abs(2 * illumination - 1);
  const waxing = phase < 0.5;
  // lit-side semicircle, then terminator ellipse back to the start
  const outer = waxing ? `M ${c} ${c - r} A ${r} ${r} 0 0 1 ${c} ${c + r}` : `M ${c} ${c - r} A ${r} ${r} 0 0 0 ${c} ${c + r}`;
  const innerSweep = waxing ? (illumination < 0.5 ? 1 : 0) : illumination < 0.5 ? 0 : 1;
  const litPath = `${outer} A ${Math.max(e2, 0.01)} ${r} 0 0 ${innerSweep} ${c} ${c - r} Z`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle cx={c} cy={c} r={r} fill="#0e1830" stroke="#1c2b4d" />
      <path d={litPath} fill="#d7e2f6" />
    </svg>
  );
}

export function TelemetryStrip() {
  const iss = useIssPosition();
  const now = useNow(30_000);

  const moon = now ? moonInfo(now) : null;
  const nextShower = now
    ? [...METEOR_SHOWERS].sort(
        (a, b) => daysUntilPeak(a.peakMonth, a.peakDay) - daysUntilPeak(b.peakMonth, b.peakDay)
      )[0]
    : null;
  const activeShower = now ? METEOR_SHOWERS.find((s) => isShowerActive(s, now)) : null;

  const lat = iss.data.lat.toFixed(2);
  const lon = iss.data.lon.toFixed(2);

  return (
    <div className="border-t border-edge bg-void/80">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden md:grid-cols-4">
        <div className="px-5 py-4">
          <div className="mono-label mb-1.5 flex items-center justify-between gap-2">
            ISS Position
            <StatusBadge state={iss.state as DataState} age={ageOf(iss.fetchedAt)} />
          </div>
          <div className="font-mono text-sm text-star tabular-nums">
            {iss.state === "sample" ? "—" : `${lat}°, ${lon}°`}
          </div>
          <div className="font-mono text-[10px] text-faint tabular-nums">
            {iss.state === "sample"
              ? "live feed unavailable"
              : `ALT ${iss.data.altitudeKm.toFixed(0)} KM · ${iss.data.velocityKmh.toFixed(0)} KM/H`}
          </div>
        </div>

        <div className="border-l border-edge px-5 py-4">
          <div className="mono-label mb-1.5">Moon right now</div>
          <div className="flex items-center gap-3">
            <MoonGlyph date={now} />
            <div>
              <div className="text-sm text-star">{moon?.name ?? "—"}</div>
              <div className="font-mono text-[10px] text-faint tabular-nums">
                {moon ? `${(moon.illumination * 100).toFixed(0)}% illuminated · ${moon.ageDays.toFixed(1)} d old` : ""}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-edge px-5 py-4 md:border-l">
          <div className="mono-label mb-1.5">Meteors</div>
          {activeShower ? (
            <div className="text-sm text-live">
              {activeShower.name} active
              <span className="ml-2 font-mono text-[10px] text-faint">
                ends in {endInDays(activeShower, now!)} d
              </span>
            </div>
          ) : nextShower ? (
            <div className="text-sm text-star">
              {nextShower.name} peak
              <span className="ml-2 font-mono text-[10px] text-faint">in {daysUntilPeak(nextShower.peakMonth, nextShower.peakDay)} days</span>
            </div>
          ) : null}
          <div className="font-mono text-[10px] text-faint">AMS / IMO annual calendar</div>
        </div>

        <div className="border-l border-t border-edge px-5 py-4">
          <div className="mono-label mb-1.5">Station crew</div>
          <div className="text-sm text-star">Live aboard</div>
          <div className="font-mono text-[10px] text-faint">
            tracked continuously since Nov 2000 · <a href="/observatory" className="text-cyan/80 hover:text-cyan">view station →</a>
          </div>
        </div>
      </div>
    </div>
  );
}
