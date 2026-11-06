"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Panel, Chip } from "@/components/ui";

/* Real engine presets (sea-level / vacuum Isp in s, thrust in kN). */
const ENGINES = {
  merlin: { name: "Merlin 1D", thrustKN: 845, ispSea: 282, ispVac: 348 },
  raptor: { name: "Raptor 2", thrustKN: 2300, ispSea: 327, ispVac: 380 },
  rd180: { name: "RD-180", thrustKN: 3830, ispSea: 311, ispVac: 338 },
  rs25: { name: "RS-25 (SSME)", thrustKN: 1860, ispSea: 366, ispVac: 452 },
} as const;
type EngineId = keyof typeof ENGINES;

const G0 = 9.80665;
const MU = 3.986004418e14;
const R_EARTH = 6371000;

interface StageConfig {
  engine: EngineId;
  fuelTons: number;
  vac: boolean; // designed for vacuum (upper stage)
}

interface SimState {
  t: number;
  x: number; // downrange, m
  y: number; // altitude, m
  vx: number;
  vy: number;
  stage: number; // index into stages, -1 = done
  fuelTons: number;
  m0: number; // current total mass kg
  maxQ: number;
  maxV: number;
  apoapsisKm: number;
  done: boolean;
  path: [number, number][];
}

function computeDeltaV(stages: StageConfig[], payloadKg: number): { total: number; perStage: number[] } {
  // stack from the top: payload, then stages in order (stage 1 = first fired)
  const upperMass = payloadKg;
  const perStage: number[] = [];
  const totalStack = stages.reduce((acc, s) => acc + s.fuelTons * 1000 * 1.09, upperMass);
  let remaining = totalStack;
  for (const s of stages) {
    const fuel = s.fuelTons * 1000;
    const dry = fuel * 0.07;
    remaining -= fuel + dry;
    const m0 = remaining + fuel + dry;
    const mf = remaining + dry;
    const eng = ENGINES[s.engine];
    const isp = s.vac ? eng.ispVac : (eng.ispSea + eng.ispVac) / 2;
    perStage.push(isp * G0 * Math.log(m0 / mf));
    remaining = mf;
  }
  return { total: perStage.reduce((a, b) => a + b, 0), perStage };
}

function verdictFor(dv: number): { label: string; tone: "red" | "amber" | "cyan" | "default" } {
  if (dv < 3000) return { label: "Fails to reach space", tone: "red" };
  if (dv < 6500) return { label: "Suborbital hop", tone: "amber" };
  if (dv < 9200) return { label: "Space, but not orbit", tone: "amber" };
  if (dv < 11800) return { label: "Low Earth orbit ✓", tone: "cyan" };
  if (dv < 13500) return { label: "GTO-class ✓", tone: "cyan" };
  return { label: "Escape trajectory ✓", tone: "cyan" };
}

function apoapsisOf(y: number, vx: number, vy: number): number {
  const r = R_EARTH + Math.max(y, 0);
  const v = Math.hypot(vx, vy);
  const eps = (v * v) / 2 - MU / r;
  const a = -MU / (2 * eps);
  // crude: use current speed at current r for apoapsis of the Kepler orbit
  const r_apo = eps < 0 ? 2 * a - r : Infinity;
  return r_apo === Infinity ? Infinity : (r_apo - R_EARTH) / 1000;
}

export function RocketLab() {
  const [payloadKg, setPayloadKg] = useState(13000);
  const [stages, setStages] = useState<StageConfig[]>([
    { engine: "raptor", fuelTons: 1100, vac: false },
    { engine: "raptor", fuelTons: 120, vac: true },
  ]);
  const [sim, setSim] = useState<SimState | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const rafRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<SimState | null>(null);

  const dv = useMemo(() => computeDeltaV(stages, payloadKg), [stages, payloadKg]);
  const verdict = verdictFor(dv.total);
  const thrust0 = stages.reduce((a, s) => a + ENGINES[s.engine].thrustKN, 0) * 1000;
  const mass0 = stages.reduce((a, s) => a + s.fuelTons * 1000 * 1.09, payloadKg);
  const twr = thrust0 / (mass0 * G0);

  /* launch sequence */
  const launch = () => {
    if (countdown !== null || sim) return;
    let c = 3;
    setCountdown(c);
    const iv = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(iv);
        setCountdown(null);
        start();
      }
    }, 800);
  };

  const start = () => {
    const s0: SimState = {
      t: 0, x: 0, y: 0, vx: 0, vy: 0,
      stage: 0, fuelTons: stages[0].fuelTons,
      m0: mass0, maxQ: 0, maxV: 0, apoapsisKm: 0,
      done: false, path: [[0, 0]],
    };
    simRef.current = s0;
    setSim({ ...s0 });
    cancelAnimationFrame(rafRef.current);
    let last: number | null = null;
    const loop = (now: number) => {
      if (last === null) last = now;
      const dtReal = Math.min((now - last) / 1000, 0.05);
      last = now;
      step(dtReal * 3); // 3× time compression
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  };

  const step = (dt: number) => {
    const s = simRef.current;
    if (!s || s.done) return;
    const sub = 4;
    const h = dt / sub;
    for (let i = 0; i < sub; i++) {
      const cfg = stages[s.stage];
      if (s.stage >= 0 && cfg) {
        const e = ENGINES[cfg.engine];
        // pitch program: vertical 6 s, then tilt downrange
        const pitch = s.t < 6 ? 0 : Math.min((s.t - 6) * 0.02, 1.15);
        const isp = s.y > 60000 || cfg.vac ? e.ispVac : e.ispSea;
        const thrust = e.thrustKN * 1000 * (s.y > 60000 ? 1 : 0.92 + 0.08 * Math.min(s.y / 60000, 1));
        const mdot = thrust / (isp * G0);
        const burn = Math.min(mdot * h, s.fuelTons * 1000);
        s.fuelTons -= burn / 1000;
        s.m0 -= burn;

        const rho = 1.225 * Math.exp(-s.y / 8500);
        const v = Math.hypot(s.vx, s.vy);
        const drag = 0.5 * rho * v * v * 0.35 * 10; // Cd*A ≈ 3.5 m²
        const ax = (thrust * Math.sin(pitch)) / s.m0 - (drag * (v ? s.vx / v : 0)) / s.m0;
        const g = MU / Math.pow(R_EARTH + s.y, 2);
        const ay = (thrust * Math.cos(pitch)) / s.m0 - g - (drag * (v ? s.vy / v : 0)) / s.m0;

        s.vx += ax * h;
        s.vy += ay * h;
        s.x += s.vx * h;
        s.y += s.vy * h;
        s.t += h;
        const q = 0.5 * rho * v * v;
        s.maxQ = Math.max(s.maxQ, q);
        s.maxV = Math.max(s.maxV, v);

        if (s.fuelTons <= 0) {
          if (s.stage < stages.length - 1) {
            // stage separation: drop dry mass
            const spent = stages[s.stage].fuelTons * 1000 * 0.07;
            s.m0 -= spent;
            s.stage += 1;
            s.fuelTons = stages[s.stage].fuelTons;
          } else {
            s.stage = -1; // coast
          }
        }
      } else {
        // coasting under gravity
        const g = MU / Math.pow(R_EARTH + s.y, 2);
        s.vx -= (g * (s.vx / Math.hypot(s.vx, s.vy) || 0)) * h * 0; // simplified: vertical g only for readability
        s.vy -= g * h;
        s.vx += 0; // keep downrange velocity
        s.x += s.vx * h;
        s.y += s.vy * h;
        s.t += h;
      }
      if (s.y <= 0 && s.t > 5) { s.done = true; break; }
    }
    s.apoapsisKm = Math.min(apoapsisOf(s.y, s.vx, s.vy), 400000);
    if (s.path.length === 0 || Math.abs(s.x - s.path[s.path.length - 1][0]) > 800 || Math.abs(s.y - s.path[s.path.length - 1][1]) > 800) {
      s.path.push([s.x, s.y]);
      if (s.path.length > 600) s.path.shift();
    }
    setSim({ ...s });
    if (s.done || (s.stage === -1 && s.vy < 0 && s.y < 120000)) {
      s.done = true;
      setSim({ ...s });
      cancelAnimationFrame(rafRef.current);
      drawFinal();
    }
  };

  /* trajectory canvas */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sim) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const maxX = Math.max(sim.x * 1.25, 1);
    const maxY = Math.max(sim.y * 1.25, 1);
    const pad = 34;
    const px = (x: number) => pad + (x / maxX) * (rect.width - pad - 12);
    const py = (y: number) => rect.height - pad - (y / maxY) * (rect.height - pad - 16);

    // grid
    ctx.strokeStyle = "rgba(28,43,77,0.8)";
    ctx.fillStyle = "#55688f";
    ctx.font = "9px 'IBM Plex Mono'";
    for (let i = 0; i <= 4; i++) {
      const yy = pad + (i / 4) * (rect.height - pad - 16);
      ctx.beginPath();
      ctx.moveTo(pad, yy);
      ctx.lineTo(rect.width - 12, yy);
      ctx.stroke();
      const alt = Math.round(maxY * (1 - i / 4) / 1000);
      ctx.fillText(`${alt} km`, 2, yy + 3);
    }
    // earth line
    ctx.strokeStyle = "#0b3d91";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad, rect.height - pad);
    ctx.lineTo(rect.width - 12, rect.height - pad);
    ctx.stroke();

    // path
    ctx.strokeStyle = "#67e8f9";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    sim.path.forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(px(x), py(y));
      else ctx.lineTo(px(x), py(y));
    });
    ctx.lineTo(px(sim.x), py(sim.y));
    ctx.stroke();

    // rocket
    ctx.fillStyle = "#fc3d21";
    ctx.beginPath();
    ctx.arc(px(sim.x), py(sim.y), 4, 0, Math.PI * 2);
    ctx.fill();
    if (!sim.done) {
      // exhaust plume while thrusting
      if (sim.stage >= 0) {
        const v = Math.hypot(sim.vx, sim.vy) || 1;
        ctx.strokeStyle = "rgba(255,180,84,0.8)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px(sim.x), py(sim.y));
        ctx.lineTo(px(sim.x - (sim.vx / v) * 18), py(sim.y - (sim.vy / v) * 18));
        ctx.stroke();
      }
    }
  }, [sim]);

  const drawFinal = () => {
    /* final frame already drawn by the effect on the last setSim */
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const setStage = (i: number, patch: Partial<StageConfig>) =>
    setStages((st) => st.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      {/* assembly */}
      <div className="flex flex-col gap-4">
        <Panel corners className="p-5">
          <div className="mono-label mb-4 text-cyan">Vehicle assembly bay</div>

          <label htmlFor="payload" className="mono-label mb-1 block">
            Payload · {payloadKg.toLocaleString()} kg
          </label>
          <input
            id="payload"
            type="range"
            min={500}
            max={30000}
            step={500}
            value={payloadKg}
            onChange={(e) => setPayloadKg(Number(e.target.value))}
            className="mb-5 w-full"
          />

          {stages.map((s, i) => (
            <div key={i} className="mb-5 border border-edge p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="mono-label">Stage {i + 1}</span>
                {stages.length > 1 && (
                  <button
                    onClick={() => setStages((st) => st.filter((_, idx) => idx !== i))}
                    className="mono-label text-faint hover:text-worm"
                    aria-label={`Remove stage ${i + 1}`}
                  >
                    remove
                  </button>
                )}
              </div>
              <label htmlFor={`eng-${i}`} className="sr-only">Engine for stage {i + 1}</label>
              <select
                id={`eng-${i}`}
                value={s.engine}
                onChange={(e) => setStage(i, { engine: e.target.value as EngineId })}
                className="panel mb-2 w-full px-2 py-1.5 font-mono text-xs text-star focus:border-cyan focus:outline-none"
              >
                {Object.entries(ENGINES).map(([id, e]) => (
                  <option key={id} value={id}>
                    {e.name} — {e.thrustKN} kN · Isp {e.ispSea}/{e.ispVac}s
                  </option>
                ))}
              </select>
              <label htmlFor={`fuel-${i}`} className="mono-label mb-1 block">
                Propellant · {s.fuelTons} t
              </label>
              <input
                id={`fuel-${i}`}
                type="range"
                min={10}
                max={1600}
                step={10}
                value={s.fuelTons}
                onChange={(e) => setStage(i, { fuelTons: Number(e.target.value) })}
                className="w-full"
              />
              <label className="mono-label mt-2 flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={s.vac}
                  onChange={(e) => setStage(i, { vac: e.target.checked })}
                  className="accent-cyan"
                />
                vacuum-optimized (upper stage)
              </label>
            </div>
          ))}

          {stages.length < 3 && (
            <button
              onClick={() => setStages((st) => [...st, { engine: "merlin", fuelTons: 80, vac: true }])}
              className="mono-label border border-edge px-3 py-1.5 text-dim transition-colors hover:border-cyan hover:text-cyan"
            >
              + Add stage
            </button>
          )}
        </Panel>

        <Panel className="p-5">
          <div className="mono-label mb-3">Vehicle analysis</div>
          <dl className="space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <dt className="text-faint">Liftoff mass</dt>
              <dd className="text-star tabular-nums">{Math.round(mass0).toLocaleString()} kg</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-faint">Liftoff thrust</dt>
              <dd className="text-star tabular-nums">{(thrust0 / 1000).toFixed(0)} kN</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-faint">Thrust-to-weight</dt>
              <dd className={`tabular-nums ${twr < 1.15 ? "text-worm" : twr > 1.8 ? "text-amber" : "text-live"}`}>
                {twr.toFixed(2)} {twr < 1.15 ? "(won't lift!)" : ""}
              </dd>
            </div>
            {dv.perStage.map((d, i) => (
              <div key={i} className="flex justify-between">
                <dt className="text-faint">Δv stage {i + 1}</dt>
                <dd className="text-cyan tabular-nums">{Math.round(d).toLocaleString()} m/s</dd>
              </div>
            ))}
            <div className="flex justify-between border-t border-edge pt-2">
              <dt className="text-faint">Total Δv (Tsiolkovsky)</dt>
              <dd className="text-star tabular-nums">{Math.round(dv.total).toLocaleString()} m/s</dd>
            </div>
          </dl>
          <div className="mt-3 flex items-center justify-between">
            <Chip tone={verdict.tone}>{verdict.label}</Chip>
            <span className="mono-label">LEO ≈ 9,400 m/s</span>
          </div>
        </Panel>
      </div>

      {/* launch pad */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={launch}
            disabled={countdown !== null || !!sim}
            className="border border-worm/70 bg-worm/10 px-6 py-3 font-mono text-xs tracking-[0.2em] text-worm uppercase transition-colors hover:bg-worm hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {countdown !== null ? `T−${countdown}` : sim ? "Flight in progress" : "▲ Ignition"}
          </button>
          {(sim || countdown !== null) && (
            <button
              onClick={() => {
                cancelAnimationFrame(rafRef.current);
                simRef.current = null;
                setSim(null);
                setCountdown(null);
              }}
              className="mono-label border border-edge px-4 py-2 text-faint hover:text-star"
            >
              Reset pad
            </button>
          )}
          {sim && !sim.done && (
            <div className="ml-auto flex gap-5 font-mono text-xs tabular-nums">
              <span className="text-faint">
                T+{sim.t.toFixed(0)}s
              </span>
              <span className="text-cyan">ALT {(sim.y / 1000).toFixed(1)} km</span>
              <span className="text-cyan">VEL {Math.round(Math.hypot(sim.vx, sim.vy))} m/s</span>
              <span className="text-faint">STG {sim.stage + 1}</span>
            </div>
          )}
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            className="panel block w-full"
            style={{ aspectRatio: "16 / 10" }}
            aria-label="Rocket ascent trajectory plot: altitude against downrange distance"
            role="img"
          />
          {!sim && !countdown && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="mono-label text-faint">Pad 39 — awaiting ignition</div>
                <p className="mt-2 max-w-sm px-6 text-xs leading-relaxed text-dim">
                  Assemble your vehicle, check thrust-to-weight, then light it.
                  The trajectory integrates real thrust, gravity and atmospheric
                  drag with a standard pitch program.
                </p>
              </div>
            </div>
          )}
        </div>

        {sim?.done && (
          <Panel corners className="p-5">
            <div className="mono-label mb-2 text-cyan">Post-flight report</div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                ["Max velocity", `${Math.round(sim.maxV)} m/s`],
                ["Max dynamic pressure", `${(sim.maxQ / 1000).toFixed(1)} kPa`],
                ["Apoapsis", sim.apoapsisKm === Infinity ? ">400,000 km" : `${Math.max(0, Math.round(sim.apoapsisKm)).toLocaleString()} km`],
                ["Downrange", `${(sim.x / 1000).toFixed(0)} km`],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="mono-label mb-0.5">{k}</div>
                  <div className="font-mono text-sm text-star tabular-nums">{v}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-faint">
              {sim.apoapsisKm > 100
                ? "You cleared the Kármán line. Orbital insertion would still require a circularization burn — the maths here stops at booster-class honesty."
                : "Not enough energy to clear the atmosphere this time. More propellant, lighter payload, or a better engine."}
            </p>
          </Panel>
        )}

        <p className="mono-label">
          Physics: Tsiolkovsky ideal Δv · exponential atmosphere (scale height 8.5 km) · inverse-square gravity · Cd·A ≈ 3.5 m²
        </p>
      </div>
    </div>
  );
}
