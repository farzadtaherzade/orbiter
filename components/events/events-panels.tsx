"use client";

import { useNow } from "@/hooks/use-now";
import { METEOR_SHOWERS, isShowerActive, UPCOMING_ECLIPSES } from "@/data/events";
import { Panel, Chip, SourceChip } from "@/components/ui";
import { NeoPanel, SolarActivityPanel } from "@/components/observatory/panels";

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

function monthFrac(m: number, d: number): number {
  const start = new Date(2026, m - 1, d).getTime();
  const yearStart = new Date(2026, 0, 1).getTime();
  const yearLen = new Date(2027, 0, 1).getTime() - yearStart;
  return (start - yearStart) / yearLen;
}

function daysUntil(dateIso: string, nowMs: number): number {
  return Math.ceil((Date.parse(dateIso + "T00:00:00Z") - nowMs) / 86400000);
}

export function MeteorCalendar() {
  const now = useNow();
  const activeOf = (s: Parameters<typeof isShowerActive>[0]) => (now ? isShowerActive(s, now) : false);
  const nowFrac = now ? monthFrac(now.getMonth() + 1, now.getDate()) : -1;

  return (
    <Panel corners className="p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-display text-xl font-semibold text-star">Annual meteor calendar</h3>
          <p className="mt-1 text-xs text-dim">
            Active windows for the year’s major showers — the marker shows today.
          </p>
        </div>
        <SourceChip source="American Meteor Society" href="https://www.amsmeteors.org/meteor-showers/meteor-calendar/" />
      </div>

      <div className="relative overflow-x-auto">
        <div className="min-w-[680px]">
          {/* month ruler */}
          <div className="mb-2 flex pl-40">
            {MONTHS.map((m, i) => (
              <div key={i} className="mono-label flex-1 text-center">
                {m}
              </div>
            ))}
          </div>

          <div className="relative space-y-2">
            {/* today marker */}
            {nowFrac >= 0 && (
              <div
                aria-hidden
                className="absolute top-0 bottom-0 z-10 w-px bg-cyan/80"
                style={{
                  left: `calc(10rem + (100% - 10rem - 7rem) * ${nowFrac})`,
                }}
              />
            )}
            {METEOR_SHOWERS.map((s) => {
              const active = activeOf(s);
              const startF = monthFrac(s.startMonth, s.startDay);
              const endF = monthFrac(s.endMonth, s.endDay);
              const width = endF >= startF ? endF - startF : 1 - startF + endF;
              const wraps = endF < startF;
              return (
                <div key={s.name} className="flex items-center gap-4">
                  <div className="flex w-36 shrink-0 items-center gap-2">
                    <span
                      aria-hidden
                      className={`h-1.5 w-1.5 rounded-full ${active ? "bg-live" : "bg-edge"}`}
                    />
                    <span className={`font-mono text-[11px] ${active ? "text-live" : "text-dim"}`}>
                      {s.name}
                    </span>
                  </div>
                  <div className="relative h-4 flex-1 rounded bg-edge/30">
                    {wraps ? (
                      <>
                        <div
                          className={`absolute top-0 h-full rounded ${active ? "bg-live/60" : "bg-cyan/25"}`}
                          style={{ left: `${startF * 100}%`, width: `${(1 - startF) * 100}%` }}
                        />
                        <div
                          className={`absolute top-0 h-full rounded ${active ? "bg-live/60" : "bg-cyan/25"}`}
                          style={{ left: 0, width: `${endF * 100}%` }}
                        />
                      </>
                    ) : (
                      <div
                        className={`absolute top-0 h-full rounded ${active ? "bg-live/60" : "bg-cyan/25"}`}
                        style={{ left: `${startF * 100}%`, width: `${Math.max(width * 100, 1)}%` }}
                      />
                    )}
                    {/* peak tick */}
                    <div
                      aria-hidden
                      className={`absolute top-[-2px] h-[20px] w-px ${active ? "bg-live" : "bg-cyan/70"}`}
                      style={{ left: `${monthFrac(s.peakMonth, s.peakDay) * 100}%` }}
                    />
                  </div>
                  <div className="w-28 shrink-0 text-right font-mono text-[10px] text-faint tabular-nums">
                    ZHR {s.zhr}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* active detail cards */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {(now
          ? METEOR_SHOWERS.filter((s) => isShowerActive(s, now))
              .concat(METEOR_SHOWERS.filter((s) => !isShowerActive(s, now)))
          : METEOR_SHOWERS
        )
          .slice(0, 3)
          .map((s) => {
            const active = now ? isShowerActive(s, now) : false;
            return (
              <div key={s.name} className={`panel p-4 ${active ? "border-live/40" : ""}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-base font-semibold text-star">{s.name}</span>
                  {active && <Chip tone="cyan">Active now</Chip>}
                </div>
                <dl className="mt-3 space-y-1.5">
                  <div className="flex justify-between font-mono text-[11px]">
                    <dt className="text-faint">Peak</dt>
                    <dd className="text-star">
                      {new Date(2026, s.peakMonth - 1, s.peakDay).toLocaleDateString("en-US", {
                        month: "short", day: "numeric",
                      })}
                    </dd>
                  </div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <dt className="text-faint">Zenithal rate</dt>
                    <dd className="text-star">~{s.zhr}/hour</dd>
                  </div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <dt className="text-faint">Parent body</dt>
                    <dd className="text-star">{s.parent}</dd>
                  </div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <dt className="text-faint">Best from</dt>
                    <dd className="text-star">{s.bestFrom}</dd>
                  </div>
                </dl>
              </div>
            );
          })}
      </div>
    </Panel>
  );
}

export function EclipseTable() {
  const now = useNow();

  return (
    <Panel corners className="p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-display text-xl font-semibold text-star">Upcoming eclipses</h3>
          <p className="mt-1 text-xs text-dim">
            The next seven eclipses visible from Earth. The August 2027 total is
            the longest until 2114.
          </p>
        </div>
        <SourceChip source="NASA Eclipse Web Site" href="https://science.nasa.gov/eclipses/" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-edge">
              <th className="mono-label py-2 pr-4 font-normal">Date</th>
              <th className="mono-label py-2 pr-4 font-normal">Countdown</th>
              <th className="mono-label py-2 pr-4 font-normal">Type</th>
              <th className="mono-label py-2 pr-4 font-normal">Visibility</th>
              <th className="mono-label py-2 font-normal">Note</th>
            </tr>
          </thead>
          <tbody>
            {(now ? UPCOMING_ECLIPSES.filter((e) => daysUntil(e.date, now.getTime()) > -2) : UPCOMING_ECLIPSES).map((e) => {
              const d = now ? daysUntil(e.date, now.getTime()) : null;
              return (
                <tr key={e.date + e.type} className="border-b border-edge/60">
                  <td className="py-3 pr-4 font-mono text-xs text-star tabular-nums">
                    {new Date(e.date + "T00:00:00Z").toLocaleDateString("en-US", {
                      year: "numeric", month: "short", day: "numeric", timeZone: "UTC",
                    })}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-cyan tabular-nums">
                    {d === null ? "—" : `in ${d} days`}
                  </td>
                  <td className="py-3 pr-4">
                    <Chip tone={e.type === "Total" ? "red" : e.kind === "solar" ? "amber" : "default"}>
                      {e.kind === "solar" ? "☀ " : "☾ "}{e.type} {e.kind}
                    </Chip>
                  </td>
                  <td className="py-3 pr-4 text-xs text-dim">{e.path}</td>
                  <td className="py-3 text-xs text-dim italic">{e.note ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function EventsGrid() {
  return (
    <div className="flex flex-col gap-6">
      <MeteorCalendar />
      <div className="grid gap-6 lg:grid-cols-2">
        <NeoPanel />
        <SolarActivityPanel />
      </div>
      <EclipseTable />
    </div>
  );
}
