"use client";

import { useState } from "react";
import { useLiveData, ageOf, type DataState } from "@/hooks/use-live-data";
import { searchNasaImages, type NasaImageItem } from "@/lib/nasa";
import { DEEP_SKY_OBJECTS, type DeepSkyObject } from "@/data/deepspace";
import { Panel, StatusBadge, SourceChip, Spinner } from "@/components/ui";

/* One image per featured object, resolved through the NASA Image Library. */
function ObjectImage({ o, className }: { o: DeepSkyObject; className?: string }) {
  const q = useLiveData<NasaImageItem[]>(
    `img:${o.imageQuery}`,
    () => searchNasaImages(o.imageQuery, 3),
    { fallback: [] }
  );
  const item = q.data[0];

  if (q.state === "loading") {
    return (
      <div className={`flex items-center justify-center bg-abyss ${className ?? ""}`}>
        <Spinner label="Archive" />
      </div>
    );
  }
  if (!item) {
    return (
      <div
        className={`flex items-center justify-center bg-abyss ${className ?? ""}`}
        style={{ background: `radial-gradient(circle at 45% 40%, ${o.accent}22, #060c1c 70%)` }}
      >
        <span className="mono-label">Archive offline</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.thumb}
      alt={`${o.name} — ${item.title}`}
      className={`block object-cover ${className ?? ""}`}
      loading="lazy"
    />
  );
}

export function DeepSpaceGallery() {
  const [open, setOpen] = useState<DeepSkyObject | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {DEEP_SKY_OBJECTS.map((o) => (
          <button
            key={o.name}
            onClick={() => setOpen(o)}
            className="group panel relative flex h-72 flex-col overflow-hidden text-left"
            aria-label={`Open details for ${o.name}`}
          >
            <ObjectImage o={o} className="absolute inset-0 h-full w-full opacity-70 transition-all duration-700 group-hover:scale-105 group-hover:opacity-90" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-transparent via-void/30 to-void" />
            <div className="relative mt-auto p-4">
              <div className="mono-label" style={{ color: o.accent }}>
                {o.catalog} · {o.kind}
              </div>
              <div className="mt-1 font-display text-lg font-semibold text-star">{o.name}</div>
              <div className="font-mono text-[10px] text-dim">{o.distance}</div>
            </div>
          </button>
        ))}
      </div>

      {/* lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-void/90 p-4 backdrop-blur-none md:p-10"
          role="dialog"
          aria-modal="true"
          aria-label={open.name}
          onClick={() => setOpen(null)}
        >
          <div
            className="panel hud-corners grid max-h-full w-full max-w-4xl overflow-y-auto md:grid-cols-[1.2fr_1fr]"
            onClick={(e) => e.stopPropagation()}
          >
            <ObjectImage o={open} className="min-h-64 w-full md:min-h-full" />
            <div className="flex flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="mono-label" style={{ color: open.accent }}>
                    {open.catalog} · {open.kind}
                  </div>
                  <h3 className="mt-1 font-display text-2xl font-semibold text-star">{open.name}</h3>
                </div>
                <button
                  onClick={() => setOpen(null)}
                  className="mono-label text-faint hover:text-worm"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3">
                {[
                  ["Distance", open.distance],
                  ["Size", open.size],
                  ["Constellation", open.constellation],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="mono-label mb-0.5">{k}</dt>
                    <dd className="font-mono text-xs text-star">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-sm leading-relaxed text-dim">{open.description}</p>
              <p className="mt-3 border-l-2 border-cyan/50 pl-3 text-xs leading-relaxed text-star/90 italic">
                {open.fact}
              </p>
              <div className="mt-auto pt-5">
                <SourceChip source="NASA Image Library" href="https://images.nasa.gov" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
