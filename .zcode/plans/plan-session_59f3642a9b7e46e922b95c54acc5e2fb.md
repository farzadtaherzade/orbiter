# ORBITER — Deep Space Observatory

A NASA-inspired immersive observatory experience: 9 routes, 5 interactive lab simulations, live NASA data with honest fallback states. Greenfield build in the empty workspace root.

## Design language
- **Concept:** mission-control observatory. Near-black navy (#050810), hairline 1px borders, HUD corner ticks, mono telemetry labels, NASA-blue (#0B3D91) + worm-red (#FC3D21) accents, cyan data highlights. No glassmorphism — solid deep panels.
- **Type:** Space Grotesk (display), Inter (body), IBM Plex Mono (telemetry) via next/font.
- **Motion:** `motion` for UI reveals, GSAP ScrollTrigger for scroll-linked sequences, R3F useFrame for 3D. `prefers-reduced-motion` → static/simplified scenes.
- 3D is always interactive (drag/zoom), never passive decoration.

## Tech stack
Next.js 15 (App Router, TS), Tailwind CSS v4, React Three Fiber + drei, three, GSAP, motion. Routes keep exactly one WebGL context alive at a time. All 3D loaded via `next/dynamic({ ssr:false })`.

## Routes & features (every interaction functional)
1. **`/` Home** — full-screen R3F Earth (day/night shader, clouds, fresnel atmosphere, starfield), mouse parallax, cinematic staggered headline, live telemetry strip (real ISS lat/lon), scroll-linked camera push via GSAP, section navigation cards.
2. **`/observatory`** — ISS ground-track map (equirectangular canvas, live position + predicted orbit from wheretheiss.at), APOD with HD toggle + full explanation, NEO asteroid feed (sizes/miss distances/hazard badges), DONKI solar flares, SDO current-Sun image. Source chips + LIVE/CACHED/SAMPLE badges everywhere.
3. **`/solar-system`** — R3F system: shader Sun, 8 planets with real relative orbital periods (time-scaled), asteroid belt (instanced), click planet → camera flight + verified fact panel, time speed/pause controls, orbit/label toggles, "realistic scale" toggle, planet comparison table + scaled-size bars.
4. **`/deep-space`** — NASA Image Library gallery (galaxies/nebulae/black holes queries) with lightbox, featured deep-sky objects, **exoplanet discovery interface**: live NASA Exoplanet Archive data, filter by method/year, radius/orbit visualizations.
5. **`/earth`** — 3D globe with real-time day/night terminator (subsolar point computed from UTC), ISS live tracking on globe + telemetry (altitude, velocity), orbit path, layer toggles.
6. **`/mars`** — 3D Mars with clickable terrain feature markers (Olympus Mons, Valles Marineris…), real rover sites (Perseverance/Jezero, Curiosity/Gale, Zhurong/InSight), **live rover photos** (NASA Mars Photos API), discoveries timeline.
7. **`/events`** — NEO feed + miss-distance chart, meteor shower calendar (active ones computed from today's date), upcoming eclipses (curated, sourced), DONKI flares, EONET natural events.
8. **`/missions`** — 12+ curated missions (Artemis, JWST, Voyager, Perseverance, Parker…) with status timeline, images from NASA Image Library, detail modals, all facts source-linked.
9. **`/lab`** + **`/lab/black-hole`** — (a) black hole gravitational lensing: fullscreen raymarched shader, drag to orbit, mass/disk/inclination sliders; (b) cosmic scale explorer: log-scale slider Planck→observable universe with comparison mode; (c) rocket assembly & launch sim: build stages, real Tsiolkovsky Δv + ascent physics, animated countdown/launch, orbit verdict; (d) space quiz: 15 questions, scoring, explanations.

## Data layer (no fabrication)
- **Live APIs:** APOD, NeoWs, DONKI, EONET (keyless), Mars Rover Photos, Image Library (keyless), wheretheiss.at (keyless, verified working), Exoplanet Archive TAP (verified working).
- `lib/nasa.ts` typed fetchers; `useLiveData` hook: sessionStorage cache + TTL + polling + status machine (live → cached with age → curated sample with reason). NASA requests accept a user-entered API key (settings panel, localStorage) since DEMO_KEY is rate-limited.
- Next route handlers proxy HTTP-only endpoints (ISS crew) and the Exoplanet Archive (CORS-safe, cached).
- Every data panel shows source + fetched timestamp; fallback datasets are clearly labeled "Archived sample" with real historical values and citations. Static datasets (missions, eclipses, meteor calendar, quiz, planet facts) cite NASA sources.

## Assets
Download planet/Earth/Mars textures (2k, Solar System Scope CC-BY / NASA Blue Marble / three-globe images) into `public/textures/` at build time with a fallback chain — no runtime hotlink dependency for 3D.

## Non-functional
- Perf: DPR clamp, instancing, texture ≤2k, canvases pause offscreen/hidden tab, route code-splitting, drei suspense loading states.
- A11y: landmarks, skip link, keyboard-operable tabs/sliders/canvases (orbit controls + focus), aria-labels, alt text, AA contrast.
- Responsive: mobile overlay nav, stacking panels, touch orbit controls, tested 390px–1440px.

## Execution order
1. Scaffold Next.js (create-next-app, fallback: manual scaffold), deps, fonts, design tokens, nav/layout, UI primitives
2. Texture pipeline; 3. lib/hooks + fallback datasets
4. Home hero → /earth → /solar-system → /observatory → /mars → /deep-space → /events → /missions → /lab + black hole
5. Polish pass (responsive/a11y/meta)
6. Verify: `npm run build`, dev server, then browser-test every route (screenshots desktop + 390px mobile, click through planet selection, quiz, launch sim, lensing sliders, live/fallback states) and fix what I find.

Delivery: polished running app + README with architecture, data sources, and how to add a personal NASA API key.