export default function BlogHero() {
  return (
    <section className="bg-[#fcfcfc] px-6 lg:px-[100px] py-16 md:py-24">
      <div className="max-w-[1240px] mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2.5 rounded-full bg-white border border-[#e5e5e5] px-4 py-2">
          <span className="size-2 rounded-full bg-brand" />
          <span className="font-dm-sans text-base text-[#161618]">Blog</span>
        </div>

        <h1 className="font-clash-display text-4xl md:text-5xl lg:text-[56px] leading-[1.1] text-brand mt-8">
          Insights &amp; updates
        </h1>

        <p className="font-dm-sans text-lg text-[#504c4c] mt-6 max-w-[540px] leading-relaxed">
          Stay informed with expert tips, industry news, and the latest
          updates. Explore our blog for valuable insights and inspiration.
        </p>
      </div>
    </section>
  );
}
