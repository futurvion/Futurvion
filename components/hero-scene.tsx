"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, MeshDistortMaterial } from "@react-three/drei";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import * as THREE from "three";

const damp = THREE.MathUtils.damp;
const reducedQuery = "(prefers-reduced-motion: reduce)";
function subscribeReduced(cb: () => void) { const m = window.matchMedia(reducedQuery); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); }
let webglCache: boolean | undefined;
function hasWebGL() { if (webglCache !== undefined) return webglCache; try { const c = document.createElement("canvas"); webglCache = Boolean(c.getContext("webgl2") || c.getContext("webgl")); } catch { webglCache = false; } return webglCache; }
const noop = () => () => {};
const isSmall = () => window.innerWidth < 700;

const palette = ["#e0673c", "#f4b183", "#e9b44c", "#b4532a", "#f7d9c0", "#d9708a"].map(c => new THREE.Color(c));
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/** A sunflower-spiral disc of small spheres that ripples outward: growth as a pattern. */
function Bloom({ small }: { small: boolean }) {
  const count = small ? 130 : 240;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const disc = useRef<THREE.Group>(null);
  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => {
    const radius = 2.55 + 0.085 * Math.sqrt(i) * (small ? 1.45 : 1);
    return { angle: i * GOLDEN, radius, size: 0.03 + (i % 7) * 0.005 + (radius - 2.55) * 0.012 };
  }), [count, small]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    const m = mesh.current; if (!m) return;
    seeds.forEach((_, i) => m.setColorAt(i, palette[(i * 7) % palette.length]));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [seeds]);

  useFrame(({ clock }, delta) => {
    const m = mesh.current; if (!m) return;
    const t = clock.elapsedTime;
    if (disc.current) disc.current.rotation.z += delta * 0.07;
    seeds.forEach((s, i) => {
      const wave = Math.sin(s.radius * 2.1 - t * 1.5 + s.angle * 0.3);
      dummy.position.set(Math.cos(s.angle) * s.radius, Math.sin(s.angle) * s.radius, wave * 0.26);
      dummy.scale.setScalar(s.size * (1 + wave * 0.35));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return <group ref={disc} rotation={[0, 0, 0]}>
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 14, 14]} />
      <meshStandardMaterial roughness={0.32} metalness={0.15} />
    </instancedMesh>
  </group>;
}

function Rings() {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => { if (a.current) a.current.rotation.z += delta * 0.18; if (b.current) b.current.rotation.z -= delta * 0.12; });
  return <>
    <mesh ref={a} rotation={[0.25, 0.3, 0]}><torusGeometry args={[2.3, 0.012, 8, 200]} /><meshStandardMaterial color="#b4532a" roughness={0.4} metalness={0.6} /></mesh>
    <mesh ref={b} rotation={[-0.2, -0.35, 0]}><torusGeometry args={[3.9, 0.008, 8, 220]} /><meshStandardMaterial color="#e9b44c" roughness={0.4} metalness={0.6} transparent opacity={0.7} /></mesh>
  </>;
}

function Drift({ small }: { small: boolean }) {
  const count = small ? 18 : 34;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const items = useMemo(() => Array.from({ length: count }, (_, i) => {
    const a = i * GOLDEN * 1.7; const r = 3.2 + ((i * 53) % 37) / 37 * 2.2; const y = (((i * 31) % 29) / 29 - 0.5) * 5.4;
    return { x: Math.cos(a) * r, y, z: Math.sin(a) * r - 1.5, s: 0.045 + ((i * 17) % 11) / 11 * 0.07, p: i * 0.9 };
  }), [count]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => { const m = mesh.current; if (!m) return; items.forEach((_, i) => m.setColorAt(i, palette[i % palette.length])); if (m.instanceColor) m.instanceColor.needsUpdate = true; }, [items]);
  useFrame(({ clock }) => {
    const m = mesh.current; if (!m) return;
    items.forEach((it, i) => { dummy.position.set(it.x, it.y + Math.sin(clock.elapsedTime * 0.6 + it.p) * 0.25, it.z); dummy.scale.setScalar(it.s); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); });
    m.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} args={[undefined, undefined, count]}><icosahedronGeometry args={[1, 0]} /><meshStandardMaterial roughness={0.4} metalness={0.1} /></instancedMesh>;
}

function World({ small }: { small: boolean }) {
  const root = useRef<THREE.Group>(null);
  const blob = useRef<THREE.Mesh>(null);
  const mat = useRef<{ distort: number; speed: number } | null>(null);
  const hovered = useRef(false);
  const pulse = useRef(-10_000);

  useFrame(({ clock, pointer, camera }, delta) => {
    const t = clock.elapsedTime;
    const scroll = Math.min(window.scrollY / 800, 1);
    if (root.current) {
      root.current.rotation.y = damp(root.current.rotation.y, pointer.x * 0.4 + scroll * 0.8, 3, delta);
      root.current.rotation.x = damp(root.current.rotation.x, -pointer.y * 0.25 - 0.45 + scroll * 0.3, 3, delta);
      root.current.position.y = damp(root.current.position.y, Math.sin(t * 0.7) * 0.12 - scroll * 0.9, 4, delta);
      root.current.scale.setScalar(damp(root.current.scale.x, 1 - scroll * 0.2, 4, delta));
    }
    const age = Math.min((performance.now() - pulse.current) / 1200, 1);
    const kick = age < 1 ? Math.sin(age * Math.PI) * 0.35 : 0;
    if (mat.current) {
      mat.current.distort = damp(mat.current.distort, (hovered.current ? 0.52 : 0.38) + kick, 4, delta);
      mat.current.speed = damp(mat.current.speed, hovered.current ? 3 : 1.5, 3, delta);
    }
    if (blob.current) { blob.current.rotation.y += delta * 0.15; blob.current.scale.setScalar(damp(blob.current.scale.x, hovered.current ? 1.06 : 1, 4, delta)); }
    camera.position.x = damp(camera.position.x, pointer.x * 0.4, 2.5, delta);
    camera.position.y = damp(camera.position.y, pointer.y * 0.25, 2.5, delta);
    camera.lookAt(0, 0, 0);
  });

  return <group ref={root} onPointerOver={() => { hovered.current = true; document.body.style.cursor = "pointer"; }} onPointerOut={() => { hovered.current = false; document.body.style.cursor = ""; }} onClick={() => { pulse.current = performance.now(); }}>
    <mesh ref={blob}>
      <icosahedronGeometry args={[1.95, small ? 24 : 40]} />
      <MeshDistortMaterial ref={mat as never} color="#dc5a32" distort={0.38} speed={1.5} roughness={0.2} metalness={0.2} clearcoat={1} clearcoatRoughness={0.1} envMapIntensity={0.85} />
    </mesh>
    <mesh scale={0.62}><icosahedronGeometry args={[1.95, 5]} /><meshStandardMaterial color="#fff0dc" emissive="#ffd9a8" emissiveIntensity={0.9} roughness={0.5} transparent opacity={0.35} /></mesh>
    <Bloom small={small} />
    <Rings />
    <Drift small={small} />
  </group>;
}

function Scene() {
  const small = useSyncExternalStore(noop, isSmall, () => false);
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  // Pause rendering entirely while the hero is scrolled out of view.
  useEffect(() => {
    const el = wrap.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={wrap} className="hero-canvas" aria-hidden="true">
    <Suspense fallback={<div className="orb-fallback" />}>
      <Canvas frameloop={visible ? "always" : "never"} dpr={[1, small ? 1.25 : 1.6]} camera={{ position: [0, 0, 11.5], fov: 40 }} gl={{ alpha: true, antialias: !small, powerPreference: "high-performance" }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 5, 6]} intensity={2.2} color="#fff1e0" />
        <directionalLight position={[-5, -2, 3]} intensity={1.1} color="#ffb199" />
        <Environment resolution={128} frames={1}>
          <mesh scale={50}><sphereGeometry args={[1, 16, 16]} /><meshBasicMaterial color="#f1d3bb" side={THREE.BackSide} /></mesh>
          <Lightformer form="rect" intensity={3.2} position={[4, 4, 5]} scale={[7, 4, 1]} color="#fff6ea" />
          <Lightformer form="rect" intensity={2} position={[-6, 1, 3]} scale={[3, 6, 1]} color="#ffc9a8" />
          <Lightformer form="ring" intensity={2.2} position={[0, -4, 3]} scale={5} color="#ffe2b8" />
        </Environment>
        <World small={small} />
      </Canvas>
    </Suspense>
  </div>;
}

export function HeroScene() {
  const reduced = useSyncExternalStore(subscribeReduced, () => window.matchMedia(reducedQuery).matches, () => true);
  const webgl = useSyncExternalStore(noop, hasWebGL, () => false);
  if (!webgl || reduced) return <div className="orb-fallback" role="img" aria-label="Abstract warm glowing sphere"><div className="orb-fallback-core"/><div className="orb-ring orb-ring-one"/><div className="orb-ring orb-ring-two"/></div>;
  return <Scene />;
}
