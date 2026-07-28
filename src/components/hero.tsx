export default function Hero() {
  return (
    <section className="relative min-h-[600px] md:min-h-[770px] flex items-center overflow-hidden bg-center md:bg-right"
      style={{
        backgroundImage: 'url("/images/hero-bg.jpg")',
        backgroundSize: "cover",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent md:via-white/60" />
      <div className="relative w-full px-6 lg:px-10 xl:px-24 py-16 md:py-24">
        <div className="max-w-[750px]">
          <h1 className="font-clash-display text-4xl md:text-6xl leading-tight text-brand">
            Reliable Last Mile Delivery
            <br />
            Across the Pacific Northwest
          </h1>
          <p
            className="font-manrope text-base md:text-xl leading-relaxed mt-8 md:mt-7 max-w-[546px]"
            style={{ color: "#1b191a" }}
          >
            Portland-based logistics and last-mile delivery specializing in time-sensitive transportation solutions.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mt-10 md:mt-12">
            <a
              href="/sign-up"
              className="font-inter text-xs bg-brand text-white px-5 py-2.5 rounded-xl shrink-0 text-nowrap hover:opacity-90 transition-opacity"
            >
              Get A Quote
            </a>
            <a
              href="/sign-in"
              className="font-inter text-xs text-brand bg-white border border-[#e5e5e5] px-5 py-2.5 rounded-xl shrink-0 text-nowrap hover:border-brand transition-colors"
            >
              Request Dispatch
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
