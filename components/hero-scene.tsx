"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import * as THREE from "three";
import { palette, toGlsl } from "@/config/palette";

const damp = THREE.MathUtils.damp;
const reducedQuery = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => { const m = window.matchMedia(reducedQuery); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); };
const noop = () => () => {};
let webglCache: boolean | undefined;
function hasWebGL() { if (webglCache !== undefined) return webglCache; try { const c = document.createElement("canvas"); webglCache = Boolean(c.getContext("webgl2") || c.getContext("webgl")); } catch { webglCache = false; } return webglCache; }
const isSmall = () => window.innerWidth < 700;

const orbVertex = /* glsl */ `
  uniform float uTime;
  uniform float uAmp;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vNoise;
  // Ashima 3D simplex noise
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+10.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
    vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
    i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
    vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
    vec4 m=max(0.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
    return 105.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }
  void main(){
    float n = snoise(normal * 1.35 + vec3(0.0, uTime * 0.22, uTime * 0.1));
    float n2 = snoise(normal * 3.2 - uTime * 0.35);
    float d = n * (0.1 + uAmp * 0.2) + n2 * 0.02 * (1.0 + uAmp * 2.0);
    vec3 p = position + normal * d;
    vNoise = n;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;
const orbFragment = /* glsl */ `
  uniform float uAmp;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vNoise;
  void main(){
    vec3 n = normalize(vNormal); vec3 v = normalize(vView);
    float fres = pow(1.0 - max(dot(n, v), 0.0), 2.4);
    float shade = vNoise * 0.5 + 0.5;
    vec3 deep = ${toGlsl(palette.orb.deep)};
    vec3 mid = ${toGlsl(palette.orb.mid)};
    vec3 hot = ${toGlsl(palette.orb.hot)};
    vec3 col = mix(deep, mid, smoothstep(0.1, 0.75, shade));
    col = mix(col, hot, smoothstep(0.62, 1.0, shade) * 0.55);
    float light = pow(max(dot(n, normalize(vec3(-0.5, 0.65, 0.6))), 0.0), 1.6);
    col += ${toGlsl(palette.orb.light)} * light * 0.5;
    col += mix(${toGlsl(palette.orb.rimA)}, ${toGlsl(palette.orb.rimB)}, vNoise * 0.5 + 0.5) * fres * (0.65 + uAmp * 0.5);
    float spot = pow(max(dot(n, normalize(vec3(-0.3, 0.5, 0.8))), 0.0), 120.0);
    col += ${toGlsl(palette.orb.highlight)} * spot * 0.6;
    gl_FragColor = vec4(col, 1.0);
  }
`;

/** The talking orb: a noise-shaded sphere that breathes, ringed by ticks that move like a voice. */
function Orb({ small, compact }: { small: boolean; compact: boolean }) {
  const root = useRef<THREE.Group>(null);
  const orb = useRef<THREE.Mesh>(null);
  const ticks = useRef<THREE.InstancedMesh>(null);
  const hovered = useRef(false);
  const burst = useRef(-10_000);
  const viewport = useThree(s => s.viewport);
  const count = small || compact ? 84 : 132;
  const material = useRef<THREE.ShaderMaterial>(null);
  const initial = useMemo(() => ({ uTime: { value: 0 }, uAmp: { value: 0 } }), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const amp = useRef(0.4);

  useLayoutEffect(() => {
    const m = ticks.current; if (!m) return;
    const a = new THREE.Color(palette.ticks.from); const b = new THREE.Color(palette.ticks.to); const c = new THREE.Color();
    for (let i = 0; i < count; i++) { const k = Math.abs(Math.sin((i / count) * Math.PI * 3)); m.setColorAt(i, c.copy(a).lerp(b, k)); }
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [count]);

  useFrame(({ clock, pointer }, delta) => {
    const t = clock.elapsedTime;
    const age = Math.min((performance.now() - burst.current) / 1400, 1);
    const kick = age < 1 ? Math.sin(age * Math.PI) : 0;
    // A speech-like envelope: slow phrases with quicker syllables on top.
    const speech = 0.5 + 0.5 * Math.sin(t * 1.3) * Math.sin(t * 0.47 + 1.2);
    const goal = 0.28 + speech * 0.45 + (hovered.current ? 0.25 : 0) + kick * 0.5;
    amp.current = damp(amp.current, goal, 5, delta);
    const u = material.current?.uniforms; if (u) { u.uTime.value = t; u.uAmp.value = amp.current; }

    const m = ticks.current;
    if (m) {
      const inner = 1.78; const step = (Math.PI * 2) / count;
      for (let i = 0; i < count; i++) {
        const a = i * step;
        const voice = Math.abs(Math.sin(i * 0.37 + t * 2.4) * Math.sin(i * 0.113 - t * 1.5)) * 0.65 + Math.abs(Math.sin(i * 1.7 + t * 5)) * 0.35;
        const len = 0.12 + voice * amp.current * 1.05;
        dummy.position.set(Math.cos(a) * (inner + len / 2), Math.sin(a) * (inner + len / 2), 0);
        dummy.rotation.set(0, 0, a - Math.PI / 2);
        dummy.scale.set(1, len, 1);
        dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix);
      }
      m.instanceMatrix.needsUpdate = true;
      m.rotation.z += delta * 0.04;
    }
    if (orb.current) { orb.current.scale.setScalar(1 + amp.current * 0.05); orb.current.rotation.y += delta * 0.12; }
    const r = root.current; if (!r) return;
    r.rotation.y = damp(r.rotation.y, pointer.x * 0.35, 3, delta);
    r.rotation.x = damp(r.rotation.x, -pointer.y * 0.25, 3, delta);
    r.scale.setScalar(damp(r.scale.x, Math.min(1, viewport.width / 5.6, viewport.height / 5.6) * (compact ? 1 : 1.04), 4, delta));
  });

  return <group ref={root} scale={0.001} onPointerOver={() => { hovered.current = true; document.body.style.cursor = "pointer"; }} onPointerOut={() => { hovered.current = false; document.body.style.cursor = ""; }} onClick={() => { burst.current = performance.now(); }}>
    <mesh ref={orb}>
      <icosahedronGeometry args={[1.3, small || compact ? 28 : 48]} />
      <shaderMaterial ref={material} vertexShader={orbVertex} fragmentShader={orbFragment} uniforms={initial} />
    </mesh>
    <instancedMesh ref={ticks} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry args={[0.026, 1, 0.02]} />
      <meshBasicMaterial toneMapped={false} transparent opacity={0.7} />
    </instancedMesh>
    <mesh><torusGeometry args={[2.95, 0.004, 6, 160]} /><meshBasicMaterial color={palette.ticks.ring} transparent opacity={0.16} /></mesh>
    <mesh scale={1.55}><sphereGeometry args={[1.3, 24, 24]} /><meshBasicMaterial color={palette.orb.glow} transparent opacity={0.04} depthWrite={false} side={THREE.BackSide} /></mesh>
  </group>;
}

function Scene({ compact }: { compact: boolean }) {
  const small = useSyncExternalStore(noop, isSmall, () => false);
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  // Pause rendering entirely while the orb is scrolled out of view.
  useEffect(() => {
    const el = wrap.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={wrap} className="hero-canvas" aria-hidden="true">
    <Suspense fallback={<div className="orb-fallback" />}>
      <Canvas frameloop={visible ? "always" : "never"} dpr={[1, small ? 1.5 : 2]} camera={{ position: [0, 0, 9], fov: 35 }} gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}>
        <Orb small={small} compact={compact} />
      </Canvas>
    </Suspense>
  </div>;
}

export function HeroScene({ compact = false }: { compact?: boolean }) {
  const reduced = useSyncExternalStore(subscribeReduced, () => window.matchMedia(reducedQuery).matches, () => true);
  const webgl = useSyncExternalStore(noop, hasWebGL, () => false);
  const tooSmall = useSyncExternalStore(noop, () => compact && window.innerWidth < 760, () => false);
  if (tooSmall) return null;
  if (!webgl || reduced) return <div className="orb-fallback" role="img" aria-label="Abstract glowing orb"><div className="orb-fallback-core" /><div className="orb-ring orb-ring-one" /><div className="orb-ring orb-ring-two" /></div>;
  return <Scene compact={compact} />;
}
