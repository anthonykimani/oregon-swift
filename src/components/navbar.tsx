"use client";

import { CaretDown, Globe, List, X } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { label: "Location", href: "/location" },
  { label: "About", href: "/about" },
  { label: "Customer Care", href: "/customer-care" },
  { label: "Blog", href: "/blog" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="relative flex items-center justify-between gap-4 px-6 lg:px-10 xl:px-16 py-3 bg-[#fcfcfc] z-50 min-w-0 overflow-x-clip">
      <Link href="/" className="font-aboreto text-sm md:text-lg xl:text-xl text-brand truncate min-w-0 flex-1 hover:opacity-80 transition-opacity">Oregon Swift Deliveries LLC</Link>

      <div className="hidden xl:flex items-center gap-6 xl:gap-8 shrink-0">
        <Link href="/" className="font-dm-sans text-sm xl:text-base text-foreground hover:text-brand transition-colors whitespace-nowrap">
          Home
        </Link>
        <div className="flex items-center gap-1">
          <Link href="/services" className="font-dm-sans text-sm xl:text-base text-foreground hover:text-brand transition-colors whitespace-nowrap">Services</Link>
          <CaretDown size={10} className="text-foreground shrink-0" weight="bold" />
        </div>
        {navLinks.map((item) => (
          <Link key={item.label} href={item.href} className="font-dm-sans text-sm xl:text-base text-foreground hover:text-brand transition-colors whitespace-nowrap">
            {item.label}
          </Link>
        ))}
        <Link href="/tracking" className="font-dm-sans text-sm xl:text-base text-foreground hover:text-brand transition-colors whitespace-nowrap">
          Track
        </Link>
      </div>

      <div className="hidden xl:flex items-center gap-2 xl:gap-3 shrink-0">
        <div className="hidden 2xl:flex items-center gap-1 mr-2 2xl:mr-4">
          <Globe size={14} className="text-foreground shrink-0" />
          <span className="font-dm-sans text-sm text-foreground whitespace-nowrap">United States</span>
          <CaretDown size={10} className="text-foreground shrink-0" weight="bold" />
        </div>
        <Link href="/sign-up" className="font-inter text-xs bg-brand text-white px-4 xl:px-5 py-2.5 rounded-xl whitespace-nowrap hover:opacity-90 transition-opacity">
          Get started
        </Link>
        <Link href="/sign-in" className="font-inter text-xs text-brand border border-[#e5e5e5] px-4 xl:px-5 py-2.5 rounded-xl whitespace-nowrap hover:border-brand transition-colors">
          SIGN iN
        </Link>
      </div>

      <button
        className="flex xl:hidden size-8 shrink-0 items-center justify-center text-foreground"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X size={24} /> : <List size={24} />}
      </button>

      {mobileOpen && (
        <div className="absolute top-full left-0 w-full bg-[#fcfcfc] border-t border-foreground/5 px-6 py-6 flex flex-col gap-4 xl:hidden shadow-lg">
          <Link href="/" className="font-dm-sans text-base text-foreground">
            Home
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/services" className="font-dm-sans text-base text-foreground">Services</Link>
            <CaretDown size={10} className="text-foreground" weight="bold" />
          </div>
          {navLinks.map((item) => (
            <Link key={item.label} href={item.href} className="font-dm-sans text-base text-foreground">
              {item.label}
            </Link>
          ))}
          <Link href="/tracking" className="font-dm-sans text-base text-foreground">
            Track
          </Link>
          <div className="h-px bg-foreground/10 my-2" />
          <div className="flex items-center gap-1">
            <Globe size={14} className="text-foreground" />
            <span className="font-dm-sans text-sm text-foreground">United States</span>
            <CaretDown size={10} className="text-foreground" weight="bold" />
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <Link href="/sign-up" className="font-inter text-xs bg-brand text-white px-5 py-2.5 rounded-xl text-center hover:opacity-90 transition-opacity">
              Get started
            </Link>
            <Link href="/sign-in" className="font-inter text-xs text-brand border border-[#e5e5e5] px-5 py-2.5 rounded-xl text-center hover:border-brand transition-colors">
              SIGN iN
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
