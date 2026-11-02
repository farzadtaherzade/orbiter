"use client";

import { useMemo, useState } from "react";
import { SCALE_OBJECTS, SCALE_MIN, SCALE_MAX, formatSize } from "@/data/scale";
import { Panel } from "@/components/ui";

const DOMAIN_COLOR: Record<string, string> = {
  quantum: "#c084fc",
  microscopic: "#67e8f9",
  human: "#34d399",
  planetary: "#4d8dff",
  stellar: "#ffb454",
  galactic: "#a78bfa",
  cosmic: "#fc3d21",
};

export function ScaleExplorer() {
  const [log, setLog] = useState(0.23); // log10 meters — starts at a human
  const [compareWith, setCompareWith] = useState<string | null>(null);

  const sorted = useMemo(() => [...SCALE_OBJECTS].sort((a, b) => a.size - b.size), []);
  const pos = Math.pow(10, log);

  // nearest objects below and above the scanline
  const below = [...sorted].reverse().find((o) => o.size <= pos) ?? sorted[0];
  const above = sorted.find((o) => o.size > pos) ?? sorted[sorted.length - 1];
  const nearest = pos / below.size <= above.size / pos ? below : above;

  const compareObj = compareWith ? sorted.find((o) => o.name === compareWith) : null;

  return (
    <div className="flex flex-col gap-6">
      <Panel corners className="p-6 md:p-8">
        {/* readout */}
        <div className="text-center">
          <div className="mono-label">The universe at this scale</div>
          <div className="mt-2 font-display text-4xl font-bold text-glow text-cyan tabular-nums md:text-5xl">
            {formatSize(pos)}
          </div>
          <div className="mono-label mt-2">10^{log.toFixed(1)} meters</div>
        </div>

        {/* scanline slider */}
        <div className="mt-8">
          <input
            type="range"
            min={SCALE_MIN}
            max={SCALE_MAX}
            step={0.01}
            value={log}
            onChange={(e) => setLog(Number(e.target.value))}
            className="w-full"
            aria-label="Cosmic scale slider — drag to travel from quantum scales to the observable universe"
            aria-valuetext={formatSize(pos)}
          />
          <div className="mt-2 flex justify-between font-mono text-[9px] tracking-widest text-faint uppercase">
            <span>10⁻¹⁵ m · proton</span>
            <span>10⁶ m · planets</span>
            <span>10²⁷ m · observable universe</span>
          </div>
        </div>

        {/* nearest neighbors */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[below, above].map((o, i) => (
            <div key={o.name} className={`panel p-4 ${i === 0 ? "" : "border-cyan/30"}`}>
              <div className="mono-label" style={{ color: DOMAIN_COLOR[o.domain] }}>
                {i === 0 ? "↓ just below" : "↑ just above"}
              </div>
              <div className="mt-1 flex items-baseline justify-between gap-2">
                <span className="font-display text-lg font-semibold text-star">{o.name}</span>
                <span className="font-mono text-[11px] text-dim tabular-nums">{formatSize(o.size)}</span>
              </div>
              <p className="mt-1 text-xs text-dim">{o.note}</p>
              <button
                onClick={() => setLog(Math.log10(o.size))}
                className="mono-label mt-2 text-cyan hover:text-star"
              >
                Jump to this scale →
              </button>
            </div>
          ))}
        </div>

        {/* compare */}
        <div className="mt-6 border-t border-edge pt-5">
          <label htmlFor="compare" className="mono-label mb-1.5 block">
            Compare with {nearest.name}
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <select
              id="compare"
              value={compareWith ?? ""}
              onChange={(e) => setCompareWith(e.target.value || null)}
              className="panel px-3 py-2 font-mono text-xs text-star focus:border-cyan focus:outline-none"
            >
              <option value="">Choose an object…</option>
              {sorted.map((o) => (
                <option key={o.name} value={o.name}>
                  {o.name}
                </option>
              ))}
            </select>
            {compareObj && compareObj !== nearest && (
              <button onClick={() => setCompareWith(null)} className="mono-label text-faint hover:text-worm">
                Clear
              </button>
            )}
          </div>
          {compareObj && compareObj !== nearest && (
            <div className="mt-4 flex flex-wrap items-center gap-6">
              {[
                { o: nearest, label: "A" },
                { o: compareObj, label: "B" },
              ].map(({ o }) => (
                <div key={o.name} className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="inline-block rounded-full"
                    style={{
                      width: `${Math.max(10, Math.min(72, Math.log10(o.size) - SCALE_MIN + 6))}px`,
                      height: `${Math.max(10, Math.min(72, Math.log10(o.size) - SCALE_MIN + 6))}px`,
                      background: `radial-gradient(circle at 35% 35%, ${DOMAIN_COLOR[o.domain]}, #0a0f1e 90%)`,
                    }}
                  />
                  <div>
                    <div className="font-mono text-xs text-star">{o.name}</div>
                    <div className="font-mono text-[10px] text-faint">{formatSize(o.size)}</div>
                  </div>
                </div>
              ))}
              <div className="font-mono text-xs text-cyan">
                ratio ≈ 10^{Math.abs(Math.log10(compareObj.size / nearest.size)).toFixed(1)}
                <span className="ml-2 text-faint">
                  ({compareObj.size > nearest.size ? "B is larger" : "A is larger"})
                </span>
              </div>
            </div>
          )}
        </div>
      </Panel>

      {/* full ruler */}
      <Panel className="p-6">
        <div className="mono-label mb-4">The whole ruler — click any object to travel there</div>
        <div className="relative h-24">
          {sorted.map((o, i) => {
            const x = ((Math.log10(o.size) - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
            const flip = i % 2 === 0;
            return (
              <button
                key={o.name}
                onClick={() => setLog(Math.log10(o.size))}
                className="group absolute bottom-0 flex flex-col items-center"
                style={{ left: `${x}%`, transform: "translateX(-50%)" }}
                aria-label={`Jump to ${o.name} at ${formatSize(o.size)}`}
              >
                <span
                  className={`mb-1 max-w-24 truncate font-mono text-[9px] transition-all group-hover:max-w-none group-hover:text-cyan ${
                    flip ? "order-2 mt-1" : ""
                  } ${flip ? "" : ""}`}
                >
                  {flip ? "" : o.name}
                </span>
                <span
                  aria-hidden
                  className={`block rounded-full transition-transform group-hover:scale-150 ${
                    flip ? "order-1" : ""
                  }`}
                  style={{
                    width: 7,
                    height: 7,
                    background: DOMAIN_COLOR[o.domain],
                    boxShadow: `0 0 8px ${DOMAIN_COLOR[o.domain]}66`,
                  }}
                />
                {flip && <span className="mt-1 font-mono text-[9px] text-dim group-hover:text-cyan">{o.name}</span>}
              </button>
            );
          })}
          <div aria-hidden className="absolute inset-x-0 bottom-3 h-px bg-edge" />
        </div>
        <div className="mt-2 flex justify-between font-mono text-[9px] text-faint">
          <span>quantum</span>
          <span>human</span>
          <span>planetary</span>
          <span>stellar</span>
          <span>cosmic</span>
        </div>
      </Panel>
    </div>
  );
}
