/**
 * ─────────────────────────────────────────────────────────────
 *  FUTURVION COLOUR PALETTE: the single source of truth.
 *  Change a hex value here and the whole site follows:
 *  page CSS, the particle field, the 3D orb, scroll-story cards.
 *  (Values must be 6-digit hex: #rrggbb.)
 * ─────────────────────────────────────────────────────────────
 */
export const palette = {
  // Brand gradient (taken from the logo): cyan → blue → violet
  cyan: "#19d3ff",
  blue: "#3a6bff",
  violet: "#a64dff",

  // Interactive accents (links, eyebrows, focus, buttons)
  accent: "#2d9cff",
  accentSoft: "#7fd8ff",
  onAccent: "#02061a", // text on top of accent-coloured buttons

  // Page surfaces and text
  background: "#05070f",
  surface: "#090d1e", // cards and panels (drawn semi-transparent)
  surfaceRaised: "#070a18", // nav pills, popovers
  surfaceDeep: "#04060e", // footer, header, overlays
  ink: "#eef2ff", // main text
  muted: "#b4bdd8", // body copy
  dim: "#8f9bc0", // labels and captions
  line: "#8caaff", // hairline borders (drawn very transparent)
  white: "#ffffff",

  // Form feedback
  success: "#78c88c",
  successText: "#bfe8c9",
  danger: "#ff5a46",
  dangerText: "#ffc2b8",

  // The hero emblem (the logo drawn in points of light)
  emblem: {
    lift: "#4f8bff", // dark folds of the logo are lifted toward this so they stay visible
    ringA: "#7fd8ff", // orbit ring + satellites, cool
    ringB: "#9a4dff", // orbit ring + satellites, violet
  },
  // Particle field: points blend cyan → blue → violet
  particles: { a: "#1ad1ff", b: "#3b6bff", c: "#a64dff" },

  // Scroll-story cards, one [from, to, text] per stage
  story: [
    ["#0a1030", "#0f1d5c", "#cfe0ff"],
    ["#0d1a4a", "#15307f", "#d6e6ff"],
    ["#0f2a78", "#1c5bd6", "#e0f0ff"],
    ["#1a3fb0", "#2f86ff", "#effaff"],
    ["#4a2fc8", "#8a4dff", "#f4eeff"],
    ["#19b8ff", "#a64dff", "#031030"],
  ] as readonly (readonly [string, string, string])[],
} as const;

/** "#rrggbb" → "r g b" (for CSS `rgb(var(--x-rgb) / 0.5)`). */
export function hexToRgbTriplet(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}
/** "#rrggbb" → [0..1, 0..1, 0..1] (for GLSL vec3). */
export function hexToVec3(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
const glsl = (hex: string) => hexToVec3(hex).map(v => v.toFixed(4)).join(", ");
/** GLSL `vec3(r, g, b)` literal for a hex colour. */
export const toGlsl = (hex: string) => `vec3(${glsl(hex)})`;

/** Builds the `:root { … }` block that exposes the palette to CSS. Rendered once in the root layout. */
export function paletteCss() {
  const flat: Record<string, string> = {
    cyan: palette.cyan, blue: palette.blue, violet: palette.violet,
    accent: palette.accent, "accent-soft": palette.accentSoft, "on-accent": palette.onAccent,
    bg: palette.background, surface: palette.surface, "surface-raised": palette.surfaceRaised, "surface-deep": palette.surfaceDeep,
    ink: palette.ink, muted: palette.muted, dim: palette.dim, "line-base": palette.line, white: palette.white,
    success: palette.success, "success-text": palette.successText, danger: palette.danger, "danger-text": palette.dangerText,
  };
  const vars = Object.entries(flat).flatMap(([k, v]) => [`--${k}:${v}`, `--${k}-rgb:${hexToRgbTriplet(v)}`]);
  vars.push(
    "--accent-2:var(--accent-soft)",
    "--panel:rgb(255 255 255 / .025)",
    "--card:rgb(var(--surface-rgb) / .7)",
    "--line:rgb(var(--line-base-rgb) / .12)",
    "--line-strong:rgb(var(--accent-rgb) / .4)",
    "--brand-gradient:linear-gradient(100deg,var(--cyan),var(--blue) 55%,var(--violet))",
  );
  return `:root{${vars.join(";")}}`;
}
