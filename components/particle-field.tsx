"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useScroll, type MotionValue } from "framer-motion";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import * as THREE from "three";
import { palette, toGlsl } from "@/config/palette";

const reducedQuery = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => { const m = window.matchMedia(reducedQuery); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); };
const noop = () => () => {};
let webglCache: boolean | undefined;
function hasWebGL() { if (webglCache !== undefined) return webglCache; try { const c = document.createElement("canvas"); webglCache = Boolean(c.getContext("webgl2") || c.getContext("webgl")); } catch { webglCache = false; } return webglCache; }

const GOLDEN = Math.PI * (3 - Math.sqrt(5));
function rng(seed: number) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/** Every point owns a home position in each shape; scrolling swarms them from one home to the next. */
const shapeBuilders: ((i: number, n: number, r: () => number) => [number, number, number])[] = [
  // 0 · a wide spiral galaxy
  (i, n, r) => { const arm = i % 3; const d = Math.sqrt(r()) * 6; const a = d * 0.95 + (arm * Math.PI * 2) / 3 + (r() - 0.5) * 0.55; return [Math.cos(a) * d, (r() - 0.5) * 0.35 * (1 - d / 8), Math.sin(a) * d]; },
  // 1 · a sphere (brand: one recognisable form)
  (i, n) => { const y = 1 - (i / (n - 1)) * 2; const rad = Math.sqrt(1 - y * y); const a = i * GOLDEN; return [Math.cos(a) * rad * 3.1, y * 3.1, Math.sin(a) * rad * 3.1]; },
  // 2 · a torus (loops, workflows, automation)
  (i, n, r) => { const u = r() * Math.PI * 2; const v = r() * Math.PI * 2; const R = 3.1; const t = 1.05; return [(R + t * Math.cos(v)) * Math.cos(u), t * Math.sin(v), (R + t * Math.cos(v)) * Math.sin(u)]; },
  // 3 · a double helix (steady growth)
  (i, n, r) => { const t = i / n; const strand = i % 2; const a = t * Math.PI * 7 + strand * Math.PI; const rad = 1.55 + (r() - 0.5) * 0.25; return [Math.cos(a) * rad, (t - 0.5) * 9, Math.sin(a) * rad]; },
  // 4 · a rolling wave of light
  (i, n) => { const side = Math.floor(Math.sqrt(n)); const gx = i % side; const gz = Math.floor(i / side); const x = (gx / side - 0.5) * 12; const z = (gz / side - 0.5) * 9; return [x, Math.sin(x * 0.9) * 0.9 + Math.cos(z * 0.8) * 0.6, z]; },
  // 5 · a cube shell (software: structure)
  (i, n, r) => { const f = i % 6; const a = (r() - 0.5) * 5.4; const b = (r() - 0.5) * 5.4; const s = f < 3 ? 2.7 : -2.7; return f % 3 === 0 ? [s, a, b] : f % 3 === 1 ? [a, s, b] : [a, b, s]; },
  // 6 · an orb wrapped in a halo ring (the finale)
  (i, n, r) => { if (i % 3) { const y = r() * 2 - 1; const rad = Math.sqrt(1 - y * y); const a = r() * Math.PI * 2; return [Math.cos(a) * rad * 2.3, y * 2.3, Math.sin(a) * rad * 2.3]; } const a = r() * Math.PI * 2; const d = 3.6 + (r() - 0.5) * 0.5; return [Math.cos(a) * d, (r() - 0.5) * 0.12, Math.sin(a) * d]; },
];

function buildShapes(count: number) {
  const r = rng(7);
  return shapeBuilders.map(build => { const arr = new Float32Array(count * 3); for (let i = 0; i < count; i++) { const [x, y, z] = build(i, count, r); arr.set([x, y, z], i * 3); } return arr; });
}

const vertex = /* glsl */ `
  attribute vec3 aTarget;
  attribute vec3 aSeed;
  uniform float uMix;
  uniform float uTime;
  uniform float uSize;
  varying vec3 vColor;
  varying float vFade;
  void main() {
    float t = clamp((uMix - aSeed.x * 0.45) / 0.55, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);
    float swarm = sin(t * 3.14159265);
    vec3 p = mix(position, aTarget, t);
    p += vec3(sin(uTime * 0.6 + aSeed.y * 40.0), cos(uTime * 0.5 + aSeed.y * 23.0), sin(uTime * 0.4 + aSeed.y * 11.0)) * (0.07 + swarm * 1.4 * aSeed.z);
    p.y += sin(p.x * 0.7 + uTime * 0.7) * 0.07;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.55 + aSeed.z * 0.95) * (1.0 + swarm * 0.6) / -mv.z;
    vec3 cyan = ${toGlsl(palette.particles.a)}; vec3 blue = ${toGlsl(palette.particles.b)}; vec3 violet = ${toGlsl(palette.particles.c)};
    vColor = aSeed.y < 0.5 ? mix(cyan, blue, aSeed.y * 2.0) : mix(blue, violet, aSeed.y * 2.0 - 1.0);
    vFade = 0.45 + aSeed.z * 0.55;
  }
`;
const fragment = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vFade;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vColor, smoothstep(0.5, 0.0, d) * vFade * uOpacity);
  }
`;

function Points({ progress, count, size, reduced }: { progress: MotionValue<number>; count: number; size: number; reduced: boolean }) {
  const shapes = useMemo(() => buildShapes(count), [count]);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const seed = new Float32Array(count * 3); const r = rng(21);
    for (let i = 0; i < count; i++) seed.set([r(), r(), r()], i * 3);
    g.setAttribute("position", new THREE.BufferAttribute(shapes[0].slice(), 3));
    g.setAttribute("aTarget", new THREE.BufferAttribute(shapes[1].slice(), 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 3));
    return g;
  }, [shapes, count]);
  const material = useRef<THREE.ShaderMaterial>(null);
  const initial = useMemo(() => ({ uMix: { value: 0 }, uTime: { value: 0 }, uSize: { value: size }, uOpacity: { value: 0.7 } }), [size]);
  const group = useRef<THREE.Group>(null);
  const segment = useRef(0);
  const current = useRef(0);
  const invalidate = useThree(s => s.invalidate);
  useEffect(() => progress.on("change", () => { if (reduced) invalidate(); }), [progress, reduced, invalidate]);

  useFrame(({ clock, pointer }, delta) => {
    const last = shapes.length - 1;
    const goal = Math.min(Math.max(progress.get(), 0), 1) * last;
    current.current = reduced ? goal : THREE.MathUtils.damp(current.current, goal, 3.2, delta);
    const seg = Math.min(Math.floor(current.current), last - 1);
    if (seg !== segment.current) {
      segment.current = seg;
      const a = geometry.getAttribute("position") as THREE.BufferAttribute; const b = geometry.getAttribute("aTarget") as THREE.BufferAttribute;
      (a.array as Float32Array).set(shapes[seg]); (b.array as Float32Array).set(shapes[seg + 1]);
      a.needsUpdate = true; b.needsUpdate = true;
    }
    const u = material.current?.uniforms; if (u) { u.uMix.value = Math.min(current.current - seg, 1); u.uTime.value = reduced ? 0 : clock.elapsedTime; }
    const g = group.current; if (!g) return;
    const tilt = THREE.MathUtils.lerp(0.95, 0.18, Math.min(current.current, 1));
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, tilt - pointer.y * 0.12, 2.5, delta);
    g.rotation.y += reduced ? 0 : delta * 0.05;
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, -pointer.x * 0.08, 2.5, delta);
  });

  return <group ref={group}>
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial ref={material} vertexShader={vertex} fragmentShader={fragment} uniforms={initial} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  </group>;
}

/** 9,000 points of light fixed behind the whole site. Scroll is read in the frame loop, so React never re-renders while you scroll. */
export function ParticleField() {
  const reduced = useSyncExternalStore(subscribeReduced, () => window.matchMedia(reducedQuery).matches, () => true);
  const webgl = useSyncExternalStore(noop, hasWebGL, () => false);
  const small = useSyncExternalStore(noop, () => window.innerWidth < 700, () => false);
  const { scrollYProgress } = useScroll();
  if (!webgl) return null;
  const dpr = Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio, small ? 1.5 : 2);
  return <div className="particle-field" aria-hidden="true">
    <Canvas frameloop={reduced ? "demand" : "always"} dpr={[1, small ? 1.5 : 2]} camera={{ position: [0, 0, 11], fov: 45 }} gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}>
      <Points progress={scrollYProgress} count={small ? 4500 : 9000} size={(small ? 22 : 28) * dpr} reduced={reduced} />
    </Canvas>
  </div>;
}
