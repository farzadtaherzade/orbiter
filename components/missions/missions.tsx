"use client";

import { useMemo, useState } from "react";
import { MISSIONS, type Mission } from "@/data/missions";
import { useLiveData } from "@/hooks/use-live-data";
import { searchNasaImages, type NasaImageItem } from "@/lib/nasa";
import { Panel, Chip, SourceChip, Chip as ChipT } from "@/components/ui";

const STATUS_TONE = {
  active: "cyan",
  completed: "default",
  upcoming: "amber",
} as const;

const STATUS_LABEL = {
  active: "Active",
  completed: "Completed",
  upcoming: "Upcoming",
} as const;

function MissionImage({ m, className }: { m: Mission; className?: string }) {
  const q = useLiveData<NasaImageItem[]>(`img:${m.imageQuery}`, () => searchNasaImages(m.imageQuery, 3), {
    fallback: [],
  });
  const item = q.data[0];
  if (!item) {
    return (
      <div
        aria-hidden
        className={className}
        style={{
          background:
            "radial-gradient(circle at 35% 35%, #16305e33, #060c1c 70%), linear-gradient(160deg, #0a1226, #060c1c)",
        }}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.thumb}
      alt={`${m.name} — NASA image: ${item.title}`}
      className={className}
      loading="lazy"
    />
  );
}

export function MissionCenter() {
  const [status, setStatus] = useState<"all" | Mission["status"]>("all");
  const [type, setType] = useState<string>("All");
  const [open, setOpen] = useState<Mission | null>(null);

  const types = useMemo(() => ["All", ...new Set(MISSIONS.map((m) => m.type))], []);
  const list = MISSIONS.filter(
    (m) => (status === "all" || m.status === status) && (type === "All" || m.type === type)
  );

  return (
    <div className="flex flex-col gap-6">
      {/* filters */}
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "active", "completed", "upcoming"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            aria-pressed={status === s}
            className={`mono-label border px-3 py-1.5 transition-colors ${
              status === s ? "border-cyan/70 text-cyan" : "border-edge text-faint hover:text-dim"
            }`}
          >
            {s === "all" ? "All" : STATUS_LABEL[s]}
          </button>
        ))}
        <span aria-hidden className="mx-2 h-4 w-px bg-edge" />
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            aria-pressed={type === t}
            className={`mono-label border px-3 py-1.5 transition-colors ${
              type === t ? "border-cyan/70 text-cyan" : "border-edge text-faint hover:text-dim"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((m) => (
          <button
            key={m.id}
            onClick={() => setOpen(m)}
            className="group panel relative flex flex-col overflow-hidden text-left"
            aria-label={`Open ${m.name} mission details`}
          >
            <div className="relative h-40 overflow-hidden">
              <MissionImage
                m={m}
                className="h-full w-full object-cover opacity-75 transition-all duration-700 group-hover:scale-105 group-hover:opacity-95"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-transparent to-panel" />
            </div>
            <div className="flex flex-1 flex-col p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="mono-label">{m.launch}</span>
                <ChipT tone={STATUS_TONE[m.status]}>{STATUS_LABEL[m.status]}</ChipT>
              </div>
              <h3 className="mt-1.5 font-display text-lg font-semibold text-star">{m.name}</h3>
              <p className="mt-1 text-xs leading-relaxed text-dim">{m.highlight}</p>
              <span className="mt-auto pt-3 font-mono text-[10px] tracking-[0.16em] text-faint uppercase transition-colors group-hover:text-cyan">
                Mission file <span aria-hidden>→</span>
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* timeline */}
      <Panel corners className="p-6 md:p-8">
        <h3 className="mb-6 font-display text-xl font-semibold text-star">Six decades of exploration</h3>
        <div className="relative overflow-x-auto pb-2">
          <div className="relative min-w-[760px] pt-8">
            <div aria-hidden className="absolute top-10 right-0 left-0 h-px bg-edge" />
            <div className="relative flex justify-between">
              {MISSIONS.map((m) => {
                const year = m.launch.slice(-4);
                const pos = (Number(year) - 1969) / (2030 - 1969);
                return (
                  <button
                    key={m.id}
                    onClick={() => setOpen(m)}
                    className="group relative flex w-16 flex-col items-center"
                    style={{ position: "absolute", left: `${pos * 100}%`, transform: "translateX(-50%)" }}
                    aria-label={`${m.name}, launched ${m.launch}`}
                  >
                    <span className="mono-label mb-1.5 whitespace-nowrap transition-colors group-hover:text-cyan">
                      {year}
                    </span>
                    <span
                      aria-hidden
                      className={`inline-block h-2.5 w-2.5 rounded-full border transition-all ${
                        m.status === "active"
                          ? "border-cyan bg-cyan group-hover:scale-125"
                          : "border-faint bg-panel group-hover:border-cyan"
                      }`}
                    />
                    <span className="mt-2 h-16 w-px bg-edge/60" aria-hidden />
                    <span className="mt-2 line-clamp-3 text-center font-mono text-[9px] leading-tight text-dim transition-colors group-hover:text-star">
                      {m.name.split("—")[0].trim()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Panel>

      {/* modal */}
      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-void/90 p-4 md:p-10"
          role="dialog"
          aria-modal="true"
          aria-label={open.name}
          onClick={() => setOpen(null)}
        >
          <div
            className="panel hud-corners grid max-h-full w-full max-w-4xl overflow-y-auto md:grid-cols-[1.1fr_1fr]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative min-h-64">
              <MissionImage m={open} className="h-full w-full object-cover" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-panel/90 via-transparent to-transparent md:bg-gradient-to-r" />
            </div>
            <div className="flex flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="mono-label text-cyan">{open.type}</div>
                  <h3 className="mt-1 font-display text-2xl font-semibold text-star">{open.name}</h3>
                  <div className="mono-label mt-1">{open.agency}</div>
                </div>
                <button
                  onClick={() => setOpen(null)}
                  className="mono-label text-faint hover:text-worm"
                  aria-label="Close mission file"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <ChipT tone={STATUS_TONE[open.status]}>{STATUS_LABEL[open.status]}</ChipT>
                <Chip>{open.launch}{open.end ? ` → ${open.end}` : " → present"}</Chip>
                <Chip>{open.target}</Chip>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-dim">{open.description}</p>
              <p className="mt-3 border-l-2 border-cyan/50 pl-3 text-xs leading-relaxed text-star/90 italic">
                {open.fact}
              </p>
              <div className="mt-auto pt-5">
                <SourceChip source="NASA mission page" href={open.sourceUrl} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
