"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";

function Core({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock, pointer }) => {
    if (!group.current || reduced) return;
    group.current.rotation.y = clock.elapsedTime * 0.09 + pointer.x * 0.13;
    group.current.rotation.x = -0.2 + pointer.y * 0.09;
  });
  return <group ref={group} rotation={[-0.2, 0, 0]}>
    <mesh><icosahedronGeometry args={[2.15, 5]} /><meshPhysicalMaterial color="#0b1b43" metalness={0.52} roughness={0.22} transmission={0.38} thickness={1.4} clearcoat={1} clearcoatRoughness={0.12} /></mesh>
    <mesh scale={1.015}><icosahedronGeometry args={[2.15, 2]} /><meshBasicMaterial color="#42d7ff" wireframe transparent opacity={0.18} /></mesh>
    <mesh rotation={[0.35, 0.6, 0.2]}><torusGeometry args={[2.72, 0.012, 8, 120]} /><meshBasicMaterial color="#70deff" transparent opacity={0.55} /></mesh>
    <mesh rotation={[1.3, 0.2, 0.8]}><torusGeometry args={[2.58, 0.01, 8, 120]} /><meshBasicMaterial color="#826aff" transparent opacity={0.43} /></mesh>
    {Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI * 2 / 12; const b = (i % 4 - 1.5) * 0.45; return <mesh key={i} position={[Math.cos(a) * 2.2, Math.sin(b) * 2.1, Math.sin(a) * 2.2]}><sphereGeometry args={[i % 3 === 0 ? 0.07 : 0.035, 12, 12]} /><meshBasicMaterial color={i % 3 === 0 ? "#a7f6ff" : "#478dff"} /></mesh>; })}
  </group>;
}

export function HeroScene() {
  const [enabled, setEnabled] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    if (!media.matches) {
      try { const canvas = document.createElement("canvas"); setEnabled(Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"))); } catch { setEnabled(false); }
    }
    const listener = () => setReduced(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);
  if (!enabled || reduced) return <div className="orb-fallback" role="img" aria-label="Abstract luminous digital sphere"><div className="orb-fallback-core"/><div className="orb-ring orb-ring-one"/><div className="orb-ring orb-ring-two"/></div>;
  return <div className="hero-canvas" aria-hidden="true"><Suspense fallback={<div className="orb-fallback"/>}><Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 7.8], fov: 42 }} gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}><ambientLight intensity={1.3} /><pointLight position={[4, 4, 4]} intensity={45} color="#51d7ff" /><pointLight position={[-5, -3, 1]} intensity={35} color="#654dff" /><Float speed={1.2} rotationIntensity={0.12} floatIntensity={0.18}><Core reduced={reduced}/></Float><Stars radius={45} depth={20} count={80} factor={1.7} saturation={0} fade speed={0.25}/></Canvas></Suspense></div>;
}
