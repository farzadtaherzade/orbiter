"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { LazyCanvas } from "@/components/three/scene";
import { Panel } from "@/components/ui";

/* Schwarzschild-ish null geodesic raymarcher.
   Units: rs = 1. Photon ODE in Cartesian form: a = -1.5 * h² * x / r⁵
   (h = |x × v| conserved angular momentum). Disk: ISCO (3 rs) → 12 rs,
   with Doppler beaming + gravitational redshift. */

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform vec3 uCamPos;
  uniform vec3 uCamRight;
  uniform vec3 uCamUp;
  uniform vec3 uCamFwd;
  uniform float uRs;
  uniform float uDiskGain;
  uniform float uDoppler;
  uniform float uSteps;

  #define FAR 42.0

  /* procedural starfield for escaped rays */
  vec3 stars(vec3 dir) {
    vec3 col = vec3(0.0);
    // two layers of cell-hash stars
    for (float layer = 0.0; layer < 2.0; layer++) {
      float scale = mix(60.0, 140.0, layer / 1.0);
      vec3 p = dir * scale;
      vec3 cell = floor(p);
      vec3 f = fract(p) - 0.5;
      float h = fract(sin(dot(cell, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
      if (h > 0.982) {
        float brightness = (h - 0.982) / 0.018;
        float d = length(f);
        float star = smoothstep(0.28, 0.0, d) * pow(brightness, 2.0);
        float tint = fract(h * 7.13);
        col += star * mix(vec3(0.75, 0.83, 1.0), vec3(1.0, 0.85, 0.7), tint) * (0.7 - 0.25 * layer);
      }
    }
    // faint galactic band
    float band = exp(-abs(dot(dir, normalize(vec3(0.3, 1.0, 0.15)))) * 4.5);
    col += vec3(0.045, 0.055, 0.09) * band;
    col += vec3(0.008, 0.010, 0.02);
    return col;
  }

  /* accretion disk color at radius r, angle a */
  vec3 diskColor(float r, float a, float rs) {
    float t = clamp((r - 3.0 * rs) / (9.0 * rs), 0.0, 1.0);
    vec3 hot = vec3(1.0, 0.96, 0.88);
    vec3 mid = vec3(1.0, 0.62, 0.22);
    vec3 outer = vec3(0.55, 0.16, 0.05);
    vec3 c = mix(hot, mid, smoothstep(0.0, 0.4, t));
    c = mix(c, outer, smoothstep(0.35, 1.0, t));
    // swirling streaks
    float streak = sin(a * 26.0 + r * 9.0 - uTime * 0.9) * 0.5 + 0.5;
    streak *= 0.65 + 0.35 * sin(a * 61.0 - r * 17.0 + uTime * 1.4);
    return c * (0.55 + 0.45 * streak);
  }

  void main() {
    vec2 ndc = (vUv * 2.0 - 1.0);
    ndc.x *= uResolution.x / uResolution.y;

    float rs = uRs;
    vec3 pos = uCamPos;
    float fov = 1.45;
    vec3 dir = normalize(uCamFwd + ndc.x * fov * uCamRight + ndc.y * fov * uCamUp);

    // conserved angular momentum² of the photon
    vec3 hVec = cross(pos, dir);
    float h2 = dot(hVec, hVec);

    vec3 color = vec3(0.0);
    float alpha = 0.0;
    bool captured = false;
    float prevY = pos.y;
    float prevR = length(pos);

    for (float i = 0.0; i < 220.0; i++) {
      if (i >= uSteps) break;
      float r = length(pos);
      if (r < rs * 1.02) { captured = true; break; }
      if (r > FAR && dot(pos, dir) > 0.0) break;

      // adaptive step: finer near the hole and near the disk plane
      float dt = clamp(r * 0.11, 0.045, 0.6);
      if (abs(pos.y) < 0.35) dt *= 0.45;

      // leapfrog
      vec3 acc = -1.5 * h2 * pos / pow(r, 5.0);
      vec3 prevPos = pos;
      dir += acc * dt;
      pos += dir * dt;

      // disk crossing between prevPos and pos?
      if (prevPos.y * pos.y < 0.0) {
        float f = prevPos.y / (prevPos.y - pos.y);
        vec3 hit = mix(prevPos, pos, f);
        float hr = length(hit);
        if (hr > 3.0 * rs && hr < 12.0 * rs) {
          float a = atan(hit.z, hit.x);
          vec3 c = diskColor(hr, a, rs);

          // orbital velocity direction (Keplerian, GR-ish)
          vec3 tangent = normalize(vec3(-hit.z, 0.0, hit.x));
          float speed = clamp(sqrt(rs / (2.0 * hr)), 0.0, 0.72);
          // Doppler beaming
          float cosA = dot(tangent, -dir);
          float beam = mix(1.0, pow(max(1.0 + speed * cosA * 2.2, 0.05), 3.0), uDoppler);
          // gravitational redshift dimming
          float redshift = sqrt(max(1.0 - rs / hr, 0.02));

          float edge = smoothstep(3.0 * rs, 3.6 * rs, hr) * (1.0 - smoothstep(10.5 * rs, 12.0 * rs, hr));
          float glow = edge * beam * redshift * uDiskGain;
          color += c * glow * (1.0 - alpha);
          alpha += glow * 0.5;
          if (alpha > 0.98) break;
        }
      }
      prevY = pos.y;
      prevR = r;
    }

    if (!captured) {
      vec3 bg = stars(normalize(dir));
      color += bg * (1.0 - clamp(alpha, 0.0, 1.0));
    }

    // photon-ring highlight (thin bright ring at ~2.6 rs silhouette edge)
    color = clamp(color, 0.0, 1.6);
    // filmic-ish curve
    color = color / (color + 0.55) * 1.55;
    gl_FragColor = vec4(color, 1.0);
  }
`;

function BlackHoleShader({
  params,
  orbitRef,
}: {
  params: { rs: number; gain: number; doppler: boolean; steps: number };
  orbitRef: React.MutableRefObject<{ yaw: number; pitch: number; dist: number }>;
}) {
  const { size } = useThree();
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uCamPos: { value: new THREE.Vector3(0, 1.2, 16) },
      uCamRight: { value: new THREE.Vector3(1, 0, 0) },
      uCamUp: { value: new THREE.Vector3(0, 1, 0) },
      uCamFwd: { value: new THREE.Vector3(0, 0, -1) },
      uRs: { value: 1 },
      uDiskGain: { value: 1 },
      uDoppler: { value: 1 },
      uSteps: { value: 150 },
    }),
    []
  );

  useFrame(({ clock }) => {
    const m = matRef.current;
    if (!m) return;
    const u = m.uniforms;
    u.uTime.value = clock.elapsedTime;
    u.uResolution.value.set(size.width, size.height);
    u.uRs.value = params.rs;
    u.uDiskGain.value = params.gain;
    u.uDoppler.value = params.doppler ? 1 : 0;
    u.uSteps.value = params.steps;

    const { yaw, pitch, dist } = orbitRef.current;
    const cp = Math.cos(pitch);
    u.uCamPos.value.set(
      Math.sin(yaw) * cp * dist,
      Math.sin(pitch) * dist + params.rs * 0.9,
      Math.cos(yaw) * cp * dist
    );
    const fwd = u.uCamPos.value.clone().multiplyScalar(-1).normalize();
    u.uCamFwd.value.copy(fwd);
    u.uCamRight.value.copy(new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize());
    u.uCamUp.value.copy(new THREE.Vector3().crossVectors(u.uCamRight.value, fwd).normalize());
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export function BlackHoleLab() {
  const orbit = useRef({ yaw: 0.35, pitch: 0.22, dist: 15 });
  const drag = useRef<{ active: boolean; x: number; y: number }>({ active: false, x: 0, y: 0 });
  const [params, setParams] = useState({ rs: 1, gain: 1.1, doppler: true, steps: 150 });
  const [autoOrbit, setAutoOrbit] = useState(true);

  /* slow cinematic drift when auto-orbit is on */
  useEffect(() => {
    if (!autoOrbit) return;
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      if (!drag.current.active) orbit.current.yaw += dt * 0.08;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoOrbit]);

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { active: true, x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current.x = e.clientX;
    drag.current.y = e.clientY;
    orbit.current.yaw -= dx * 0.005;
    orbit.current.pitch = Math.max(-1.35, Math.min(1.35, orbit.current.pitch + dy * 0.005));
    if (autoOrbit) setAutoOrbit(false);
  };
  const onPointerUp = () => {
    drag.current.active = false;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div
        className="panel relative h-[78vh] min-h-[480px] cursor-grab touch-none overflow-hidden active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="img"
        aria-label="Interactive gravitational lensing simulation around a black hole — drag to change your viewing angle"
      >
        {/* lightweight always-on canvas (shader draws its own stars) */}
        <BHCanvas params={params} orbit={orbit} />
        <div className="mono-label pointer-events-none absolute top-4 left-4 text-cyan">
          Gargantua-class · Schwarzschild raymarcher
        </div>
        <div className="mono-label pointer-events-none absolute right-4 bottom-4 text-faint">
          drag to orbit · scroll disabled
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Panel corners className="p-5">
          <div className="mono-label mb-4 text-cyan">Instrument panel</div>

          <label htmlFor="bh-mass" className="mono-label mb-1 block">
            Mass · {(params.rs * 4.3e6).toFixed(1)}×10⁶ M☉ (rs = {params.rs.toFixed(1)})
          </label>
          <input
            id="bh-mass"
            type="range"
            min={0.5}
            max={2.5}
            step={0.05}
            value={params.rs}
            onChange={(e) => setParams((p) => ({ ...p, rs: Number(e.target.value) }))}
            className="mb-4 w-full"
          />

          <label htmlFor="bh-gain" className="mono-label mb-1 block">
            Disk luminosity · {params.gain.toFixed(2)}
          </label>
          <input
            id="bh-gain"
            type="range"
            min={0.2}
            max={2.5}
            step={0.05}
            value={params.gain}
            onChange={(e) => setParams((p) => ({ ...p, gain: Number(e.target.value) }))}
            className="mb-4 w-full"
          />

          <label htmlFor="bh-steps" className="mono-label mb-1 block">
            Integration steps · {params.steps}
          </label>
          <input
            id="bh-steps"
            type="range"
            min={60}
            max={220}
            step={10}
            value={params.steps}
            onChange={(e) => setParams((p) => ({ ...p, steps: Number(e.target.value) }))}
            className="mb-4 w-full"
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setParams((p) => ({ ...p, doppler: !p.doppler }))}
              aria-pressed={params.doppler}
              className={`mono-label border px-3 py-1.5 transition-colors ${
                params.doppler ? "border-cyan/70 text-cyan" : "border-edge text-faint"
              }`}
            >
              {params.doppler ? "◉" : "○"} Doppler beaming
            </button>
            <button
              onClick={() => setAutoOrbit(!autoOrbit)}
              aria-pressed={autoOrbit}
              className={`mono-label border px-3 py-1.5 transition-colors ${
                autoOrbit ? "border-cyan/70 text-cyan" : "border-edge text-faint"
              }`}
            >
              {autoOrbit ? "◉" : "○"} Auto orbit
            </button>
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="mono-label mb-2">What you are seeing</div>
          <p className="text-xs leading-relaxed text-dim">
            Every pixel traces a light ray backwards through curved spacetime.
            Rays bend around the event horizon (the black shadow), wrap over the
            top to show the disk's far side above and below it, and form the thin
            photon ring. The approaching side of the disk glows brighter —
            relativistic Doppler beaming — and light near the horizon is dimmed
            by gravitational redshift.
          </p>
        </Panel>
      </div>
    </div>
  );
}

function BHCanvas({
  params,
  orbit,
}: {
  params: { rs: number; gain: number; doppler: boolean; steps: number };
  orbit: React.MutableRefObject<{ yaw: number; pitch: number; dist: number }>;
}) {
  return (
    <LazyCanvas
      className="absolute inset-0"
      camera={{ position: [0, 0, 1], fov: 50 }}
      dpr={[0.6, 1]}
      ariaLabel="Black hole with gravitational lensing and an accretion disk"
    >
      <BlackHoleShader params={params} orbitRef={orbit} />
    </LazyCanvas>
  );
}
