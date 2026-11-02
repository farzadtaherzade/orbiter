"use client";

import { useMemo, useState } from "react";
import { OrbitControls } from "@react-three/drei";
import { EarthGlobe } from "@/components/three/earth-globe";
import { LazyCanvas, StarField } from "@/components/three/scene";
import { useIssPosition, useIssTrack, useIssCrew } from "@/hooks/use-iss";
import { ageOf, type DataState } from "@/hooks/use-live-data";
import { useNow } from "@/hooks/use-now";
import { StatusBadge, Stat, Panel, SourceChip } from "@/components/ui";
import { latLonToVec3, subsolarPoint } from "@/lib/astronomy";

function EarthScene({ timeOverrideMs, issEnabled }: { timeOverrideMs: number | undefined; issEnabled: boolean }) {
  const iss = useIssPosition();
  const track = useIssTrack();

  const trackVecs = useMemo<[number, number, number][] | undefined>(() => {
    if (track.state === "sample" || !track.data.length) return undefined;
    return track.data.map((p) => latLonToVec3(p.lat, p.lon, 1.066));
  }, [track.data, track.state]);

  const showIss = issEnabled && iss.state !== "loading";

  return (
    <>
      <group rotation={[0.1, -1.2, 0.08]}>
        <EarthGlobe
          detail="high"
          autoRotateSpeed={0}
          timeOverrideMs={timeOverrideMs}
          iss={
            showIss
              ? {
                  lat: iss.data.lat,
                  lon: iss.data.lon,
                  altitudeKm: iss.data.altitudeKm,
                  track: trackVecs,
                }
              : null
          }
        />
      </group>
      <StarField count={2200} radius={40} />
      <OrbitControls
        enablePan={false}
        minDistance={1.8}
        maxDistance={7}
        rotateSpeed={0.5}
        zoomSpeed={0.7}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}

function formatUtc(ms: number): string {
  return new Date(ms).toISOString().slice(11, 16) + " UTC";
}

export function EarthExplorer() {
  const iss = useIssPosition();
  const crew = useIssCrew();
  const [timeOffsetHours, setTimeOffsetHours] = useState(0);
  // base captured when the user moves the slider (impure Date.now is fine in events)
  const [offsetBaseMs, setOffsetBaseMs] = useState<number | null>(null);
  const [showIssData, setShowIssData] = useState(true);
  const now = useNow();

  const timeOverrideMs =
    timeOffsetHours === 0
      ? undefined
      : (offsetBaseMs ?? now?.getTime() ?? 0) + timeOffsetHours * 3600_000 || undefined;

  const sun = useMemo(
    () => (now ? subsolarPoint(new Date(now.getTime() + timeOffsetHours * 3600_000)) : null),
    [now, timeOffsetHours]
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* 3D viewport */}
      <div className="relative">
        <LazyCanvas
          className="panel h-[70vh] min-h-[440px] w-full"
          camera={{ position: [0, 0.6, 3.4], fov: 42 }}
          ariaLabel="Interactive 3D Earth with real-time day and night sides and the live ISS position"
        >
          <EarthScene timeOverrideMs={timeOverrideMs} issEnabled={showIssData} />
        </LazyCanvas>

        {/* viewport HUD */}
        <div className="pointer-events-none absolute top-4 left-4 z-10">
          <div className="mono-label text-cyan">Earth · Live Terminator</div>
          <div className="font-mono text-xs text-dim tabular-nums">
            {timeOffsetHours === 0
              ? "rendering real time"
              : `${timeOffsetHours > 0 ? "+" : ""}${timeOffsetHours} h offset`}
          </div>
        </div>

        {/* time scrubber */}
        <div className="panel absolute inset-x-4 bottom-4 z-10 flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between">
            <label htmlFor="time-scrub" className="mono-label">
              Time machine ·{" "}
              {timeOffsetHours === 0
                ? now
                  ? formatUtc(now.getTime())
                  : "—"
                : now
                  ? formatUtc(now.getTime() + timeOffsetHours * 3600_000)
                  : "—"}
            </label>
            {timeOffsetHours !== 0 && (
              <button
                onClick={() => {
                  setTimeOffsetHours(0);
                  setOffsetBaseMs(null);
                }}
                className="mono-label text-cyan hover:text-star"
              >
                Reset to now
              </button>
            )}
          </div>
          <input
            id="time-scrub"
            type="range"
            min={-12}
            max={12}
            step={0.25}
            value={timeOffsetHours}
            onChange={(e) => {
              setOffsetBaseMs(Date.now());
              setTimeOffsetHours(Number(e.target.value));
            }}
            aria-label="Offset the rendered UTC time to preview the day/night terminator"
            className="w-full"
          />
          <div className="flex justify-between font-mono text-[9px] tracking-widest text-faint uppercase">
            <span>−12 h</span>
            <span>now</span>
            <span>+12 h</span>
          </div>
        </div>
      </div>

      {/* telemetry column */}
      <div className="flex flex-col gap-4">
        <Panel corners className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-star">ISS Telemetry</h3>
            <StatusBadge state={iss.state as DataState} age={ageOf(iss.fetchedAt)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Latitude" value={iss.state === "sample" ? "—" : `${iss.data.lat.toFixed(2)}°`} />
            <Stat label="Longitude" value={iss.state === "sample" ? "—" : `${iss.data.lon.toFixed(2)}°`} />
            <Stat label="Altitude" value={iss.state === "sample" ? "—" : iss.data.altitudeKm.toFixed(1)} unit="km" />
            <Stat label="Velocity" value={iss.state === "sample" ? "—" : iss.data.velocityKmh.toFixed(0)} unit="km/h" />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-edge pt-3">
            <span className="mono-label">Sunlight</span>
            <span className={`font-mono text-xs ${iss.data.visibility === "daylight" ? "text-amber" : "text-cyan"}`}>
              {iss.state === "sample" ? "—" : iss.data.visibility === "daylight" ? "IN DAYLIGHT" : "IN EARTH'S SHADOW"}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-edge pt-3">
            <span className="mono-label">Orbit</span>
            <span className="font-mono text-xs text-dim">~92.9 min · 51.6° inclination</span>
          </div>
          <div className="mt-4">
            <SourceChip source="wheretheiss.at" href="https://wheretheiss.at/w/developer" />
          </div>
        </Panel>

        <Panel className="p-5">
          <h3 className="mb-3 font-display text-lg font-semibold text-star">Subsolar Point</h3>
          <p className="mb-3 text-xs leading-relaxed text-dim">
            Where the Sun is directly overhead right now — the center of the
            illuminated hemisphere that drives the terminator you see on the globe.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Sun latitude" value={sun ? `${sun.lat.toFixed(1)}°` : "—"} />
            <Stat label="Sun longitude" value={sun ? `${sun.lon.toFixed(1)}°` : "—"} />
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-star">Humans in Space</h3>
            <StatusBadge state={crew.state as DataState} age={ageOf(crew.fetchedAt)} />
          </div>
          {crew.state === "sample" || crew.data.length === 0 ? (
            <p className="text-xs leading-relaxed text-dim">
              Crew feed is unreachable from this network.
              The station has been continuously crewed since November 2000.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {crew.data.map((c) => (
                <li key={c.name} className="flex items-center justify-between font-mono text-xs">
                  <span className="text-star">{c.name}</span>
                  <span className="text-faint">{c.craft}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3">
            <SourceChip source="open-notify (proxied)" href="http://open-notify.org/Open-Notify-API/People-In-Space/" />
          </div>
        </Panel>

        <button
          onClick={() => setShowIssData(!showIssData)}
          className="mono-label self-start text-faint transition-colors hover:text-cyan"
          aria-pressed={showIssData}
        >
          {showIssData ? "◉" : "○"} ISS overlay enabled
        </button>
      </div>
    </div>
  );
}
