"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { site } from "@/config/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onResize = () => { if (window.innerWidth > 780) setOpen(false); };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", onKey); window.removeEventListener("resize", onResize); };
  }, [open]);
  return <header className="site-header">
    <div className="container header-inner">
      <Link className="brand" href="/" aria-label="Futurvion home" onClick={() => setOpen(false)}><Image className="brand-mark-img" src="/logo-mark.png" alt="" width={512} height={451} priority /><Image className="brand-word-img" src="/logo-wordmark.png" alt="" width={1200} height={133} priority /></Link>
      <nav className="desktop-nav" aria-label="Main navigation">{site.navigation.map(item => <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : ""}>{item.label}</Link>)}</nav>
      <Link className="header-cta" href={site.bookingUrl || "/contact"} target={site.bookingUrl ? "_blank" : undefined} rel={site.bookingUrl ? "noopener noreferrer" : undefined}>Book a consultation <ArrowUpRight size={15} /></Link>
      <button className="menu-toggle" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </div>
    <nav id="mobile-navigation" aria-label="Mobile navigation" className={`mobile-nav ${open ? "is-open" : ""}`} inert={!open}>{site.navigation.map(item => <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}<ArrowUpRight size={16} /></Link>)}<Link className="mobile-book" href={site.bookingUrl || "/contact"} onClick={() => setOpen(false)}>Book a consultation <ArrowUpRight size={16} /></Link></nav>
  </header>;
}
