"use client";

import { CaretDown, Globe, List, X } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { label: "Location", href: "/location" },
  { label: "About", href: "/about" },
  { label: "Customer Care", href: "/customer-care" },
  { label: "Blog", href: "/blog" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHome = usePathname() === "/";
  const ink = isHome ? "text-white/90 drop-shadow-[0_1px_5px_rgba(0,0,0,0.55)] hover:text-white" : "text-foreground hover:text-brand";
  const menuSurface = isHome ? "bg-[#0b2515] border-white/10" : "bg-[#fcfcfc] border-foreground/5";

  return (
    <nav
      className={`z-50 flex min-w-0 items-center justify-between gap-4 overflow-x-clip px-6 py-4 lg:px-10 xl:px-16 ${
        isHome ? "absolute inset-x-0 top-0 bg-transparent" : "relative bg-[#fcfcfc]"
      }`}
      aria-label="Primary navigation"
    >
      <Link href="/" className="flex min-w-0 flex-1 items-center gap-3 transition-opacity hover:opacity-80">
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-md border ${isHome ? "border-white/35 bg-white/10" : "border-transparent bg-forest"}`}>
          <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
            <path d="M3.5 17c3.5 0 4.5-10 8.5-10s4.5 6 8.5 6" stroke="#f4f1e8" strokeWidth="2" strokeLinecap="round" />
            <circle cx="3.5" cy="17" r="1.6" fill="#f4f1e8" />
            <circle cx="20.5" cy="13" r="2.6" fill="#f3bc24" />
          </svg>
        </span>
        <span className={`truncate font-clash-display text-lg font-medium tracking-[-0.02em] xl:text-xl ${isHome ? "text-white" : "text-brand"}`}>
          Oregon Swift Deliveries
        </span>
      </Link>

      <div className="hidden shrink-0 items-center gap-7 xl:flex">
        <Link href="/" className={`font-manrope text-sm font-medium transition-colors ${ink}`}>Home</Link>
        <div className="flex items-center gap-1">
          <Link href="/services" className={`font-manrope text-sm font-medium transition-colors ${ink}`}>Services</Link>
          <CaretDown size={10} className={isHome ? "text-white/70" : "text-foreground"} weight="bold" />
        </div>
        {navLinks.map((item) => (
          <Link key={item.label} href={item.href} className={`whitespace-nowrap font-manrope text-sm font-medium transition-colors ${ink}`}>
            {item.label}
          </Link>
        ))}
        <Link href="/tracking" className={`font-manrope text-sm font-medium transition-colors ${ink}`}>Track</Link>
      </div>

      <div className="hidden shrink-0 items-center gap-3 xl:flex">
        <div className="mr-2 hidden items-center gap-1 2xl:flex">
          <Globe size={14} className={isHome ? "text-white/70" : "text-foreground"} />
          <span className={`font-manrope text-sm ${isHome ? "text-white/80" : "text-foreground"}`}>United States</span>
          <CaretDown size={10} className={isHome ? "text-white/70" : "text-foreground"} weight="bold" />
        </div>
        <Link href="/sign-up" className={`rounded-md px-5 py-2.5 font-manrope text-xs font-bold transition-colors ${isHome ? "bg-sun-500 text-forest hover:bg-sun-400" : "bg-brand text-white hover:bg-forest-800"}`}>
          Get started
        </Link>
        <Link href="/sign-in" className={`rounded-md border px-5 py-2.5 font-manrope text-xs font-bold transition-colors ${isHome ? "border-white/35 text-white hover:bg-white/10" : "border-[#e5e5e5] text-brand hover:border-brand"}`}>
          Sign in
        </Link>
      </div>

      <button
        className={`flex size-11 shrink-0 items-center justify-center rounded-md xl:hidden ${isHome ? "border border-white/30 text-white" : "text-foreground"}`}
        onClick={() => setMobileOpen((open) => !open)}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X size={24} /> : <List size={24} />}
      </button>

      {mobileOpen && (
        <div className={`absolute left-0 top-full flex w-full flex-col gap-4 border-t px-6 py-6 shadow-xl xl:hidden ${menuSurface}`}>
          {[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, ...navLinks, { label: "Track", href: "/tracking" }].map((item) => (
            <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className={`font-manrope text-base font-medium ${ink}`}>
              {item.label}
            </Link>
          ))}
          <div className={`my-1 h-px ${isHome ? "bg-white/15" : "bg-foreground/10"}`} />
          <div className="grid grid-cols-2 gap-3">
            <Link href="/sign-up" onClick={() => setMobileOpen(false)} className="rounded-md bg-sun-500 px-5 py-3 text-center font-manrope text-sm font-bold text-forest">Get started</Link>
            <Link href="/sign-in" onClick={() => setMobileOpen(false)} className={`rounded-md border px-5 py-3 text-center font-manrope text-sm font-bold ${isHome ? "border-white/30 text-white" : "border-forest/20 text-forest"}`}>Sign in</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
