"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { EarthGlobe } from "./earth-globe";
import { StarField, LazyCanvas } from "./scene";
import { useIssPosition } from "@/hooks/use-iss";

/* Cinematic hero: mouse-parallax camera + scroll-linked descent.
   The Earth keeps a REAL day/night terminator from the live clock. */

function ParallaxEarth() {
  const group = useRef<THREE.Group>(null);
  const { camera, pointer, viewport } = useThree();
  const target = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (!group.current) return;

    // responsive placement: right-of-center on wide screens, centered on phones
    const aspect = viewport.aspect ?? 1;
    const wide = aspect > 1.1;
    group.current.position.x = wide ? 1.62 : 0;
    group.current.position.y = wide ? 0 : 0.55;
    const s = wide ? 1.08 : 0.82;
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, s, 4, delta));

    // scroll: drift down + slight extra spin as you leave the hero
    const scroll = Math.min(1, Math.max(0, window.scrollY / Math.max(1, window.innerHeight)));
    group.current.position.y -= scroll * 1.2;
    group.current.rotation.z = scroll * 0.12;

    // mouse parallax
    target.current.set(pointer.x * 0.55, pointer.y * 0.35 + 0.1, 5.6 + scroll * 1.1);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, target.current.x, 3, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, target.current.y, 3, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, target.current.z, 3, delta);
    camera.lookAt(wide ? 1.2 : 0, wide ? 0 : 0.4, 0);
  });

  return (
    <group ref={group} rotation={[0.18, -0.9, 0.05]} scale={0.001}>
      <EarthGlobe autoRotateSpeed={0.05} />
    </group>
  );
}

export function HeroCanvas() {
  return (
    <LazyCanvas
      className="absolute inset-0"
      camera={{ position: [0, 0.15, 5.6], fov: 42 }}
      ariaLabel="A 3D Earth with its current day and night sides, slowly rotating in space"
    >
      <ParallaxEarth />
      <StarField count={2600} radius={60} />
    </LazyCanvas>
  );
}

/* Earth page uses the same scene with OrbitControls + live ISS */
export { LazyCanvas };
