export default function AboutCTA() {
  return (
    <section className="bg-[#fcfcfc] px-6 lg:px-[100px] py-16 md:py-[64px]">
      <div className="max-w-[1240px] mx-auto">
        <div
          className="relative overflow-hidden rounded-3xl"
          style={{
            backgroundImage: 'url("/images/hero-bg.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-[#173420]/85" />

          <div className="relative z-10 px-8 md:px-14 py-16 md:py-24">
            <h2 className="font-clash-display text-3xl md:text-[40px] leading-tight text-white max-w-[560px]">
              Ready to ship?
            </h2>
            <p className="font-dm-sans text-lg text-white/80 mt-4 max-w-[480px] leading-relaxed">
              Get a fast, transparent quote for your next delivery — or speak
              with our team about your logistics needs.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-8">
              <a
                href="/sign-up"
                className="font-inter text-sm bg-[#F3BC24] text-[#173420] px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                Get a Quote
              </a>
              <a
                href="/tracking"
                className="font-inter text-sm text-white border border-white/40 px-6 py-3 rounded-full hover:bg-white/10 transition-colors"
              >
                Track a Delivery
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
