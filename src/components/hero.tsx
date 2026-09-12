import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative isolate flex items-center overflow-hidden bg-forest min-h-[600px] md:min-h-[740px]">
      <Image
        src="/images/hero-bg.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[68%_center] md:object-right"
      />
      {/* Overlay keeps the headline at AA contrast while letting the
          photograph carry the right-hand side of the frame. */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/40 md:via-white/75 md:to-transparent" />

      <div className="relative z-10 w-full px-6 lg:px-10 xl:px-24 py-20 md:py-28">
        <div className="max-w-[640px]">
          <p className="font-manrope text-xs sm:text-sm font-medium uppercase tracking-[0.18em] text-forest-700">
            Portland-based last-mile logistics
          </p>
          <h1 className="font-clash-display text-4xl sm:text-5xl md:text-[64px] leading-[1.04] tracking-tight text-forest mt-4 text-balance">
            Reliable last-mile delivery across the Pacific Northwest
          </h1>
          <p className="font-manrope text-base md:text-lg leading-relaxed mt-6 max-w-[54ch] text-[#1b191a]">
            Time-sensitive courier, freight, and same-day delivery — routed,
            tracked, and dispatched by a team that knows the region.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-8 md:mt-10">
            <Link
              href="/get-a-quote"
              className="inline-flex justify-center items-center rounded-xl bg-sun-500 hover:bg-sun-400 text-forest font-manrope text-sm font-semibold px-6 h-12 transition-colors"
            >
              Get a quote
            </Link>
            <Link
              href="/tracking"
              className="inline-flex justify-center items-center rounded-xl bg-white text-forest font-manrope text-sm font-semibold px-6 h-12 border border-[#e5e5e5] hover:border-forest transition-colors"
            >
              Track a delivery
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
