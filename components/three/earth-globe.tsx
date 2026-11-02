"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { subsolarPoint, latLonToVec3 } from "@/lib/astronomy";

/* ── shared vertex shader ─────────────────────────────────────── */

const surfaceVert = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vUv = uv;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

/* ── Earth surface: real-time day/night terminator ────────────── */

const earthFrag = /* glsl */ `
  uniform sampler2D dayMap;
  uniform sampler2D nightMap;
  uniform vec3 sunDirection;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vec3 day = texture2D(dayMap, vUv).rgb;
    vec3 nightRaw = texture2D(nightMap, vUv).rgb;
    // city lights: brightness-selective so oceans stay black
    float lights = dot(nightRaw, vec3(0.299, 0.587, 0.114));
    vec3 night = smoothstep(0.03, 0.42, lights) * vec3(1.0, 0.82, 0.55) * 1.6;

    float sunDot = dot(normalize(vNormal), normalize(sunDirection));
    float dayness = smoothstep(-0.08, 0.28, sunDot);

    vec3 color = mix(night, day * (0.28 + 0.92 * dayness), dayness);

    // warm terminator band
    float terminator = 1.0 - smoothstep(0.0, 0.08, abs(sunDot));
    color += vec3(0.55, 0.28, 0.1) * terminator * 0.18;

    // atmospheric fresnel rim — stronger on the lit limb
    float fresnel = pow(1.0 - max(dot(normalize(vViewDir), normalize(vNormal)), 0.0), 2.6);
    vec3 rim = mix(vec3(0.02, 0.05, 0.12), vec3(0.25, 0.55, 1.0), dayness);
    color += rim * fresnel * (0.35 + 0.85 * dayness);

    gl_FragColor = vec4(color, 1.0);
  }
`;

/* ── Clouds: same sun vector → shading matches the terminator ── */

const cloudFrag = /* glsl */ `
  uniform sampler2D cloudMap;
  uniform vec3 sunDirection;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vec4 tex = texture2D(cloudMap, vUv);
    float lum = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
    float alpha = lum * tex.a;
    float sunDot = dot(normalize(vNormal), normalize(sunDirection));
    float dayness = smoothstep(-0.12, 0.3, sunDot);
    float fresnel = pow(1.0 - max(dot(normalize(vViewDir), normalize(vNormal)), 0.0), 2.0);
    vec3 color = vec3(1.0) * (0.04 + 0.96 * dayness) + vec3(0.2, 0.4, 0.8) * fresnel * dayness * 0.4;
    gl_FragColor = vec4(color, alpha * (0.12 + 0.88 * dayness));
  }
`;

/* ── Outer atmosphere: additive backside fresnel shell ────────── */

const atmoFrag = /* glsl */ `
  uniform vec3 sunDirection;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float intensity = pow(0.72 - dot(normalize(vNormal), normalize(vViewDir)), 3.4);
    float sunDot = dot(normalize(-vNormal), normalize(sunDirection));
    float lit = smoothstep(-0.35, 0.45, sunDot);
    vec3 glow = mix(vec3(0.03, 0.07, 0.18), vec3(0.28, 0.58, 1.0), lit);
    gl_FragColor = vec4(glow, 1.0) * intensity * (0.5 + 1.1 * lit);
  }
`;

/* ── ISS marker + ground track (lives in the geographic frame) ── */

function IssMarker({ lat, lon, altitudeKm, track }: {
  lat: number;
  lon: number;
  altitudeKm: number;
  track?: [number, number, number][];
}) {
  const pulse = useRef<THREE.Mesh>(null);
  const stalk = useRef<THREE.Group>(null);
  const r = 1 + (altitudeKm / 6371) * 1;

  const position = useMemo(() => latLonToVec3(lat, lon, r), [lat, lon, r]);

  const trackGeometry = useMemo(() => {
    if (!track || track.length < 2) return null;
    const curve = new THREE.CatmullRomCurve3(track.map((p) => new THREE.Vector3(...p)));
    return new THREE.BufferGeometry().setFromPoints(curve.getPoints(240));
  }, [track]);

  useFrame(({ clock }) => {
    const t = (clock.elapsedTime % 1.6) / 1.6;
    if (pulse.current) {
      pulse.current.scale.setScalar(1 + t * 2.6);
      (pulse.current.material as THREE.MeshBasicMaterial).opacity = 0.55 * (1 - t);
    }
    if (stalk.current) {
      stalk.current.lookAt(0, 0, 0);
      stalk.current.rotateX(Math.PI / 2);
    }
  });

  return (
    <group>
      {trackGeometry && (
        <line>
          <primitive object={trackGeometry} attach="geometry" />
          <lineBasicMaterial color="#fc3d21" transparent opacity={0.5} />
        </line>
      )}
      <group position={position}>
        <mesh>
          <sphereGeometry args={[0.016, 12, 12]} />
          <meshBasicMaterial color="#ff5a3c" toneMapped={false} />
        </mesh>
        <mesh ref={pulse}>
          <sphereGeometry args={[0.016, 12, 12]} />
          <meshBasicMaterial color="#ff5a3c" transparent opacity={0.5} depthWrite={false} toneMapped={false} />
        </mesh>
        {/* stalk down to the surface */}
        <group ref={stalk}>
          <mesh position={[0, -(r - 1) / 2, 0]}>
            <cylinderGeometry args={[0.0022, 0.0022, r - 1, 6]} />
            <meshBasicMaterial color="#fc3d21" transparent opacity={0.3} toneMapped={false} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* ── The globe ────────────────────────────────────────────────── */

export interface EarthGlobeProps {
  /** UTC epoch ms to render the terminator for (default: real clock). */
  timeOverrideMs?: number;
  showClouds?: boolean;
  showAtmosphere?: boolean;
  iss?: { lat: number; lon: number; altitudeKm: number; track?: [number, number, number][] } | null;
  /** slow continuous spin for hero use (rad/s) */
  autoRotateSpeed?: number;
  detail?: "high" | "medium";
}

export function EarthGlobe({
  timeOverrideMs,
  showClouds = true,
  showAtmosphere = true,
  iss = null,
  autoRotateSpeed = 0.05,
  detail = "medium",
}: EarthGlobeProps) {
  const [dayMap, nightMap, cloudsMap] = useTexture([
    "/textures/earth_day_4k.jpg",
    "/textures/earth_night_4k.jpg",
    "/textures/earth_clouds_2k.webp",
  ]);
  for (const t of [dayMap, nightMap, cloudsMap]) {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
  }

  const globeRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const lastSun = useRef(-2);
  // shared, mutated in place — one source of truth for all three shaders
  const sunDir = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const geoSun = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const worldQuat = useMemo(() => new THREE.Quaternion(), []);

  const earthUniforms = useMemo(
    () => ({
      dayMap: { value: dayMap },
      nightMap: { value: nightMap },
      sunDirection: { value: sunDir },
    }),
    [dayMap, nightMap, sunDir]
  );
  const cloudUniforms = useMemo(
    () => ({ cloudMap: { value: cloudsMap }, sunDirection: { value: sunDir } }),
    [cloudsMap, sunDir]
  );
  const atmoUniforms = useMemo(() => ({ sunDirection: { value: sunDir } }), [sunDir]);

  useFrame(({ clock }, delta) => {
    // real subsolar point at 1 Hz, in the globe's geographic frame
    if (clock.elapsedTime - lastSun.current > 1) {
      lastSun.current = clock.elapsedTime;
      const d = timeOverrideMs !== undefined ? new Date(timeOverrideMs) : new Date();
      const { lat, lon } = subsolarPoint(d);
      geoSun.set(...latLonToVec3(lat, lon, 1)).normalize();
    }
    // geographic → world each frame: mirror the full world rotation of the
    // globe group (including ancestor tilts and auto-spin) so the terminator
    // stays pinned to real Earth
    if (globeRef.current) {
      globeRef.current.getWorldQuaternion(worldQuat);
      sunDir.copy(geoSun).applyQuaternion(worldQuat);
      if (autoRotateSpeed > 0) {
        globeRef.current.rotation.y += delta * autoRotateSpeed;
      }
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.006;
    }
  });

  const segments: [number, number] = detail === "high" ? [128, 96] : [96, 64];

  return (
    <group>
      <group ref={globeRef}>
        <mesh>
          <sphereGeometry args={[1, segments[0], segments[1]]} />
          <shaderMaterial
            vertexShader={surfaceVert}
            fragmentShader={earthFrag}
            uniforms={earthUniforms}
          />
        </mesh>

        {showClouds && (
          <mesh ref={cloudsRef} scale={1.01}>
            <sphereGeometry args={[1, segments[0], segments[1]]} />
            <shaderMaterial
              vertexShader={surfaceVert}
              fragmentShader={cloudFrag}
              uniforms={cloudUniforms}
              transparent
              depthWrite={false}
            />
          </mesh>
        )}

        {iss && (
          <IssMarker
            lat={iss.lat}
            lon={iss.lon}
            altitudeKm={iss.altitudeKm}
            track={iss.track}
          />
        )}
      </group>

      {showAtmosphere && (
        <mesh scale={1.16}>
          <sphereGeometry args={[1, 64, 48]} />
          <shaderMaterial
            vertexShader={surfaceVert}
            fragmentShader={atmoFrag}
            uniforms={atmoUniforms}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            transparent
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
