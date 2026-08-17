import Image from "next/image";

export default function Coverage() {
  return (
    <section className="bg-[#fcfcfc] px-6 lg:px-[100px] pb-8 md:pb-12">
      <div className="max-w-[1240px] mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-[75px]">
        <div className="w-full lg:w-1/2">
          <span className="font-clash-display text-base uppercase text-brand tracking-wide">
            Our Coverage
          </span>
          <h2 className="font-clash-display text-3xl md:text-[40px] leading-tight text-[#161618] mt-3">
            Comprehensive Pacific Northwest coverage
          </h2>
          <ul className="mt-6 space-y-6">
            <li className="flex items-start gap-3">
              <div className="size-6 rounded-full shrink-0 mt-0.5 flex items-center justify-center bg-[#edf2ea]">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8.5L6 11.5L13 4.5"
                    stroke="#173420"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="font-dm-sans text-lg text-[#161618] leading-relaxed">
                We offer comprehensive coverage throughout Oregon, with a
                strong presence in the Portland metro region including
                Gresham, Beaverton, Hillsboro, Vancouver WA, and the
                Willamette Valley.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="size-6 rounded-full shrink-0 mt-0.5 flex items-center justify-center bg-[#edf2ea]">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8.5L6 11.5L13 4.5"
                    stroke="#173420"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="font-dm-sans text-lg text-[#161618] leading-relaxed">
                We also provide reliable interstate transportation to
                Washington, Idaho, California, and Nevada.
              </p>
            </li>
          </ul>
        </div>

        <div className="w-full lg:w-1/2">
          <Image
            src="/images/map-illustration.png"
            alt="Pacific Northwest service area map"
            width={633}
            height={487}
            className="w-full h-auto rounded-3xl"
          />
        </div>
      </div>
    </section>
  );
}
