import Image from "next/image";

export default function AboutStory() {
  return (
    <section className="bg-[#fcfcfc] px-6 lg:px-[100px] py-16 md:py-[64px]">
      <div className="max-w-[1240px] mx-auto flex flex-col lg:flex-row items-center gap-x-[75px]">
        <div className="w-full lg:w-1/2">
          <span className="font-clash-display text-base uppercase text-brand tracking-wide">
            Our Story
          </span>
          <h2 className="font-clash-display text-3xl md:text-[40px] leading-tight text-[#161618] mt-3">
            Built in Portland, trusted across the Pacific Northwest
          </h2>
          <p className="font-dm-sans text-lg text-[#504c4c] mt-6 leading-relaxed">
            Oregon Swift Deliveries was founded in Portland with a simple goal:
            move the region&apos;s most important shipments with the speed and
            precision they demand. What began as a single-route courier service
            has grown into a full last-mile logistics operation serving
            businesses and residents across Oregon, Washington, Idaho,
            California, and Nevada.
          </p>
          <p className="font-dm-sans text-lg text-[#504c4c] mt-4 leading-relaxed">
            Today our modern fleet of high-roof cargo vans and certified
            couriers handles everything from legal documents and medical
            supplies to retail goods and oversized freight — every delivery
            backed by real-time tracking and a commitment to doing it right.
          </p>
        </div>

        <div className="w-full lg:w-1/2 mt-10 lg:mt-0">
          <div className="rounded-3xl overflow-hidden bg-[#f7f7f7] p-8 md:p-12 flex items-center justify-center">
            <Image
              src="/images/van-illustration.svg"
              alt="Oregon Swift delivery van"
              width={530}
              height={270}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
