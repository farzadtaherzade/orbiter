"use client";

import { useState } from "react";
import { useLiveData, ageOf, type DataState } from "@/hooks/use-live-data";
import {
  fetchApod,
  fetchNeoFeed,
  fetchSolarFlares,
  fetchEonetEvents,
  getNasaKey,
  setNasaKey,
  type Apod,
  type NeoObject,
  type SolarFlare,
  type EonetEvent,
} from "@/lib/nasa";
import { SAMPLE_APOD, SAMPLE_NEOS, SAMPLE_FLARES, SAMPLE_EONET } from "@/data/fallbacks";
import { Panel, StatusBadge, SourceChip, Chip, Spinner } from "@/components/ui";

/* ── Astronomy Picture of the Day ─────────────────────────────── */

export function ApodPanel() {
  const apod = useLiveData<Apod>("apod", () => fetchApod(), {
    pollMs: 30 * 60_000,
    fallback: SAMPLE_APOD,
  });
  const [hd, setHd] = useState(false);

  const src = hd && apod.data.hdurl ? apod.data.hdurl : apod.data.url;

  return (
    <Panel corners className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-edge px-5 py-3">
        <h3 className="font-display text-lg font-semibold text-star">
          Astronomy Picture of the Day
        </h3>
        <StatusBadge state={apod.state as DataState} age={ageOf(apod.fetchedAt)} />
      </div>

      {apod.data.media_type === "video" ? (
        <div className="flex h-72 items-center justify-center bg-abyss">
          <a href={apod.data.url} target="_blank" rel="noopener noreferrer" className="mono-label text-cyan hover:text-star">
            Watch today’s video ↗
          </a>
        </div>
      ) : (
        <button
          onClick={() => setHd(!hd)}
          className="relative block w-full cursor-zoom-in"
          aria-label={hd ? "Show standard resolution image" : "Show high resolution image"}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={apod.data.title}
            className={`block w-full object-cover transition-all duration-700 ${
              hd ? "max-h-[560px]" : "max-h-[420px]"
            }`}
            loading="lazy"
          />
          <span className="mono-label absolute right-3 bottom-3 bg-void/80 px-2 py-1 text-cyan">
            {hd ? "HD" : "SD"} · click to switch
          </span>
        </button>
      )}

      <div className="p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h4 className="font-display text-xl font-semibold text-star">{apod.data.title}</h4>
          <span className="font-mono text-[10px] text-faint tabular-nums">{apod.data.date}</span>
        </div>
        <p className="mt-3 max-h-44 overflow-y-auto pr-2 text-sm leading-relaxed text-dim">
          {apod.data.explanation}
        </p>
        <div className="mt-4 flex items-center justify-between">
          {apod.data.copyright ? (
            <span className="font-mono text-[10px] text-faint">© {apod.data.copyright}</span>
          ) : (
            <span />
          )}
          <SourceChip source="NASA APOD" href="https://apod.nasa.gov/apod/astropix.html" />
        </div>
      </div>
    </Panel>
  );
}

/* ── Near-Earth objects ───────────────────────────────────────── */

const LD_KM = 384400;

export function NeoPanel() {
  const neo = useLiveData<NeoObject[]>("neo-feed", () => fetchNeoFeed(4), {
    pollMs: 30 * 60_000,
    fallback: SAMPLE_NEOS,
  });
  const [hazardOnly, setHazardOnly] = useState(false);

  const list = neo.data.filter((n) => !hazardOnly || n.hazardous).slice(0, 12);
  const maxLd = Math.max(...list.map((n) => n.missDistanceKm / LD_KM), 1);

  return (
    <Panel corners className="p-5">
      <div className="mb-1 flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-star">Near-Earth asteroids</h3>
        <StatusBadge state={neo.state as DataState} age={ageOf(neo.fetchedAt)} />
      </div>
      <p className="mb-4 text-xs leading-relaxed text-dim">
        Close approaches in the next four days, sorted by miss distance.
        LD = lunar distance (384,400 km).
      </p>

      {neo.state === "loading" ? (
        <Spinner label="Querying NeoWs" />
      ) : (
        <>
          <div className="mb-3">
            <button
              onClick={() => setHazardOnly(!hazardOnly)}
              aria-pressed={hazardOnly}
              className={`mono-label border px-2.5 py-1 transition-colors ${
                hazardOnly ? "border-worm/60 text-worm" : "border-edge text-faint hover:text-dim"
              }`}
            >
              {hazardOnly ? "◉" : "○"} Potentially hazardous only
            </button>
          </div>

          <ul className="space-y-3">
            {list.map((n) => {
              const ld = n.missDistanceKm / LD_KM;
              // JPL full format "2026-Nov-07 12:34" or plain "2026-11-07"
              const d = /^\d{4}-\d{2}-\d{2}$/.test(n.closeApproachDate)
                ? new Date(n.closeApproachDate)
                : new Date(n.closeApproachDate.replace(/-/g, " "));
              const when = isNaN(d.getTime())
                ? n.closeApproachDate
                : d.toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
              return (
                <li key={n.id} className="border-b border-edge/60 pb-3 last:border-0 last:pb-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="font-mono text-xs text-star">{n.name}</span>
                    <span className="font-mono text-[10px] text-faint tabular-nums">{when}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3">
                    <div className="h-1 flex-1 overflow-hidden rounded bg-edge/60">
                      <div
                        className={`h-full ${n.hazardous ? "bg-worm/80" : "bg-cyan/60"}`}
                        style={{ width: `${Math.max(2, (ld / maxLd) * 100)}%` }}
                      />
                    </div>
                    <span className="w-24 text-right font-mono text-[10px] text-cyan tabular-nums">
                      {ld < 10 ? ld.toFixed(2) : ld.toFixed(1)} LD
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Chip>
                      ⌀ {(n.diameterMinKm * 1000).toFixed(0)}–{(n.diameterMaxKm * 1000).toFixed(0)} m
                    </Chip>
                    <Chip>{Math.round(n.velocityKmh).toLocaleString()} km/h</Chip>
                    {n.hazardous && <Chip tone="red">Hazardous</Chip>}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-4">
            <SourceChip source="NASA NeoWs" href="https://ssd-api.jpl.nasa.gov/doc/cad.html" />
          </div>
        </>
      )}
    </Panel>
  );
}

/* ── Solar activity ───────────────────────────────────────────── */

export function SolarActivityPanel() {
  const flares = useLiveData<SolarFlare[]>("donki-flares", () => fetchSolarFlares(30), {
    pollMs: 15 * 60_000,
    fallback: SAMPLE_FLARES,
  });
  const [sdoOk, setSdoOk] = useState(true);

  const flareClassTone = (c: string) =>
    c.startsWith("X") ? "red" : c.startsWith("M") ? "amber" : "default";

  return (
    <Panel corners className="p-5">
      <div className="mb-1 flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-star">Solar activity</h3>
        <StatusBadge state={flares.state as DataState} age={ageOf(flares.fetchedAt)} />
      </div>
      <p className="mb-4 text-xs leading-relaxed text-dim">
        Solar flares from the last 30 days. X-class flares are the most powerful
        classification; the 2003 sample event was one of the largest ever recorded.
      </p>

      <div className="mb-5 flex items-start gap-4">
        {sdoOk && (
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://sdo.gsfc.nasa.gov/assets/img/latest/latest_256_0193.jpg"
              alt="Current image of the Sun from NASA's SDO observatory, 193 Ångström channel"
              className="h-28 w-28 rounded-full border border-amber/30 object-cover"
              onError={() => setSdoOk(false)}
              loading="lazy"
            />
            <span className="mono-label absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
              SDO live · 193 Å
            </span>
          </div>
        )}
        <ul className="flex-1 space-y-2">
          {flares.data.slice(0, 6).map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Chip tone={flareClassTone(f.classType) as "red" | "amber" | "default"}>
                  {f.classType}
                </Chip>
                <span className="font-mono text-[10px] text-dim tabular-nums">
                  {f.peakTime.slice(0, 16).replace("T", " ")} UTC
                </span>
              </div>
              <span className="font-mono text-[10px] text-faint">
                {f.sourceLocation ?? "—"} {f.activeRegion ? `· AR${f.activeRegion}` : ""}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <SourceChip source="NASA DONKI + SDO" href="https://kauai.ccmc.gsfc.nasa.gov/DONKI/" />
    </Panel>
  );
}

/* ── EONET natural events ─────────────────────────────────────── */

export function EonetPanel() {
  const events = useLiveData<EonetEvent[]>("eonet", () => fetchEonetEvents(10), {
    pollMs: 15 * 60_000,
    fallback: SAMPLE_EONET,
  });

  return (
    <Panel corners className="p-5">
      <div className="mb-1 flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-star">Earth natural events</h3>
        <StatusBadge state={events.state as DataState} age={ageOf(events.fetchedAt)} />
      </div>
      <p className="mb-4 text-xs leading-relaxed text-dim">
        Open natural events tracked by NASA’s Earth Observatory — wildfires,
        eruptions, storms and more.
      </p>
      <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
        {events.data.map((e) => (
          <li key={e.id}>
            <a
              href={e.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-baseline justify-between gap-3 border-b border-edge/50 pb-2 last:border-0"
            >
              <span className="text-xs text-star transition-colors group-hover:text-cyan">
                {e.title}
              </span>
              <span className="shrink-0 font-mono text-[10px] text-faint">
                {e.category} · {e.date.slice(0, 10)}
              </span>
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <SourceChip source="NASA EONET v3" href="https://eonet.gsfc.nasa.gov/" />
      </div>
    </Panel>
  );
}

/* ── API key settings ─────────────────────────────────────────── */

export function ApiKeyPanel() {
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <Panel className="p-5">
      <h3 className="font-display text-lg font-semibold text-star">NASA API key</h3>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-dim">
        NASA’s public <span className="font-mono text-cyan">DEMO_KEY</span> is shared by
        everyone and rate-limited (30 requests/hour). When it is exhausted, this site
        shows clearly-labeled archived samples. For always-live data,{" "}
        <a
          href="https://api.nasa.gov/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan hover:underline"
        >
          get a free personal key
        </a>{" "}
        and paste it below — it is stored only in your browser.
      </p>
      <div className="mt-4 flex max-w-md gap-2">
        <input
          type="password"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(false);
          }}
          placeholder={getNasaKey()}
          aria-label="NASA API key"
          className="panel flex-1 px-3 py-2 font-mono text-xs text-star placeholder:text-faint focus:border-cyan focus:outline-none"
        />
        <button
          onClick={() => {
            setNasaKey(value);
            setSaved(true);
          }}
          className="mono-label border border-cyan/60 px-4 text-cyan transition-colors hover:bg-cyan/10"
        >
          {saved ? "Saved ✓" : "Save"}
        </button>
        {getNasaKey() !== "DEMO_KEY" && (
          <button
            onClick={() => {
              setNasaKey("");
              setValue("");
              setSaved(true);
            }}
            className="mono-label border border-edge px-4 text-faint transition-colors hover:text-worm"
          >
            Clear
          </button>
        )}
      </div>
    </Panel>
  );
}
