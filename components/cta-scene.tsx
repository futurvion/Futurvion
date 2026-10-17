"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const STEPS = 44;

/** A rising double helix: a quiet visual metaphor for steady growth. */
function Helix() {
  const group = useRef<THREE.Group>(null);
  const a = useRef<THREE.InstancedMesh>(null);
  const b = useRef<THREE.InstancedMesh>(null);
  const points = useMemo(() => Array.from({ length: STEPS }, (_, i) => {
    const t = i / (STEPS - 1);
    return { angle: t * Math.PI * 5, radius: 0.7 + t * 0.9, y: (t - 0.5) * 7, scale: 0.5 + t * 0.9 };
  }), []);
  const rungs = useMemo(() => {
    const arr = new Float32Array(STEPS * 6);
    points.forEach((p, i) => {
      new THREE.Vector3(Math.cos(p.angle) * p.radius, p.y, Math.sin(p.angle) * p.radius).toArray(arr, i * 6);
      new THREE.Vector3(Math.cos(p.angle + Math.PI) * p.radius, p.y, Math.sin(p.angle + Math.PI) * p.radius).toArray(arr, i * 6 + 3);
    });
    return arr;
  }, [points]);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const pos = new THREE.Vector3();
    const scale = new THREE.Vector3();
    const strands: [THREE.InstancedMesh | null, number][] = [[a.current, 0], [b.current, Math.PI]];
    for (const [mesh, offset] of strands) {
      if (!mesh) continue;
      points.forEach((p, i) => {
        const angle = p.angle + offset;
        m.compose(pos.set(Math.cos(angle) * p.radius, p.y, Math.sin(angle) * p.radius), q, scale.setScalar(p.scale * 0.11));
        mesh.setMatrixAt(i, m);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }
  }, [points]);

  useFrame(({ pointer }, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.35;
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, 0.18 + pointer.x * 0.12, 3, delta);
  });

  return <group ref={group}>
    <instancedMesh ref={a} args={[undefined, undefined, STEPS]}><sphereGeometry args={[1, 16, 16]} /><meshStandardMaterial color="#e0673c" roughness={0.3} metalness={0.2} /></instancedMesh>
    <instancedMesh ref={b} args={[undefined, undefined, STEPS]}><sphereGeometry args={[1, 16, 16]} /><meshStandardMaterial color="#e9b44c" roughness={0.3} metalness={0.2} /></instancedMesh>
    <lineSegments><bufferGeometry><bufferAttribute attach="attributes-position" args={[rungs, 3]} /></bufferGeometry><lineBasicMaterial color="#b4532a" transparent opacity={0.35} /></lineSegments>
  </group>;
}

export function CtaScene() {
  return <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 9], fov: 40 }} gl={{ alpha: true, antialias: true }}>
    <ambientLight intensity={0.8} />
    <directionalLight position={[4, 3, 5]} intensity={2.4} color="#fff1e0" />
    <directionalLight position={[-4, -3, 3]} intensity={1.2} color="#ffb199" />
    <Helix />
  </Canvas>;
}
