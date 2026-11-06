"use client";

import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { useProgress, Stars } from "@react-three/drei";
import * as THREE from "three";

/* ── Loading overlay driven by real texture progress ──────────── */

function LoaderOverlay() {
  const { active, progress } = useProgress();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!active && progress >= 100) {
      const t = setTimeout(() => setHidden(true), 600);
      return () => clearTimeout(t);
    }
  }, [active, progress]);

  if (hidden) return null;
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-void transition-opacity duration-700 ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="mono-label text-cyan">Acquiring signal</div>
      <div className="h-px w-48 overflow-hidden bg-edge">
        <div
          className="h-full bg-cyan transition-[width] duration-300 ease-out"
          style={{ width: `${Math.round(progress)}%` }}
        />
      </div>
      <div className="font-mono text-xs tabular-nums text-faint">{Math.round(progress)}%</div>
    </div>
  );
}

/* ── Pause rendering when scrolled out of view or tab hidden ──── */

function webglAvailable(): boolean {
  try {
    const probe = document.createElement("canvas");
    return !!(probe.getContext("webgl2") || probe.getContext("webgl"));
  } catch {
    return false;
  }
}

export function LazyCanvas({
  children,
  className = "",
  camera = { position: [0, 0, 5] as [number, number, number], fov: 45 },
  dpr = [1, 1.75],
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  camera?: { position: [number, number, number]; fov: number };
  dpr?: [number, number];
  ariaLabel?: string;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  // WebGL can only be probed client-side; start optimistic to match SSR markup
  const [glOk, setGlOk] = useState(true);

  useEffect(() => {
    setGlOk(webglAvailable());
  }, []);

  useEffect(() => {
    if (!glOk) return;
    const el = holder.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "120px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [glOk]);

  if (!glOk) {
    return (
      <div className={`${className} flex items-center justify-center`} aria-label={ariaLabel ?? "3D scene unavailable"} role="img">
        <div className="panel hud-corners mx-auto max-w-sm p-6 text-center">
          <div className="mono-label mb-2 text-amber">WebGL unavailable</div>
          <p className="text-sm text-dim">
            Your browser or GPU driver has 3D graphics disabled. All data panels
            on this page still work — only the interactive 3D view is affected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={holder}
      className={className}
      role="img"
      aria-label={ariaLabel ?? "Interactive 3D scene"}
    >
      <Canvas
        camera={camera}
        dpr={dpr}
        frameloop={inView ? "always" : "never"}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
      <LoaderOverlay />
    </div>
  );
}

/* ── Reusable starfield ────────────────────────────────────────── */

export function StarField({ radius = 90, count = 3500 }: { radius?: number; count?: number }) {
  return <Stars radius={radius} depth={50} count={count} factor={4} saturation={0} fade speed={0.4} />;
}

export { LoaderOverlay };
