import Image from "next/image";

export default function MultiStateCTA() {
  return (
    <section className="bg-white px-6 xl:px-[135px] py-16 md:py-[120px]">
      <div className="w-full max-w-[1170px] mx-auto">
        <div
          className="relative overflow-hidden"
          style={{
            backgroundColor: "#0a47c9",
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
                <a
                  href="#"
                  className="inline-flex items-center gap-2 bg-black text-white"
                  style={{
                    padding: "10px 20px",
                    borderRadius: "5px",
                    border: "1px solid #a6a6a6",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 3L19 12L5 21V3Z" fill="white" />
                  </svg>
                  <div className="flex flex-col">
                    <span className="text-[7px] leading-none text-white/80">
                      Get it on
                    </span>
                    <span className="text-xs leading-none text-white mt-0.5 font-semibold">
                      Google Play
                    </span>
                  </div>
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-white"
                  style={{
                    backgroundColor: "#0c0d10",
                    padding: "10px 18px",
                    borderRadius: "7px",
                    border: "1px solid #a6a6a6",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M17.05 20.28C16.07 21.19 15 21.1 13.96 20.55C12.84 19.96 11.82 19.95 10.7 20.55C9.31 21.33 8.58 21.1 7.74 20.28C3.55 15.99 4.07 9.15 8.83 8.97C9.96 9.02 10.78 9.62 11.64 9.72C12.29 8.64 13.56 8.84 14.53 8.59C15.81 8.26 16.79 8.97 17.47 9.78C16.14 10.5 15.34 11.67 15.5 13.28C15.65 14.84 16.63 15.68 18.18 16.15C18.15 16.49 18.07 16.84 17.99 17.18C17.75 18.11 17.46 19.01 17.05 20.28Z"
                      fill="white"
                    />
                    <path
                      d="M12.03 8.92C11.87 7.38 13.1 6.08 14.65 6.04C14.83 7.8 13.58 9.08 12.03 8.92Z"
                      fill="white"
                    />
                  </svg>
                  <div className="flex flex-col">
                    <span className="text-[7px] leading-none text-white/80">
                      Download on the
                    </span>
                    <span className="text-xs leading-none text-white mt-0.5 font-semibold">
                      App Store
                    </span>
                  </div>
                </a>
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
