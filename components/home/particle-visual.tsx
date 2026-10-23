"use client";

import dynamic from "next/dynamic";

const Field = dynamic(() => import("./particle-field").then(m => m.ParticleField), { ssr: false });
export function ParticleVisual() { return <Field />; }
