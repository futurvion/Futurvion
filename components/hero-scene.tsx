"use client";

import Image from "next/image";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import * as THREE from "three";
import { palette } from "@/config/palette";

const damp = THREE.MathUtils.damp;
const reducedQuery = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => { const m = window.matchMedia(reducedQuery); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); };
const noop = () => () => {};
let webglCache: boolean | undefined;
function hasWebGL() { if (webglCache !== undefined) return webglCache; try { const c = document.createElement("canvas"); webglCache = Boolean(c.getContext("webgl2") || c.getContext("webgl")); } catch { webglCache = false; } return webglCache; }
const isSmall = () => window.innerWidth < 700;

const MARK_SRC = "/logo-mark.png";
const MARK_WIDTH = 4.5;

interface Cloud { home: Float32Array; color: Float32Array; seed: Float32Array; scatter: Float32Array; count: number; height: number }

/** Reads the real logo pixels and scatters `max` points across its silhouette, keeping each pixel's own colour. */
async function sampleLogo(max: number): Promise<Cloud> {
  const img = new window.Image();
  img.src = MARK_SRC;
  await img.decode();
  const W = img.naturalWidth; const H = img.naturalHeight;
  const canvas = document.createElement("canvas"); canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, W, H);
  const data = ctx.getImageData(0, 0, W, H).data;
  const solid: number[] = [];
  for (let i = 0; i < W * H; i++) if (data[i * 4 + 3] > 150) solid.push(i);
  const height = (MARK_WIDTH * H) / W;
  const home = new Float32Array(max * 3); const color = new Float32Array(max * 3); const seed = new Float32Array(max * 3); const scatter = new Float32Array(max * 3);
  const lift = new THREE.Color(palette.emblem.lift); const c = new THREE.Color();
  for (let n = 0; n < max; n++) {
    const px = solid[Math.floor(Math.random() * solid.length)];
    const x = px % W; const y = Math.floor(px / W);
    const r = data[px * 4] / 255; const g = data[px * 4 + 1] / 255; const b = data[px * 4 + 2] / 255;
    const lum = 0.3 * r + 0.59 * g + 0.11 * b;
    // Dark folds of the logo would vanish under additive light, so lift them slightly toward the brand blue.
    c.setRGB(r, g, b).lerp(lift, 0.22 * (1 - lum)).multiplyScalar(1.15);
    home.set([((x + Math.random()) / W - 0.5) * MARK_WIDTH, (0.5 - (y + Math.random()) / H) * height, (Math.random() - 0.5) * 0.42 + (lum - 0.5) * 0.35], n * 3);
    color.set([c.r, c.g, c.b], n * 3);
    seed.set([Math.random(), Math.random(), Math.random()], n * 3);
    scatter.set([Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1], n * 3);
  }
  return { home, color, seed, scatter, count: max, height };
}

const vertex = /* glsl */ `
  attribute vec3 aColor;
  attribute vec3 aSeed;
  attribute vec3 aScatter;
  uniform vec2 uSpread;
  uniform vec2 uShift;
  uniform float uTime;
  uniform float uForm;
  uniform float uBurst;
  uniform float uSize;
  uniform vec2 uPointer;
  uniform float uPush;
  varying vec3 vColor;
  varying float vGlow;
  void main() {
    // Assemble: the points start spread across the whole screen, then each flies in to its place on the logo, on its own delay.
    float t = clamp((uForm - aSeed.x * 0.4) / 0.6, 0.0, 1.0);
    t = t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
    vec3 from = vec3(aScatter.xy * uSpread + uShift, aScatter.z * 3.5);
    vec3 p = mix(from, position, t);
    // A slight curved sweep on the way in, so they swirl rather than travel in straight lines.
    float arc = sin(t * 3.14159265) * (1.0 - aSeed.y) * 1.1;
    p.xy += vec2(sin(aSeed.z * 6.2831), cos(aSeed.z * 6.2831)) * arc;
    // Breathing shimmer + gentle depth wave.
    p += vec3(sin(uTime * 0.9 + aSeed.y * 30.0), cos(uTime * 0.8 + aSeed.z * 24.0), sin(uTime * 0.7 + aSeed.x * 18.0)) * 0.018;
    p.z += sin(p.y * 2.4 + uTime * 1.3) * 0.05;
    // The cursor pushes nearby points away; they spring back when it leaves.
    vec2 away = p.xy - uPointer;
    float d = length(away);
    float push = smoothstep(1.25, 0.0, d) * uPush;
    p.xy += normalize(away + 0.0001) * push * 0.55;
    p.z += push * (aSeed.z - 0.3) * 0.9;
    // Click burst: everything exhales outward, then returns.
    p += normalize(position + 0.0001) * uBurst * (0.5 + aSeed.z * 1.4);
    // A band of light sweeps across the mark.
    float sweep = sin(uTime * 0.7) * 2.1;
    vGlow = smoothstep(0.38, 0.0, abs(p.x * 0.8 + p.y * 0.35 - sweep)) + push * 0.6;
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.55 + aSeed.y * 0.75) * (1.0 + vGlow * 0.9) / -mv.z;
  }
`;
const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vGlow;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(vColor + vGlow * 0.55, a * (0.78 + vGlow * 0.5));
  }
`;

/** The Futurvion mark, drawn in points of light: it assembles, parts for your cursor, sweeps with light, and bursts on click. */
function Emblem({ small, compact, contained }: { small: boolean; compact: boolean; contained: boolean }) {
  const root = useRef<THREE.Group>(null);
  const ringA = useRef<THREE.Group>(null);
  const ringB = useRef<THREE.Group>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const markMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const burst = useRef(-10_000);
  const start = useRef<number | null>(null);
  const viewport = useThree(s => s.viewport);
  const dpr = useThree(s => s.gl.getPixelRatio());
  const loadedMarkTexture = useLoader(THREE.TextureLoader, MARK_SRC);
  const markTexture = useMemo(() => {
    const texture = loadedMarkTexture.clone();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, [loadedMarkTexture]);
  const [cloud, setCloud] = useState<Cloud | null>(null);
  const count = contained ? (small ? 5000 : 6500) : small || compact ? 3800 : 8000;

  useEffect(() => () => markTexture.dispose(), [markTexture]);
  useEffect(() => { let alive = true; sampleLogo(count).then(c => { if (alive) setCloud(c); }).catch(() => {}); return () => { alive = false; }; }, [count]);

  const geometry = useMemo(() => {
    if (!cloud) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(cloud.home, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(cloud.color, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(cloud.seed, 3));
    g.setAttribute("aScatter", new THREE.BufferAttribute(cloud.scatter, 3));
    return g;
  }, [cloud]);
  const initial = useMemo(() => ({ uTime: { value: 0 }, uForm: { value: 0 }, uBurst: { value: 0 }, uSize: { value: 30 }, uPointer: { value: new THREE.Vector2(99, 99) }, uPush: { value: 0 }, uSpread: { value: new THREE.Vector2(8, 5) }, uShift: { value: new THREE.Vector2(0, 0) } }), []);
  const narrow = useSyncExternalStore(noop, () => window.innerWidth < 900, () => false);
  // Real mouse only: R3F reports (0,0) before the first move, which would carve a hole in the centre on load.
  const mouse = useRef({ x: 0, y: 0, active: false });
  const hit = useRef<{ x: number; y: number; at: number } | null>(null);
  const gl = useThree(s => s.gl);
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = gl.domElement.getBoundingClientRect();
      mouse.current.x = ((e.clientX - r.left) / r.width) * 2 - 1; mouse.current.y = -(((e.clientY - r.top) / r.height) * 2 - 1); mouse.current.active = true;
    };
    const leave = () => { mouse.current.active = false; };
    const click = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.("a, button, input, select, textarea, summary")) return;
      const r = gl.domElement.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1; const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
      if (Math.abs(nx) > 1 || Math.abs(ny) > 1) return;
      hit.current = { x: nx, y: ny, at: performance.now() };
    };
    window.addEventListener("click", click);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    return () => { window.removeEventListener("click", click); window.removeEventListener("pointermove", move); document.documentElement.removeEventListener("mouseleave", leave); };
  }, [gl]);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const r = root.current; if (!r) return;
    const m = mouse.current;
    // The canvas fills the whole hero; the emblem sits on the right (or near the top on narrow screens).
    const anchorX = contained ? 0 : narrow ? 0 : viewport.width * (compact ? 0.27 : 0.235); const anchorY = contained ? 0 : narrow ? viewport.height * 0.2 : 0;
    const fit = contained ? Math.min(0.94, viewport.height / 5.8, viewport.width / 5.8) : Math.min(1.08, viewport.height / 5.6, (narrow ? viewport.width : viewport.width * 0.5) / 5.8) * (compact ? 0.85 : 1);
    r.scale.setScalar(damp(r.scale.x, fit, 4, delta));
    const s = r.scale.x || 1;
    r.position.x = anchorX; r.position.y = anchorY + Math.sin(t * 0.8) * 0.08;
    const wx = m.active ? (m.x * viewport.width) / 2 : anchorX; const wy = m.active ? (m.y * viewport.height) / 2 : anchorY;
    const px = THREE.MathUtils.clamp((wx - anchorX) / (viewport.width * 0.3), -1.2, 1.2); const py = THREE.MathUtils.clamp((wy - anchorY) / (viewport.height * 0.5), -1.2, 1.2);
    r.rotation.y = damp(r.rotation.y, px * 0.5 + Math.sin(t * 0.45) * 0.22, 2.6, delta);
    r.rotation.x = damp(r.rotation.x, -py * 0.3 + Math.sin(t * 0.35) * 0.06, 2.6, delta);
    const u = material.current?.uniforms;
    if (u) {
      if (start.current === null) start.current = t;
      const age = Math.min((performance.now() - burst.current) / 1500, 1);
      u.uTime.value = t;
      u.uForm.value = Math.min((t - start.current) / 3.2, 1);
      const h = hit.current;
      if (h) { const dx = (h.x * viewport.width) / 2 - anchorX; const dy = (h.y * viewport.height) / 2 - anchorY; if (Math.hypot(dx, dy) < 2.6 * s) burst.current = h.at; hit.current = null; }
      u.uBurst.value = age < 1 ? Math.sin(age * Math.PI) * 0.9 : 0;
      (u.uSpread.value as THREE.Vector2).set((viewport.width * 0.55) / s, (viewport.height * 0.55) / s);
      (u.uShift.value as THREE.Vector2).set(-anchorX / s, -anchorY / s);
      u.uSize.value = (contained ? 20 : small ? 26 : 32) * dpr;
      u.uPush.value = damp(u.uPush.value, m.active && Math.abs(m.x) < 1 && Math.abs(m.y) < 1 ? 1 : 0, 4, delta);
      (u.uPointer.value as THREE.Vector2).set((wx - anchorX) / s, (wy - anchorY) / s);
      if (markMaterial.current) markMaterial.current.opacity = THREE.MathUtils.smoothstep(u.uForm.value, 0.55, 1) * 0.72;
    }
    if (ringA.current) ringA.current.rotation.z += delta * 0.25;
    if (ringB.current) ringB.current.rotation.z -= delta * 0.16;
  });

  const satellite = (angle: number, radius: number, color: string, size: number) => <mesh position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}><sphereGeometry args={[size, 12, 12]} /><meshBasicMaterial color={color} toneMapped={false} /></mesh>;

  return <group ref={root} scale={0.001}>
    {contained && <mesh position={[0, 0, -0.3]}>
      <planeGeometry args={[MARK_WIDTH, cloud?.height ?? MARK_WIDTH * 451 / 512]} />
      <meshBasicMaterial ref={markMaterial} map={markTexture} transparent opacity={0} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
    </mesh>}
    {geometry && <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial ref={material} vertexShader={vertex} fragmentShader={fragment} uniforms={initial} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>}
    <group ref={ringA} rotation={[1.15, 0.2, 0]}>
      <mesh><torusGeometry args={[3.05, 0.006, 6, 200]} /><meshBasicMaterial color={palette.emblem.ringA} transparent opacity={0.3} /></mesh>
      {satellite(0.6, 3.05, palette.emblem.ringA, 0.06)}{satellite(3.7, 3.05, palette.emblem.ringB, 0.04)}
    </group>
    <group ref={ringB} rotation={[-0.55, -0.35, 0.4]}>
      <mesh><torusGeometry args={[3.5, 0.005, 6, 220]} /><meshBasicMaterial color={palette.emblem.ringB} transparent opacity={0.22} /></mesh>
      {satellite(2.2, 3.5, palette.emblem.ringB, 0.055)}{satellite(5.4, 3.5, palette.emblem.ringA, 0.04)}
    </group>
  </group>;
}

function Scene({ compact, contained }: { compact: boolean; contained: boolean }) {
  const small = useSyncExternalStore(noop, isSmall, () => false);
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  // Pause rendering entirely while the emblem is scrolled out of view.
  useEffect(() => {
    const el = wrap.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={wrap} className="hero-canvas" aria-hidden="true">
    <Suspense fallback={<div className="orb-fallback" />}>
      <Canvas frameloop={visible ? "always" : "never"} dpr={[1, small && !contained ? 1.5 : 2]} camera={{ position: [0, 0, 9], fov: 35 }} gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}>
        <Emblem small={small} compact={compact} contained={contained} />
      </Canvas>
    </Suspense>
  </div>;
}

/** Static stand-in: used without WebGL and for reduced motion. */
function EmblemFallback() {
  return <div className="orb-fallback" role="img" aria-label="Futurvion emblem"><Image src={MARK_SRC} alt="" width={512} height={451} /></div>;
}

export function HeroScene({ compact = false, contained = false }: { compact?: boolean; contained?: boolean }) {
  const reduced = useSyncExternalStore(subscribeReduced, () => window.matchMedia(reducedQuery).matches, () => true);
  const webgl = useSyncExternalStore(noop, hasWebGL, () => false);
  const tooSmall = useSyncExternalStore(noop, () => compact && window.innerWidth < 900, () => false);
  if (tooSmall) return null;
  if (!webgl || reduced) return <EmblemFallback />;
  return <Scene compact={compact} contained={contained} />;
}
