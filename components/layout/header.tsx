"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { siteStyles } from "@/config/styles";

export function Header() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); menuRef.current?.focus(); }
      if (e.key !== "Tab") return;
      const controls = Array.from(menuRef.current?.closest("header")?.querySelectorAll<HTMLElement>("a, button") ?? []).filter(element => element.getClientRects().length && !element.closest("[inert]"));
      const first = controls[0];
      const last = controls.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    const background = [document.getElementById("main-content"), document.querySelector<HTMLElement>(".footer")].filter((element): element is HTMLElement => Boolean(element));
    const previousInert = background.map(element => element.inert);
    background.forEach(element => { element.inert = true; });
    const onResize = () => { if (window.innerWidth > 850) setOpen(false); };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => { background.forEach((element, index) => { element.inert = previousInert[index]; }); document.body.style.overflow = previous; window.removeEventListener("keydown", onKey); window.removeEventListener("resize", onResize); };
  }, [open]);
  return <header className="site-header">
     <div className={`${siteStyles.container} header-inner`}>
      <Link className="brand" href="/" aria-label="Futurvion home" onClick={() => setOpen(false)}><Image className="brand-full-logo" src="/logo-full.png" alt="Futurvion" width={1600} height={379} sizes="182px" preload /></Link>
      <nav className="desktop-nav" aria-label="Main navigation">{site.navigation.filter(item => item.href !== "/" && item.href !== "/contact").map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} className={pathname === item.href || (!item.href.includes("#") && pathname.startsWith(`${item.href}/`)) ? "active" : ""}>{item.label}</Link>)}</nav>
      <Link className="header-cta" href={site.bookingUrl || "/contact"} target={site.bookingUrl ? "_blank" : undefined} rel={site.bookingUrl ? "noopener noreferrer" : undefined}>{site.bookingUrl ? "Book a consultation" : "Let's talk"} <ArrowUpRight size={16}  aria-hidden="true"/></Link>
      <button ref={menuRef} className="menu-toggle" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X  aria-hidden="true"/> : <Menu  aria-hidden="true"/>}</button>
    </div>
    <nav id="mobile-navigation" aria-label="Mobile navigation" className={`mobile-nav ${open ? "is-open" : ""}`} inert={!open}>{site.navigation.map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} onClick={() => setOpen(false)}>{item.label}<ArrowUpRight size={16}  aria-hidden="true"/></Link>)}{site.bookingUrl && <Link className="mobile-book" href={site.bookingUrl} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>Book a consultation <ArrowUpRight size={16}  aria-hidden="true"/></Link>}</nav>
  </header>;
}
