"use client";

import { CaretDown, Globe, List, X } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="relative flex items-center justify-between px-6 lg:px-10 xl:px-24 py-3 bg-[#fcfcfc] z-50">
      <span className="font-aboreto text-sm md:text-lg xl:text-xl text-brand truncate min-w-0 flex-1 lg:flex-none">Oregon Swift Deliveries LLC</span>

      <div className="hidden lg:flex items-center gap-6 xl:gap-8">
        <div className="flex items-center gap-1">
          <a href="#" className="font-dm-sans text-sm xl:text-base text-foreground hover:text-brand transition-colors whitespace-nowrap">Services</a>
          <CaretDown size={10} className="text-foreground shrink-0" weight="bold" />
        </div>
        {["Location", "About", "Customer Care"].map((item) => (
          <a key={item} href="#" className="font-dm-sans text-sm xl:text-base text-foreground hover:text-brand transition-colors whitespace-nowrap">
            {item}
          </a>
        ))}
        <a href="/tracking" className="font-dm-sans text-sm xl:text-base text-foreground hover:text-brand transition-colors whitespace-nowrap">
          Track
        </a>
      </div>

      <div className="hidden lg:flex items-center gap-2 xl:gap-3">
        <div className="hidden xl:flex items-center gap-1 mr-2 xl:mr-4">
          <Globe size={14} className="text-foreground shrink-0" />
          <span className="font-dm-sans text-sm text-foreground whitespace-nowrap">United States</span>
          <CaretDown size={10} className="text-foreground shrink-0" weight="bold" />
        </div>
        <a href="/sign-up" className="font-inter text-xs bg-brand text-white px-4 xl:px-5 py-2.5 rounded-xl whitespace-nowrap hover:opacity-90 transition-opacity">
          Get started
        </a>
        <a href="/sign-in" className="font-inter text-xs text-brand border border-[#e5e5e5] px-4 xl:px-5 py-2.5 rounded-xl whitespace-nowrap hover:border-brand transition-colors">
          SIGN iN
        </a>
      </div>

      <button
        className="flex lg:hidden size-8 items-center justify-center text-foreground"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={24} /> : <List size={24} />}
      </button>

      {mobileOpen && (
        <div className="absolute top-full left-0 w-full bg-[#fcfcfc] border-t border-foreground/5 px-6 py-6 flex flex-col gap-4 lg:hidden shadow-lg">
          <div className="flex items-center gap-1">
            <a href="#" className="font-dm-sans text-base text-foreground">Services</a>
            <CaretDown size={10} className="text-foreground" weight="bold" />
          </div>
          {["Location", "About", "Customer Care"].map((item) => (
            <a key={item} href="#" className="font-dm-sans text-base text-foreground">
              {item}
            </a>
          ))}
          <div className="h-px bg-foreground/10 my-2" />
          <div className="flex items-center gap-1">
            <Globe size={14} className="text-foreground" />
            <span className="font-dm-sans text-sm text-foreground">United States</span>
            <CaretDown size={10} className="text-foreground" weight="bold" />
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <a href="/sign-up" className="font-inter text-xs bg-brand text-white px-5 py-2.5 rounded-xl text-center hover:opacity-90 transition-opacity">
              Get started
            </a>
            <a href="/sign-in" className="font-inter text-xs text-brand border border-[#e5e5e5] px-5 py-2.5 rounded-xl text-center hover:border-brand transition-colors">
              SIGN iN
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
