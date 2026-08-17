"use client";

export default function NewsletterCTA() {
  return (
    <section className="bg-[#fcfcfc] px-6 lg:px-[100px] py-16 md:py-[64px]">
      <div className="max-w-[1240px] mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-brand px-8 md:px-12 py-14 md:py-[48px]">
          <div className="absolute -top-20 -right-10 size-[300px] rounded-full bg-[#F3BC24]/10 pointer-events-none" />
          <div className="absolute -bottom-24 -left-10 size-[400px] rounded-full bg-white/5 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-[640px]">
              <h2 className="font-clash-display text-3xl md:text-[40px] leading-tight text-white">
                Stay Informed, Stay Ahead
              </h2>
              <p className="font-dm-sans text-lg text-white/80 mt-4 leading-relaxed">
                Don&apos;t miss out on the latest insights, updates, and tips!
                Subscribe to our newsletter, share with your network, or
                explore more articles.
              </p>
            </div>

            <form
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto lg:min-w-[380px]"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                required
                placeholder="your@email.com"
                className="flex-1 rounded-full bg-white px-5 py-3 font-dm-sans text-lg text-[#504c4c] outline-none placeholder:text-[#8094A7]"
              />
              <button
                type="submit"
                className="rounded-full bg-[#F3BC24] px-6 py-3 font-inter text-sm font-semibold text-[#173420] hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
