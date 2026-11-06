"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useTexture, Html, OrbitControls } from "@react-three/drei";
import { LazyCanvas, StarField } from "@/components/three/scene";
import { useLiveData, ageOf, type DataState } from "@/hooks/use-live-data";
import { fetchMarsRoverPhotos, type MarsPhoto } from "@/lib/nasa";
import { MARS_FEATURES, ROVERS, MARS_TIMELINE, type MarsFeature } from "@/data/mars";
import { latLonToVec3 } from "@/lib/astronomy";
import { Panel, Chip, SourceChip, StatusBadge } from "@/components/ui";

/* ── 3D Mars with clickable surface markers ───────────────────── */

const KIND_COLOR: Record<MarsFeature["kind"], string> = {
  volcano: "#ffb454",
  canyon: "#67e8f9",
  crater: "#a78bfa",
  region: "#8ba0c4",
  rover: "#fc3d21",
  lander: "#34d399",
};

function Marker({
  feature,
  selected,
  onSelect,
}: {
  feature: MarsFeature;
  selected: boolean;
  onSelect: (name: string | null) => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const pos = useMemo(() => latLonToVec3(feature.lat, feature.lon, 1.005), [feature]);
  const color = KIND_COLOR[feature.kind];
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (ref.current) {
      ref.current.lookAt(0, 0, 0);
      ref.current.rotateX(Math.PI / 2);
    }
  });

  return (
    <group position={pos}>
      <group ref={ref}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelect(selected ? null : feature.name);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = "";
          }}
        >
          <cylinderGeometry args={[selected ? 0.022 : 0.014, selected ? 0.022 : 0.014, 0.06, 8]} />
          <meshBasicMaterial color={color} transparent opacity={selected ? 0.95 : 0.7} toneMapped={false} />
        </mesh>
      </group>
      {(selected || hovered) && (
        <Html center distanceFactor={14} position={[0, 0.09, 0]} zIndexRange={[10, 0]} occlude>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(selected ? null : feature.name);
            }}
            className={`pointer-events-auto cursor-pointer border px-1.5 py-0.5 font-mono text-[8px] tracking-[0.12em] whitespace-nowrap uppercase transition-colors ${
              selected ? "bg-void" : "border-transparent bg-void/80 text-dim hover:text-star"
            }`}
            style={selected ? { borderColor: color, color } : undefined}
          >
            {feature.name}
          </button>
        </Html>
      )}
    </group>
  );
}

function MarsScene({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (name: string | null) => void;
}) {
  const [map, bump] = useTexture(["/textures/mars.jpg", "/textures/mars_bump.jpg"]);
  useEffect(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 4;
  }, [map]);
  const globe = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (globe.current) globe.current.rotation.y += delta * 0.02;
  });

  return (
    <>
      <mesh ref={globe}>
        <sphereGeometry args={[1, 96, 64]} />
        <meshStandardMaterial map={map} bumpMap={bump} bumpScale={0.6} roughness={0.95} metalness={0} />
      </mesh>

      {/* thin atmosphere */}
      <mesh scale={1.05}>
        <sphereGeometry args={[1, 48, 32]} />
        <meshBasicMaterial color="#d98a5f" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>

      {/* markers ride the spinning globe */}
      <group>
        <SpinSync target={globe}>
          {MARS_FEATURES.map((f) => (
            <Marker
              key={f.name}
              feature={f}
              selected={selected === f.name}
              onSelect={onSelect}
            />
          ))}
        </SpinSync>
      </group>

      <directionalLight position={[5, 2, 4]} intensity={2.4} color="#ffe8d6" />
      <ambientLight intensity={0.25} />
      <StarField count={1800} radius={40} />
      <OrbitControls
        enablePan={false}
        minDistance={1.5}
        maxDistance={6}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}

/* keep markers glued to the slowly spinning globe */
function SpinSync({
  target,
  children,
}: {
  target: React.RefObject<THREE.Mesh | null>;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current && target.current) {
      ref.current.rotation.y = target.current.rotation.y;
    }
  });
  return <group ref={ref}>{children}</group>;
}

/* ── Rover photos (live from NASA) ────────────────────────────── */

function RoverPhotos({ roverId, roverName }: { roverId: "curiosity" | "perseverance" | "opportunity"; roverName: string }) {
  const photos = useLiveData<MarsPhoto[]>(`mars-photos-${roverId}`, () => fetchMarsRoverPhotos(roverId, 6), {
    pollMs: 10 * 60_000,
    fallback: [],
  });
  const live = photos.state === "live" || photos.state === "cached";

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="mono-label">Latest from {roverName}</span>
        <StatusBadge state={photos.state as DataState} age={ageOf(photos.fetchedAt)} />
      </div>
      {!live ? (
        <div className="panel flex flex-col items-center gap-1.5 px-4 py-6 text-center">
          <span className="mono-label text-amber">Feed unavailable</span>
          <p className="text-xs text-dim">
            The Mars Photo API can’t be reached from this network right now.
          </p>
          <a
            href={`https://mars.nasa.gov/mer/gallery/`}
            target="_blank"
            rel="noopener noreferrer"
            className="mono-label mt-1 text-cyan hover:text-star"
          >
            Open NASA’s Mars gallery ↗
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.data.slice(0, 6).map((p) => (
            <a
              key={p.id}
              href={p.src}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block overflow-hidden border border-edge"
              title={`${p.cameraFull} — sol ${p.sol} (${p.earthDate})`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.src}
                alt={`${roverName} ${p.cameraFull} photo, sol ${p.sol}`}
                className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <span className="mono-label absolute inset-x-0 bottom-0 bg-void/80 px-1 py-0.5 text-center">
                {p.camera} · S{p.sol}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main explorer ────────────────────────────────────────────── */

export function MarsExplorer() {
  const [selected, setSelected] = useState<string | null>("Gale Crater — Curiosity");
  const [roverId, setRoverId] = useState<"curiosity" | "perseverance" | "opportunity">("curiosity");
  const feature = MARS_FEATURES.find((f) => f.name === selected) ?? null;
  const rover = ROVERS.find((r) => r.id === roverId)!;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <LazyCanvas
          className="panel h-[64vh] min-h-[420px] w-full"
          camera={{ position: [0, 0.5, 3.2], fov: 42 }}
          ariaLabel="Interactive 3D Mars with labeled terrain features and rover landing sites"
        >
          <MarsScene selected={selected} onSelect={setSelected} />
        </LazyCanvas>

        <div className="flex flex-col gap-4">
          {/* feature detail */}
          <Panel corners className="p-5">
            {feature ? (
              <>
                <div className="mono-label mb-1" style={{ color: KIND_COLOR[feature.kind] }}>
                  {feature.kind}
                </div>
                <h3 className="font-display text-xl font-semibold text-star">{feature.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-dim">{feature.detail}</p>
                <div className="mt-3 flex gap-4 font-mono text-[10px] text-faint tabular-nums">
                  <span>LAT {feature.lat.toFixed(1)}°</span>
                  <span>LON {feature.lon.toFixed(1)}°E</span>
                </div>
              </>
            ) : (
              <p className="text-xs text-dim">Select a marker on the globe.</p>
            )}
          </Panel>

          {/* feature list */}
          <Panel className="max-h-72 overflow-y-auto p-4">
            <div className="mono-label mb-3">Surface index</div>
            <ul className="space-y-1">
              {MARS_FEATURES.map((f) => (
                <li key={f.name}>
                  <button
                    onClick={() => setSelected(f.name)}
                    className={`flex w-full items-center gap-2 px-2 py-1.5 text-left font-mono text-[11px] transition-colors ${
                      selected === f.name ? "bg-panel-2 text-star" : "text-dim hover:bg-panel-2/60 hover:text-star"
                    }`}
                    aria-pressed={selected === f.name}
                  >
                    <span
                      aria-hidden
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ background: KIND_COLOR[f.kind] }}
                    />
                    {f.name}
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <div className="mono-label px-1">
            Imagery NASA/JPL · MOLA-based texture map
          </div>
        </div>
      </div>

      {/* rovers */}
      <Panel corners className="p-6 md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-xl font-semibold text-star">The rover fleet</h3>
          <div className="flex flex-wrap gap-2">
            {ROVERS.map((r) => (
              <button
                key={r.id}
                onClick={() => setRoverId(r.id)}
                aria-pressed={roverId === r.id}
                className={`mono-label border px-3 py-1.5 transition-colors ${
                  roverId === r.id ? "border-cyan/70 text-cyan" : "border-edge text-faint hover:text-dim"
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-display text-lg text-star">{rover.name}</h4>
              <Chip tone={rover.status === "active" ? "cyan" : "default"}>
                {rover.status === "active" ? "ACTIVE" : "MISSION COMPLETE"}
              </Chip>
            </div>
            <div className="mono-label mt-1">{rover.agency}</div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <dt className="mono-label mb-0.5">Landed</dt>
                <dd className="font-mono text-xs text-star">{rover.landed}</dd>
              </div>
              <div>
                <dt className="mono-label mb-0.5">Site</dt>
                <dd className="font-mono text-xs text-star">{rover.site}</dd>
              </div>
              <div>
                <dt className="mono-label mb-0.5">Traverse</dt>
                <dd className="font-mono text-xs text-star">{rover.distanceKm}</dd>
              </div>
            </dl>
            <ul className="mt-4 space-y-2">
              {rover.highlights.map((h) => (
                <li key={h} className="flex gap-2 text-xs leading-relaxed text-dim">
                  <span aria-hidden className="mt-0.5 text-cyan">▸</span>
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <RoverPhotos roverId={rover.id} roverName={rover.name} />
        </div>

        <div className="mt-5">
          <SourceChip source="NASA Mars Photos API" href="https://mars.nasa.gov/rss/api/" />
        </div>
      </Panel>

      {/* discoveries timeline */}
      <Panel corners className="p-6 md:p-8">
        <h3 className="mb-6 font-display text-xl font-semibold text-star">
          A decade of discovery
        </h3>
        <ol className="relative space-y-6 border-l border-edge pl-6">
          {MARS_TIMELINE.map((d) => (
            <li key={d.year + d.title} className="relative">
              <span
                aria-hidden
                className="absolute top-1 -left-[26px] inline-block h-2 w-2 rounded-full bg-cyan"
              />
              <div className="mono-label mb-1 text-cyan">{d.year}</div>
              <div className="font-display text-base font-semibold text-star">{d.title}</div>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-dim">{d.detail}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6">
          <SourceChip source="NASA Mars 2020 / MSL mission updates" href="https://science.nasa.gov/mars/" />
        </div>
      </Panel>
    </div>
  );
}
