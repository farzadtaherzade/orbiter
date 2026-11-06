"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture, Html, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { PLANETS, type Planet } from "@/data/planets";
import { StarField } from "@/components/three/scene";

/* Distance compression: AU → scene units (power scale keeps the system
   compact but ordered). Sizes: Earth-diameter → units, mildly compressed so
   Mercury stays visible. The Sun is NOT to scale (noted in the UI). */
const sceneDistance = (au: number) => 7.5 * Math.pow(au, 0.55);
const sceneSize = (dKm: number) => 0.5 * Math.pow(dKm / 12756, 0.5);
const SUN_SIZE = 2.6;

/* Realistic-scale mode: true distance ratios (1 AU = 10 units). */
const realDistance = (au: number) => au * 10;
const realSize = (dKm: number) => (dKm / 12756) * 0.55;

export interface SolarControls {
  playing: boolean;
  daysPerSecond: number;
  showOrbits: boolean;
  showLabels: boolean;
  realisticScale: boolean;
}

const INITIAL_ANGLES: Record<string, number> = {
  mercury: 0.6, venus: 2.4, earth: 4.4, mars: 1.4,
  jupiter: 3.4, saturn: 5.4, uranus: 0.2, neptune: 2.2,
};

export type AnchorRegistry = React.MutableRefObject<Record<string, THREE.Group | null>>;

/* ── Sun ──────────────────────────────────────────────────────── */

function Sun({ realistic, showLabels }: { realistic: boolean; showLabels: boolean }) {
  const map = useTexture("/textures/sun.jpg");
  useEffect(() => {
    map.colorSpace = THREE.SRGBColorSpace;
  }, [map]);
  const ref = useRef<THREE.Mesh>(null);

  const glowTexture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(255,220,140,0.85)");
    g.addColorStop(0.25, "rgba(255,160,60,0.35)");
    g.addColorStop(0.6, "rgba(252,61,33,0.12)");
    g.addColorStop(1, "rgba(252,61,33,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.02;
  });

  const size = realistic ? SUN_SIZE * 1.4 : SUN_SIZE;

  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[size, 48, 32]} />
        <meshBasicMaterial map={map} toneMapped={false} />
      </mesh>
      <sprite scale={[size * 6, size * 6, 1]}>
        <spriteMaterial map={glowTexture} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <pointLight intensity={realistic ? 1200 : 380} decay={2} distance={0} color="#fff3e0" />
      {showLabels && (
        <Html center distanceFactor={60} position={[0, size + 1.2, 0]} zIndexRange={[10, 0]}>
          <div className="pointer-events-none font-mono text-[11px] tracking-[0.2em] whitespace-nowrap text-amber/90 uppercase">
            Sun
          </div>
        </Html>
      )}
    </group>
  );
}

/* ── Saturn-style ring ────────────────────────────────────────── */

function PlanetRing({ planet, size }: { planet: Planet; size: number }) {
  const [tex] = useTexture([planet.ring!.texture]);
  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
  }, [tex]);
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[size * planet.ring!.inner, size * planet.ring!.outer, 96]} />
      <meshBasicMaterial map={tex} transparent opacity={0.85} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

/* ── Single planet ────────────────────────────────────────────── */

function PlanetBody({
  planet,
  controls,
  selected,
  onSelect,
  elapsedDaysRef,
  registerAnchor,
}: {
  planet: Planet;
  controls: SolarControls;
  selected: boolean;
  onSelect: (id: string | null) => void;
  elapsedDaysRef: React.MutableRefObject<number>;
  registerAnchor: (id: string, g: THREE.Group | null) => void;
}) {
  const orbitRef = useRef<THREE.Group>(null);
  const anchorRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const [map] = useTexture([planet.texture]);
  useEffect(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 4;
  }, [map]);

  useEffect(() => {
    registerAnchor(planet.id, anchorRef.current);
    return () => registerAnchor(planet.id, null);
  }, [planet.id, registerAnchor]);

  const dist = controls.realisticScale
    ? realDistance(planet.distanceMkm / 149.6)
    : sceneDistance(planet.distanceMkm / 149.6);
  const size = controls.realisticScale ? realSize(planet.diameterKm) : sceneSize(planet.diameterKm);

  const angle0 = INITIAL_ANGLES[planet.id] ?? 0;
  const inc = THREE.MathUtils.degToRad(planet.inclinationDeg);

  useFrame((_, delta) => {
    const el = orbitRef.current;
    if (!el) return;
    const days = elapsedDaysRef.current;
    const angle = angle0 + (days / planet.orbitDays) * Math.PI * 2;
    el.position.set(Math.cos(angle) * dist, 0, -Math.sin(angle) * dist);

    if (spinRef.current && controls.playing) {
      const rotationsPerDay = 24 / Math.abs(planet.rotationHours);
      const dir = planet.rotationHours < 0 ? -1 : 1;
      spinRef.current.rotation.y += dir * delta * controls.daysPerSecond * rotationsPerDay * 0.55;
    }
  });

  return (
    <group rotation={[inc, 0, 0]}>
      {controls.showOrbits && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[dist - 0.015, dist + 0.015, 160]} />
          <meshBasicMaterial
            color={selected ? planet.color : "#25355c"}
            transparent
            opacity={selected ? 0.7 : 0.35}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      <group ref={orbitRef}>
        <group ref={anchorRef} />
        <group ref={spinRef} rotation={[0, 0, THREE.MathUtils.degToRad(planet.axialTiltDeg)]}>
          <mesh
            onClick={(e) => {
              e.stopPropagation();
              onSelect(selected ? null : planet.id);
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
            <sphereGeometry args={[size, 48, 32]} />
            <meshStandardMaterial
              map={map}
              roughness={0.9}
              metalness={0}
              emissive={planet.color}
              emissiveIntensity={hovered ? 0.3 : selected ? 0.16 : 0.02}
            />
          </mesh>

          {planet.ring && <PlanetRing planet={planet} size={size} />}
        </group>

        {controls.showLabels && (
          <Html center distanceFactor={70} position={[0, size + 0.75, 0]} zIndexRange={[10, 0]}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(selected ? null : planet.id);
              }}
              className={`pointer-events-auto cursor-pointer font-mono text-[11px] tracking-[0.18em] whitespace-nowrap uppercase transition-colors ${
                selected ? "text-cyan" : "text-dim hover:text-star"
              }`}
            >
              {planet.name}
            </button>
          </Html>
        )}
      </group>
    </group>
  );
}

/* ── Asteroid belt (instanced) ────────────────────────────────── */

const ASTEROID_COUNT = 1100;

/* deterministic PRNG so the belt is stable across renders/reloads */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function AsteroidBelt({ elapsedDaysRef }: { elapsedDaysRef: React.MutableRefObject<number> }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const rocks = useMemo(() => {
    const rand = mulberry32(20261102);
    return Array.from({ length: ASTEROID_COUNT }, () => {
      const r = 13.5 + rand() * 4.5 + rand() * rand() * 2;
      return {
        r,
        angle: rand() * Math.PI * 2,
        speed: Math.pow(30 / r, 1.5), // Kepler-ish
        y: (rand() - 0.5) * 0.7,
        s: 0.03 + rand() * rand() * 0.12,
        tumble: rand() * Math.PI,
      };
    });
  }, []);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const days = elapsedDaysRef.current;
    for (let i = 0; i < ASTEROID_COUNT; i++) {
      const rock = rocks[i];
      const a = rock.angle + (days / 365) * rock.speed * Math.PI * 2 * 0.2;
      dummy.position.set(Math.cos(a) * rock.r, rock.y, -Math.sin(a) * rock.r);
      dummy.rotation.set(rock.tumble, a, 0);
      dummy.scale.setScalar(rock.s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, ASTEROID_COUNT]} frustumCulled={false}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#6b7280" roughness={1} />
    </instancedMesh>
  );
}

/* ── Camera that follows the selected planet ──────────────────── */

function CameraRig({
  selectedId,
  anchors,
  controls,
}: {
  selectedId: string | null;
  anchors: AnchorRegistry;
  controls: SolarControls;
}) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  const desired = useMemo(() => new THREE.Vector3(), []);
  const orbit = useRef<OrbitControlsImpl | null>(null);

  useFrame((_, delta) => {
    const k = 1 - Math.exp(-3.2 * delta);
    if (!selectedId) return;
    const anchor = anchors.current[selectedId];
    if (!anchor) return;
    anchor.getWorldPosition(target);
    const planet = PLANETS.find((p) => p.id === selectedId)!;
    const size = controls.realisticScale ? realSize(planet.diameterKm) : sceneSize(planet.diameterKm);
    const dist = Math.max(size * 5.5, size + 1.6);
    const dir = camera.position.clone().sub(target);
    if (dir.lengthSq() < 1e-6) dir.set(0, 0.4, 1);
    dir.normalize().multiplyScalar(dist);
    desired.copy(target).add(dir);
    camera.position.lerp(desired, k);
    if (orbit.current) {
      orbit.current.target.lerp(target, k);
      orbit.current.update();
    }
  });

  return (
    <OrbitControls
      ref={orbit}
      enablePan={false}
      minDistance={0.3}
      maxDistance={controls.realisticScale ? 420 : 130}
      enableDamping
      dampingFactor={0.06}
      maxPolarAngle={Math.PI * 0.92}
    />
  );
}

/* single source of simulated time — exactly one accumulator, never per planet */
function TimeKeeper({
  controls,
  elapsedDaysRef,
}: {
  controls: SolarControls;
  elapsedDaysRef: React.MutableRefObject<number>;
}) {
  useFrame((_, delta) => {
    if (controls.playing) {
      elapsedDaysRef.current += delta * controls.daysPerSecond;
    }
  });
  return null;
}

/* ── Full scene ───────────────────────────────────────────────── */

export function SolarScene({
  controls,
  selectedId,
  onSelect,
}: {
  controls: SolarControls;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const elapsedDaysRef = useRef(0);
  const anchors = useRef<Record<string, THREE.Group | null>>({});

  const registerAnchor = useMemo(
    () => (id: string, g: THREE.Group | null) => {
      if (g) anchors.current[id] = g;
      else delete anchors.current[id];
    },
    []
  );

  return (
    <>
      <ambientLight intensity={0.14} />
      <TimeKeeper controls={controls} elapsedDaysRef={elapsedDaysRef} />
      <Sun realistic={controls.realisticScale} showLabels={controls.showLabels} />
      {PLANETS.map((p) => (
        <PlanetBody
          key={p.id}
          planet={p}
          controls={controls}
          selected={selectedId === p.id}
          onSelect={onSelect}
          elapsedDaysRef={elapsedDaysRef}
          registerAnchor={registerAnchor}
        />
      ))}
      {!controls.realisticScale && <AsteroidBelt elapsedDaysRef={elapsedDaysRef} />}
      <StarField count={4200} radius={controls.realisticScale ? 900 : 220} />
      <CameraRig selectedId={selectedId} anchors={anchors} controls={controls} />
    </>
  );
}
