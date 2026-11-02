import Link from "next/link";
import { HeroCanvas } from "@/components/three/hero-scene";
import { TelemetryStrip } from "@/components/home/telemetry-strip";
import { CTA } from "@/components/ui";

const SECTIONS = [
  {
    href: "/observatory",
    index: "01",
    title: "Live Observatory",
    desc: "ISS position, today's astronomy picture, near-Earth asteroids and solar flares — straight from NASA feeds.",
    texture: "/textures/starfield.jpg",
  },
  {
    href: "/solar-system",
    index: "02",
    title: "Solar System",
    desc: "A living orrery: real orbital periods, selectable planets, time control and side-by-side comparison.",
    texture: "/textures/jupiter.jpg",
  },
  {
    href: "/deep-space",
    index: "03",
    title: "Deep Space",
    desc: "Nebulae, galaxies and the first black hole photographs, plus a live exoplanet discovery console.",
    texture: "/textures/neptune.jpg",
  },
  {
    href: "/earth",
    index: "04",
    title: "Earth Explorer",
    desc: "The real-time terminator, city lights and the ISS flying overhead — computed from the actual clock.",
    texture: "/textures/earth_day_4k.jpg",
  },
  {
    href: "/mars",
    index: "05",
    title: "Mars Explorer",
    desc: "Fly the red planet: rover landing sites, terrain features and the latest imagery from the surface.",
    texture: "/textures/mars.jpg",
  },
  {
    href: "/events",
    index: "06",
    title: "Cosmic Events",
    desc: "Asteroid close approaches, active meteor showers, upcoming eclipses and solar storms.",
    texture: "/textures/sun.jpg",
  },
  {
    href: "/missions",
    index: "07",
    title: "Mission Center",
    desc: "Sixteen missions from Apollo 11 to Europa Clipper — status, facts and source-verified imagery.",
    texture: "/textures/saturn.jpg",
  },
  {
    href: "/lab",
    index: "08",
    title: "The Lab",
    desc: "Black hole lensing, the cosmic scale, rocket launches and a space quiz. Handle with curiosity.",
    texture: "/textures/mercury.jpg",
  },
];

export default function Home() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="grain relative flex min-h-[100svh] flex-col overflow-hidden">
        <HeroCanvas />

        {/* vignette + bottom fade */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#030712_100%)]"
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-void" />

        <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 pt-28 pb-40 md:px-8">
          <div className="pointer-events-auto max-w-2xl">
            <p className="mono-label animate-rise text-cyan" style={{ animationDelay: "0.15s" }}>
              Deep Space Observatory · EST. 2026
            </p>
            <h1 className="mt-5 font-display text-[clamp(2.6rem,8vw,5.5rem)] leading-[0.98] font-bold tracking-tight text-star">
              <span className="animate-rise block" style={{ animationDelay: "0.3s" }}>
                The universe,
              </span>
              <span className="animate-rise block text-glow text-cyan" style={{ animationDelay: "0.45s" }}>
                observed.
              </span>
            </h1>
            <p
              className="animate-rise mt-6 max-w-lg text-base leading-relaxed text-dim md:text-lg"
              style={{ animationDelay: "0.6s" }}
            >
              A real-time window on the cosmos — live ISS telemetry, NASA imagery,
              a living orrery and interactive astrophysics. Every feed is genuine;
              every simulation is honest.
            </p>
            <div className="animate-rise mt-9 flex flex-wrap gap-4" style={{ animationDelay: "0.75s" }}>
              <CTA href="/solar-system" className="cta-hero">Begin exploration</CTA>
              <CTA href="/observatory" variant="ghost">
                Live telemetry
              </CTA>
            </div>
          </div>
        </div>

        {/* scroll cue */}
        <div aria-hidden className="absolute bottom-24 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
          <span className="mono-label">Scroll</span>
          <span className="relative block h-10 w-px overflow-hidden bg-edge">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-scan bg-cyan" />
          </span>
        </div>

        <TelemetryStrip />
      </section>

      {/* ── Section directory ────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
        <div className="mb-12 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mono-label mb-3 flex items-center gap-3 text-cyan">
              <span>Directory</span>
              <span className="h-px w-12 bg-cyan/40" aria-hidden />
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-star md:text-5xl">
              Choose your orbit
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-dim">
            Eight observation decks, each with working instruments. WebGL scenes
            are fully interactive — drag, orbit and zoom everything you see.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SECTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group panel relative flex min-h-56 flex-col justify-end overflow-hidden p-5 transition-all duration-500 hover:border-cyan/60"
            >
              <div
                aria-hidden
                className="absolute inset-0 bg-cover bg-center opacity-25 transition-all duration-700 group-hover:scale-105 group-hover:opacity-40"
                style={{ backgroundImage: `url(${s.texture})` }}
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-b from-void/40 via-void/70 to-void/95"
              />
              <div className="relative">
                <span className="font-mono text-[10px] tracking-[0.2em] text-cyan/80">
                  {s.index}
                </span>
                <h3 className="mt-2 font-display text-xl font-semibold text-star">
                  {s.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-dim">{s.desc}</p>
                <span className="mt-4 inline-block font-mono text-[10px] tracking-[0.18em] text-faint uppercase transition-colors group-hover:text-cyan">
                  Enter deck <span aria-hidden className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Manifesto band ───────────────────────────────────── */}
      <section className="border-y border-edge bg-abyss">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-3 md:px-8">
          {[
            {
              k: "Real data",
              v: "Live feeds from NASA APOD, NeoWs, DONKI, EONET, the Image Library, the Exoplanet Archive and ISS trackers. When a feed is down, archived samples are shown and labeled — never silently invented.",
            },
            {
              k: "Honest physics",
              v: "The day/night terminator comes from the actual Sun position. Orbital periods are the real ones, time-scaled. The rocket lab integrates real thrust and the Tsiolkovsky equation.",
            },
            {
              k: "Built to explore",
              v: "Every scene is an instrument, not a screensaver. Orbit it, scrub time, assemble a launch vehicle, fall into a black hole — then come back and check on the ISS.",
            },
          ].map((b, i) => (
            <div key={b.k} className={i > 0 ? "md:border-l md:border-edge md:pl-10" : ""}>
              <div className="mono-label mb-3 text-cyan">0{i + 1}</div>
              <h3 className="font-display text-2xl font-semibold text-star">{b.k}</h3>
              <p className="mt-3 text-sm leading-relaxed text-dim">{b.v}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
