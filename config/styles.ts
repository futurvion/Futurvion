/**
 * Shared Tailwind utility compositions for the public site primitives.
 *
 * Keep the semantic marker classes alongside these utilities. They are used
 * by the remaining component-specific CSS without owning the primitive's
 * layout or visual treatment.
 */
export const siteStyles = {
  container: "site-container mx-auto w-[min(calc(100%-80px),var(--container))] max-w-none max-[1100px]:w-[min(calc(100%-56px),var(--container))] max-[620px]:w-[min(calc(100%-36px),var(--container))]",
  section: "site-section py-[clamp(84px,9vw,136px)] max-[620px]:py-[75px]",
  pageSection: "site-page-section py-[clamp(76px,8vw,112px)] max-[620px]:py-[66px]",
  eyebrow: "site-eyebrow inline-block text-[var(--accent)] text-[11px] font-bold uppercase tracking-[.17em] leading-[1.4]",
  textLink: "site-text-link mt-[25px] inline-flex items-center gap-[10px] border-b border-current pb-1 text-[var(--accent)] text-[14px] font-bold transition-[gap] duration-[250ms] ease-[var(--ease)] hover:gap-4",
  button: "site-button inline-flex min-h-[52px] items-center justify-center gap-[18px] rounded-none border border-transparent px-[23px] text-[15px] font-semibold whitespace-nowrap transition-[background,color,border-color,transform] duration-[220ms] ease-[var(--ease)] hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-wait disabled:opacity-60",
  buttonPrimary: "site-button-primary bg-[var(--accent)] text-white hover:bg-[#0f4861]",
  buttonGhost: "site-button-ghost border-[var(--line-strong)] bg-transparent text-[var(--ink)] hover:border-[var(--ink)] hover:bg-white",
  buttonLight: "site-button-light bg-white text-[var(--ink)] hover:bg-[#e5eff1]",
  skipLink: "site-skip-link fixed left-4 top-[-90px] z-[100] bg-[var(--accent)] px-[18px] py-3 text-[var(--on-accent)] focus:top-4",
} as const;
