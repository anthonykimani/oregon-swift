"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

const slides = [
  { src: "/images/photo_5_2026-09-12_16-58-11.jpg", alt: "An Oregon Swift courier approaching a delivery with a hand truck.", stage: "Pickup", position: "object-[52%_42%] sm:object-[50%_40%] lg:object-[50%_43%]" },
  { src: "/images/photo_3_2026-09-12_16-58-11.jpg", alt: "An Oregon Swift courier unloading a large shipment from a cargo van.", stage: "In transit", position: "object-[51%_46%] sm:object-[50%_44%] lg:object-[50%_47%]" },
  { src: "/images/photo_4_2026-09-12_16-58-11.jpg", alt: "An Oregon Swift courier moving freight inside a cargo van.", stage: "Delivered", position: "object-[52%_38%] sm:object-[50%_38%] lg:object-[50%_40%]" },
] as const;

const AUTOPLAY_DELAY = 6500;
const SWIPE_THRESHOLD = 48;

export default function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const showSlide = (index: number) => setActiveSlide((index + slides.length) % slides.length);
  const showPrevious = () => setActiveSlide((current) => (current - 1 + slides.length) % slides.length);
  const showNext = () => setActiveSlide((current) => (current + 1) % slides.length);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || isPaused) return;
    const interval = window.setInterval(showNext, AUTOPLAY_DELAY);
    return () => window.clearInterval(interval);
  }, [isPaused]);

  return (
    <section
      aria-labelledby="hero-heading"
      aria-roledescription="carousel"
      aria-label="Oregon Swift delivery journey"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false); }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") { event.preventDefault(); showPrevious(); }
        if (event.key === "ArrowRight") { event.preventDefault(); showNext(); }
      }}
      onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; setIsPaused(true); }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) return;
        const distance = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
        if (Math.abs(distance) >= SWIPE_THRESHOLD) {
          if (distance > 0) showPrevious();
          else showNext();
        }
        touchStartX.current = null;
        setIsPaused(false);
      }}
      className="relative isolate min-h-[720px] touch-pan-y overflow-hidden bg-[#0b2515] text-white lg:min-h-[760px]"
    >
      <div className="absolute inset-0" aria-hidden="true">
        {slides.map((slide, index) => (
          <div key={slide.src} className={`absolute inset-0 transition-[opacity,transform] duration-1000 ease-out motion-reduce:transition-none ${index === activeSlide ? "scale-100 opacity-100" : "pointer-events-none scale-[1.025] opacity-0"}`}>
            <Image src={slide.src} alt="" fill priority={index === 0} loading={index === 0 ? "eager" : "lazy"} sizes="100vw" className={`object-cover saturate-[0.82] contrast-[1.06] ${slide.position}`} />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,32,18,0.97)_0%,rgba(8,32,18,0.84)_34%,rgba(8,32,18,0.38)_62%,rgba(8,32,18,0.05)_100%)] max-lg:bg-[linear-gradient(180deg,rgba(8,32,18,0.14)_0%,rgba(8,32,18,0.28)_37%,rgba(8,32,18,0.96)_100%)]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,18,10,0.62)_0%,rgba(4,18,10,0.18)_19%,transparent_38%,transparent_70%,rgba(4,18,10,0.48)_100%)]" aria-hidden="true" />
      <p className="sr-only" aria-live="polite" aria-atomic="true">Slide {activeSlide + 1} of {slides.length}: {slides[activeSlide].alt}</p>

      <div className="relative mx-auto flex min-h-[720px] max-w-[1440px] items-end px-6 pb-36 pt-32 sm:px-10 lg:min-h-[760px] lg:items-center lg:px-[clamp(3rem,8vw,8.5rem)] lg:pb-24 lg:pt-32">
        <div className="max-w-[760px]">
          <p className="font-manrope text-[11px] font-bold uppercase tracking-[0.26em] text-sun-300 sm:text-xs">Portland-based · Pacific Northwest</p>
          <h1 id="hero-heading" className="mt-5 max-w-[9ch] font-clash-display text-[clamp(3.75rem,8.4vw,7.5rem)] font-semibold leading-[0.83] tracking-[-0.055em]">Oregon Swift<span className="block text-sun-400">Deliveries</span></h1>
          <p className="mt-7 max-w-[38ch] font-manrope text-base leading-7 text-white/82 sm:text-lg">Portland-based logistics and last-mile delivery specializing in time-sensitive transportation solutions.</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/get-a-quote" className="inline-flex min-h-12 items-center justify-center rounded-md bg-sun-500 px-7 font-manrope text-sm font-bold text-forest shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-0.5 hover:bg-sun-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-forest motion-reduce:transform-none">Get a quote</Link>
            <Link href="/tracking" className="group inline-flex min-h-12 items-center gap-3 px-2 font-manrope text-sm font-bold text-white underline decoration-white/35 underline-offset-8 transition-colors hover:decoration-sun-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-forest">Track a delivery<span aria-hidden="true" className="text-sun-400 transition-transform group-hover:translate-x-1 motion-reduce:transform-none">→</span></Link>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-6 bottom-5 flex items-end gap-4 sm:inset-x-10 lg:bottom-7 lg:left-auto lg:right-12 lg:w-[42%]">
        <ol className="grid min-w-0 flex-1 grid-cols-3 border-t border-white/25 pt-2">
          {slides.map((slide, index) => (
            <li key={slide.stage} className="relative font-manrope">
              <button type="button" onClick={() => showSlide(index)} aria-label={`Show ${slide.stage.toLowerCase()} photograph`} aria-current={index === activeSlide ? "true" : undefined} className="group flex min-h-14 w-full cursor-pointer flex-col items-start justify-end pt-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b2515]">
                <span className={`absolute -top-[5px] left-0 size-2 rounded-full border transition-[background-color,transform] duration-300 motion-reduce:transition-none ${index === activeSlide ? "scale-125 border-sun-300 bg-sun-500" : "border-white/60 bg-[#153e25] group-hover:bg-white/70"}`} aria-hidden="true" />
                <span className={`block text-[9px] font-bold tracking-[0.2em] transition-colors ${index === activeSlide ? "text-sun-300" : "text-white/55"}`}>0{index + 1}</span>
                <span className={`mt-1 block text-[11px] font-semibold transition-colors sm:text-xs ${index === activeSlide ? "text-white" : "text-white/70 group-hover:text-white"}`}>{slide.stage}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="hidden shrink-0 gap-2 lg:flex">
          <button type="button" onClick={showPrevious} aria-label="Previous delivery photograph" className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/35 bg-[#0b2515]/35 text-white backdrop-blur-sm transition-colors hover:border-white/70 hover:bg-[#0b2515]/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><ArrowLeft aria-hidden="true" size={17} /></button>
          <button type="button" onClick={showNext} aria-label="Next delivery photograph" className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/35 bg-[#0b2515]/35 text-white backdrop-blur-sm transition-colors hover:border-white/70 hover:bg-[#0b2515]/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><ArrowRight aria-hidden="true" size={17} /></button>
        </div>
      </div>
    </section>
  );
}
