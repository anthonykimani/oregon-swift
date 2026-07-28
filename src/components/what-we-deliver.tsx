import Image from "next/image";

export default function WhatWeDeliver() {
  return (
    <section className="w-full bg-white">
      <div className="max-w-[1215px] mx-auto px-6 xl:px-0 py-[58px]">
        <div className="flex flex-col lg:flex-row items-center gap-x-[75px]">
          <div className="w-full lg:w-[529px] shrink-0">
            <Image
              src="/images/van-illustration.svg"
              alt="Delivery van"
              width={530}
              height={270}
              className="w-full h-auto"
            />
          </div>
          <div className="w-full lg:w-[611px] mt-8 lg:mt-0">
            <h2
              className="font-inter text-3xl md:text-4xl leading-tight"
              style={{ color: "#0a0a0a" }}
            >
              We handle a wide range of shipments from Retail Goods to Furniture
            </h2>
            <p
              className="font-inter text-base mt-6 leading-relaxed"
              style={{ color: "#383838" }}
            >
              Our modern fleet handles a wide range of shipments — from small
              parcels and retail goods to bulky items like furniture and
              appliances, plus sensitive medical supplies and time-critical
              business materials.
            </p>
            <ul className="mt-6 space-y-[60px]">
              <li className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full shrink-0 mt-1 flex items-center justify-center"
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
                <span
                  className="font-inter text-[18px] leading-snug"
                  style={{ color: "#383838" }}
                >
                  Small parcels and retail goods for e-commerce and local
                  businesses
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full shrink-0 mt-1 flex items-center justify-center"
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
                <span
                  className="font-inter text-[18px] leading-snug"
                  style={{ color: "#383838" }}
                >
                  Bulky items including furniture, appliances, and oversized
                  freight
                </span>
              </li>
            </ul>
            <a
              href="/sign-up"
              className="font-manrope text-base text-white inline-block mt-12 bg-brand"
              style={{
                padding: "14px 32px",
                borderRadius: "100px",
              }}
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
