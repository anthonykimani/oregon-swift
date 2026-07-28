import Image from "next/image";

export default function ServiceArea() {
  return (
    <section className="w-full bg-white">
      <div className="max-w-[1170px] mx-auto flex flex-col lg:flex-row px-6 xl:px-[100px]">
        <div className="w-full lg:w-[566px] shrink-0 py-12 lg:py-[71.5px]">
          <div className="max-w-[566px]">
            <h2
              className="font-inter text-3xl md:text-4xl leading-tight"
              style={{ color: "#0a0a0a" }}
            >
              Our Service Area, Comprehensive Pacific Northwest Coverage
            </h2>

            <ul className="mt-6 md:mt-8 space-y-6 md:space-y-[60px]">
              <li className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full shrink-0 mt-0.5 flex items-center justify-center"
                  style={{ backgroundColor: "#f6f7f9" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8.5L6 11.5L13 4.5"
                      stroke="#171717"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p
                  className="font-inter text-[18px] leading-relaxed"
                  style={{ color: "#383838" }}
                >
                  We offer comprehensive coverage throughout Oregon, with a
                  strong presence in the Portland metro region including
                  Gresham, Beaverton, Hillsboro, Vancouver WA, and the
                  Willamette Valley.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full shrink-0 mt-0.5 flex items-center justify-center"
                  style={{ backgroundColor: "#f6f7f9" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8.5L6 11.5L13 4.5"
                      stroke="#171717"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p
                  className="font-inter text-[18px] leading-relaxed"
                  style={{ color: "#383838" }}
                >
                  We also provide reliable interstate transportation to
                  Washington, Idaho, California, and Nevada.
                </p>
              </li>
            </ul>

            <a
              href="/sign-up"
              className="font-manrope text-base text-white inline-block mt-8 md:mt-12 bg-brand"
              style={{
                padding: "14px 32px",
                borderRadius: "100px",
              }}
            >
              Get Started
            </a>
          </div>
        </div>

        <div className="w-full lg:w-[633px] shrink-0 lg:ml-auto pb-8 lg:pb-0">
          <Image
            src="/images/map-illustration.png"
            alt="Service area map"
            width={633}
            height={487}
            className="w-full h-auto"
            style={{ borderRadius: "40px" }}
          />
        </div>
      </div>
    </section>
  );
}
