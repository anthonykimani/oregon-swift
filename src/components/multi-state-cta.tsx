import Image from "next/image";
import Link from "next/link";

export default function MultiStateCTA() {
  return (
    <section className="bg-white px-6 xl:px-[135px] py-16 md:py-[120px]">
      <div className="w-full max-w-[1170px] mx-auto">
        <div
          className="relative overflow-hidden"
          style={{
            backgroundColor: "#173420",
            borderRadius: "24px",
          }}
        >
          <Image
            src="/images/cta-lines.svg"
            alt=""
            width={1225}
            height={1476}
            className="absolute pointer-events-none hidden md:block"
            style={{ top: "-30px", left: "-80px" }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row">
            <div
              className="flex-1"
              style={{
                padding: "48px 24px",
              }}
            >
              <h2
                className="font-clash-display text-[28px] md:text-[40px] leading-tight text-white max-w-[566px]"
                style={{ fontVariationSettings: '"wght" 600' }}
              >
                Deliveries across Oregon, Washington, Idaho, California & Nevada
              </h2>

              <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-6 md:mt-8">
                <Link
                  href="/get-a-quote"
                  className="inline-flex items-center gap-2 rounded-lg bg-sun-500 hover:bg-sun-400 text-forest font-manrope text-sm font-semibold px-5 h-11 transition-colors"
                >
                  Get a quote
                </Link>
                <Link
                  href="/tracking"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/40 text-white font-manrope text-sm font-medium px-5 h-11 hover:bg-white/10 transition-colors"
                >
                  Track a delivery
                </Link>
              </div>
            </div>

            <div className="relative shrink-0 flex items-end justify-center lg:justify-end lg:-mr-5">
              <Image
                src="/images/cta-image.png"
                alt=""
                width={523}
                height={318}
                className="w-full max-w-[280px] md:max-w-[400px] lg:max-w-[523px] h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
