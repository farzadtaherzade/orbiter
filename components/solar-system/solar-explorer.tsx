"use client";

import { useState } from "react";
import { LazyCanvas } from "@/components/three/scene";
import { SolarScene, type SolarControls } from "./solar-scene";
import { PLANETS, SUN, formatBig } from "@/data/planets";
import { Panel, SourceChip, Chip } from "@/components/ui";

function Toggle({
  label,
  on,
  onChange,
}: {
  label: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      aria-pressed={on}
      className={`mono-label border px-3 py-1.5 transition-colors ${
        on ? "border-cyan/60 text-cyan" : "border-edge text-faint hover:text-dim"
      }`}
    >
      {on ? "◉" : "○"} {label}
    </button>
  );
}

const DEFAULT_CONTROLS: SolarControls = {
  playing: true,
  daysPerSecond: 8,
  showOrbits: true,
  showLabels: true,
  realisticScale: false,
};

export function SolarExplorer() {
  const [controls, setControls] = useState<SolarControls>(DEFAULT_CONTROLS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const set = <K extends keyof SolarControls>(k: K, v: SolarControls[K]) =>
    setControls((c) => ({ ...c, [k]: v }));

  const planet = PLANETS.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <LazyCanvas
          className="panel h-[74vh] min-h-[480px] w-full"
          camera={{ position: [0, 16, 34], fov: 46 }}
          dpr={[1, 1.5]}
          ariaLabel="Interactive 3D solar system with all eight planets orbiting the Sun at their real relative speeds"
        >
          <SolarScene controls={controls} selectedId={selectedId} onSelect={setSelectedId} />
        </LazyCanvas>

        {/* toolbar */}
        <div className="panel absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 p-3">
          <button
            onClick={() => set("playing", !controls.playing)}
            className="mono-label border border-cyan/60 px-3 py-1.5 text-cyan"
            aria-label={controls.playing ? "Pause orbits" : "Resume orbits"}
          >
            {controls.playing ? "❚❚ Pause" : "▶ Play"}
          </button>
          <div className="flex items-center gap-2 px-2">
            <label htmlFor="speed" className="mono-label">
              Speed
            </label>
            <input
              id="speed"
              type="range"
              min={1}
              max={60}
              step={1}
              value={controls.daysPerSecond}
              onChange={(e) => set("daysPerSecond", Number(e.target.value))}
              className="w-24"
              aria-label="Orbital speed in simulated days per second"
            />
            <span className="font-mono text-[10px] text-cyan tabular-nums">
              {controls.daysPerSecond} d/s
            </span>
          </div>
          <Toggle label="Orbits" on={controls.showOrbits} onChange={(v) => set("showOrbits", v)} />
          <Toggle label="Labels" on={controls.showLabels} onChange={(v) => set("showLabels", v)} />
          <Toggle
            label="Realistic scale"
            on={controls.realisticScale}
            onChange={(v) => set("realisticScale", v)}
          />
        </div>

        {controls.realisticScale && (
          <div className="mono-label absolute top-20 left-4 z-10 max-w-xs text-amber">
            True scale mode · 1 AU = 10 units. Notice how empty the system really is —
            the planets are now dots.
          </div>
        )}

        {/* selected planet panel */}
        {planet && (
          <div className="panel hud-corners absolute top-4 right-4 z-10 max-h-[calc(100%-2rem)] w-[320px] overflow-y-auto p-5">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="mono-label text-cyan">{planet.tagline}</div>
                <h3 className="font-display text-2xl font-semibold text-star">{planet.name}</h3>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="mono-label text-faint hover:text-worm"
                aria-label={`Close ${planet.name} details`}
              >
                ✕
              </button>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-dim">{planet.description}</p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              {[
                ["Diameter", `${planet.diameterKm.toLocaleString()} km`],
                ["Mass", `${planet.massEarth} × Earth`],
                ["Gravity", `${planet.gravity} m/s²`],
                ["Day", `${Math.abs(planet.rotationHours) < 48 ? Math.abs(planet.rotationHours).toFixed(1) + " h" : (Math.abs(planet.rotationHours) / 24).toFixed(0) + " d"}${planet.rotationHours < 0 ? " ↺" : ""}`],
                ["Year", planet.orbitDays >= 1000 ? `${(planet.orbitDays / 365.25).toFixed(1)} yr` : `${planet.orbitDays} d`],
                ["Distance", `${planet.distanceMkm.toLocaleString()} M km`],
                ["Mean temp", `${planet.tempC}°C`],
                ["Moons", String(planet.moons)],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="mono-label mb-0.5">{k}</dt>
                  <dd className="font-mono text-xs text-star tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4">
              <SourceChip source="NASA planetary fact sheet" href="https://science.nasa.gov/solar-system/planets/" />
            </div>
          </div>
        )}
      </div>

      {/* quick select chips */}
      <div className="flex flex-wrap gap-2">
        {PLANETS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedId(selectedId === p.id ? null : p.id)}
            aria-pressed={selectedId === p.id}
            className={`flex items-center gap-2 border px-3 py-1.5 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors ${
              selectedId === p.id
                ? "border-cyan text-cyan"
                : "border-edge text-dim hover:border-dim hover:text-star"
            }`}
          >
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: p.color }}
            />
            {p.name}
          </button>
        ))}
      </div>

      {/* comparison */}
      <Comparison />
    </div>
  );
}

function Comparison() {
  const [picked, setPicked] = useState<string[]>(["earth", "mars", "jupiter"]);
  const toggle = (id: string) =>
    setPicked((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= 4 ? cur : [...cur, id]
    );
  const chosen = PLANETS.filter((p) => picked.includes(p.id));
  const maxD = Math.max(...chosen.map((p) => p.diameterKm), 1);

  return (
    <Panel corners className="p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-display text-xl font-semibold text-star">Planet comparison</h3>
          <p className="mt-1 text-xs text-dim">Pick up to four worlds to compare, to scale.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PLANETS.map((p) => (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              aria-pressed={picked.includes(p.id)}
              className={`mono-label border px-2 py-1 transition-colors ${
                picked.includes(p.id) ? "border-cyan/70 text-cyan" : "border-edge text-faint hover:text-dim"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {chosen.length > 0 && (
        <div className="mb-8 flex flex-wrap items-end gap-6">
          {chosen.map((p) => (
            <div key={p.id} className="flex min-w-32 flex-col items-center gap-3">
              <div
                className="rounded-full border"
                style={{
                  width: `${Math.max(14, (p.diameterKm / maxD) * 130)}px`,
                  height: `${Math.max(14, (p.diameterKm / maxD) * 130)}px`,
                  background: `radial-gradient(circle at 32% 30%, ${p.color}, #0a0f1e 90%)`,
                  borderColor: `${p.color}66`,
                }}
                aria-hidden
              />
              <div className="text-center">
                <div className="font-mono text-[11px] text-star">{p.name}</div>
                <div className="font-mono text-[10px] text-faint tabular-nums">
                  {p.diameterKm.toLocaleString()} km
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-edge">
              <th className="mono-label py-2 pr-4 font-normal">World</th>
              <th className="mono-label py-2 pr-4 font-normal">Diameter</th>
              <th className="mono-label py-2 pr-4 font-normal">Mass (Earth=1)</th>
              <th className="mono-label py-2 pr-4 font-normal">Gravity</th>
              <th className="mono-label py-2 pr-4 font-normal">Day</th>
              <th className="mono-label py-2 pr-4 font-normal">Year</th>
              <th className="mono-label py-2 pr-4 font-normal">Mean temp</th>
              <th className="mono-label py-2 font-normal">Moons</th>
            </tr>
          </thead>
          <tbody>
            {chosen.map((p) => (
              <tr key={p.id} className="border-b border-edge/60 font-mono text-xs tabular-nums">
                <td className="py-2.5 pr-4 text-star" style={{ color: p.color }}>
                  {p.name}
                </td>
                <td className="py-2.5 pr-4 text-dim">{p.diameterKm.toLocaleString()} km</td>
                <td className="py-2.5 pr-4 text-dim">{p.massEarth}</td>
                <td className="py-2.5 pr-4 text-dim">{p.gravity} m/s²</td>
                <td className="py-2.5 pr-4 text-dim">
                  {Math.abs(p.rotationHours) < 48
                    ? `${Math.abs(p.rotationHours).toFixed(1)} h`
                    : `${(Math.abs(p.rotationHours) / 24).toFixed(0)} d`}
                </td>
                <td className="py-2.5 pr-4 text-dim">
                  {p.orbitDays >= 1000 ? `${(p.orbitDays / 365.25).toFixed(1)} yr` : `${p.orbitDays} d`}
                </td>
                <td className="py-2.5 pr-4 text-dim">{p.tempC}°C</td>
                <td className="py-2.5 text-dim">{p.moons}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Chip tone="cyan">The Sun: {formatBig(SUN.diameterKm)} km — {SUN.massEarth}× Earth's mass</Chip>
        <SourceChip source="NASA planetary fact sheets" href="https://science.nasa.gov/solar-system/planets/" />
      </div>
    </Panel>
  );
}
