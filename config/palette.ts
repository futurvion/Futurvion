/**
 * ─────────────────────────────────────────────────────────────
 *  FUTURVION COLOUR PALETTE: the single source of truth.
 *  Shared colors for the site. The page styles use the CSS variables
 *  generated below; illustration colors remain for optional visuals.
 *  (Values must be 6-digit hex: #rrggbb.)
 * ─────────────────────────────────────────────────────────────
 */
export const palette = {
  // Restrained blue palette for optional illustrations
  cyan: "#79b4c4",
  blue: "#266887",
  violet: "#263e61",

  // Interactive accents (links, eyebrows, focus, buttons)
  accent: "#175d78",
  accentSoft: "#286f89",
  onAccent: "#ffffff", // text on top of accent-coloured buttons

  // Page surfaces and text
  background: "#f7f8f6",
  surface: "#ffffff", // cards and panels
  surfaceRaised: "#ffffff", // nav pills, popovers
  surfaceDeep: "#132b3b", // footer and dark calls to action
  ink: "#172b38", // main text
  muted: "#536572", // body copy
  dim: "#60717c", // labels and captions
  line: "#596e7a", // hairline borders (drawn very transparent)
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
    ["#1b3a4b", "#285565", "#eff8f8"],
    ["#194451", "#2a6270", "#eff8f8"],
    ["#1b475a", "#2d6a7b", "#eff8f8"],
    ["#203e54", "#355b70", "#eff8f8"],
    ["#20505e", "#367482", "#eff8f8"],
    ["#1b4252", "#32707b", "#eff8f8"],
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
    "--panel:#eef2f2",
    "--card:var(--surface)",
    "--line:rgb(var(--line-base-rgb) / .2)",
    "--line-strong:rgb(var(--accent-rgb) / .45)",
    "--brand-gradient:linear-gradient(100deg,var(--cyan),var(--blue) 55%,var(--violet))",
  );
  return `:root{${vars.join(";")}}`;
}
