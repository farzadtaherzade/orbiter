# ORBITER — Deep Space Observatory

An immersive, NASA-inspired space exploration experience built as a real working
instrument panel — not a static landing page. Every feed is live, every simulation
computes real physics, and every fallback is honestly labeled.

![stack](https://img.shields.io/badge/Next.js%2016-App%20Router-0b3d91) ![three](https://img.shields.io/badge/React%20Three%20Fiber-9-1c2b4d) ![ts](https://img.shields.io/badge/TypeScript-strict-1c2b4d)

## The observation decks

| Route | What it does |
| --- | --- |
| `/` | Full-screen 3D Earth with a **real-time day/night terminator** computed from the actual Sun position, mouse-parallax camera, live ISS telemetry strip, moon phase and meteor-calendar widgets |
| `/observatory` | ISS ground-track map with predicted 95-min orbit, NASA **APOD**, near-Earth asteroid feed (NeoWs), solar flares (DONKI), SDO's live Sun, EONET natural events |
| `/solar-system` | A living orrery — all 8 planets at their **true relative orbital periods**, 1,100-rock instanced asteroid belt, click-to-fly camera, time speed control, realistic-scale mode, side-by-side planet comparison |
| `/deep-space` | Deep-sky gallery resolved live from the NASA Image Library, plus an **exoplanet discovery console** querying the NASA Exoplanet Archive (filter by method/year/size, scatter plot, click-to-inspect) |
| `/earth` | Interactive globe with time scrubbing (±12 h), city lights, ISS marker with predicted ground track, subsolar point readout, humans-in-space crew feed |
| `/mars` | 3D Mars with clickable terrain features and rover sites at real coordinates, **live imagery from the Mars Photos API**, discovery timeline |
| `/events` | Annual meteor-shower calendar (active showers computed from today's date), upcoming eclipses with countdowns, NEO feed, solar activity |
| `/missions` | 16 missions from Apollo 11 to Europa Clipper — status filters, imagery from the NASA Image Library, an interactive launch timeline, mission files with source links |
| `/lab` | **Cosmic scale explorer** (27 objects, 42 orders of magnitude), **rocket assembly & launch sim** (Tsiolkovsky Δv, pitch program, drag, staging, live trajectory plot), **space quiz** (15 questions with explanations) |
| `/lab/black-hole` | Full-screen **Schwarzschild raymarcher**: gravitational lensing, lensed accretion disk, Doppler beaming, gravitational redshift — drag to orbit it yourself |

## The honest-data principle

Nothing on this site is fabricated. Every data panel carries:

- a **source chip** linking to the upstream API,
- a **freshness badge**: `LIVE` → `CACHED (age)` → `ARCHIVED SAMPLE (reason)`.

When a feed is unreachable (NASA's shared `DEMO_KEY` is rate-limited at
30 req/hour), the panel falls back to a clearly-labeled archived sample with real
historical values — never a silent invention. A local astronomy module computes
the Sun's subsolar point, moon phase and day/night geometry from first
principles, so the flagship visuals keep working offline.

Add your own free [api.nasa.gov](https://api.nasa.gov/) key in
**Observatory → NASA API key** (stored only in your browser) to unlock
always-live APOD, NEO, DONKI and Mars photos.

## Data sources

- [NASA APOD](https://apod.nasa.gov/apod/astropix.html) · [NeoWs](https://ssd-api.jpl.nasa.gov/doc/cad.html) · [DONKI](https://kauai.ccmc.gsfc.nasa.gov/DONKI/) · [EONET v3](https://eonet.gsfc.nasa.gov/) · [Image & Video Library](https://images.nasa.gov) · [Mars Photos](https://mars.nasa.gov/rss/api/) · [Planetary Fact Sheets](https://science.nasa.gov/solar-system/planets/)
- [NASA Exoplanet Archive (TAP)](https://exoplanetarchive.ipac.caltech.edu/) — proxied server-side with a 6 h cache
- [WhereTheISS.at](https://wheretheiss.at/w/developer) — live ISS position & predicted ground track
- [open-notify](http://open-notify.org/Open-Notify-API/People-In-Space/) crew feed — proxied server-side (HTTP-only upstream)
- Static reference data: American Meteor Society calendar, NASA Eclipse Web Site

## Stack & architecture

```
Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4
React Three Fiber 9 + drei · three · IBM Plex Mono / Space Grotesk / Inter (self-hosted)
```

```
app/                    routes (one WebGL context alive at a time) + API proxies
components/three/       EarthGlobe (custom GLSL day/night/atmosphere shaders), scenes
components/<deck>/      per-route feature islands (client components)
components/ui.tsx       design system: panels, badges, HUD corners, stats
lib/                    nasa.ts (typed fetchers) · iss.ts · astronomy.ts (solar math)
hooks/                  useLiveData (SWR-style cache + honest state machine), useNow
data/                   verified static fact bases (planets, missions, meteors, …)
public/textures/        NASA-derived Earth maps, CC-BY Solar System Scope planets
```

**Performance & accessibility:** DPR clamping, instancing, `IntersectionObserver`
frame-loop pausing, route-level code splitting, WebGL-unavailable fallbacks,
skip link, keyboard-operable controls, `prefers-reduced-motion` support,
AA-contrast HUD palette.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Credits & disclaimer

Imagery courtesy NASA/JPL-Caltech, ESA and partner institutions. Planet
textures © Solar System Scope (CC BY 4.0). Earth maps derived from NASA Blue
Marble. **Not affiliated with NASA or any space agency.** Built as an
independent, educational observatory.
