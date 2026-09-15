import Link from "next/link";
import CoverageMap from "@/components/coverage-map";

export default function ServiceArea() {
  return (
    <section aria-labelledby="service-area-heading" className="bg-[#f3efe4] px-6 py-20 md:py-28 xl:px-[135px]">
      <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:items-center lg:gap-20">
        <div>
          <p className="font-manrope text-[11px] font-bold uppercase tracking-[0.24em] text-forest-600">Coverage</p>
          <h2 id="service-area-heading" className="mt-5 max-w-[9ch] font-clash-display text-[clamp(2.7rem,5vw,4.8rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-forest">
            Portland is the hub.
          </h2>
          <p className="mt-6 max-w-[34ch] font-manrope text-base leading-7 text-forest-700">
            Local routes across Oregon, with interstate service to Washington, Idaho, California, and Nevada.
          </p>
          <Link href="/customer-care" className="mt-8 inline-flex min-h-12 items-center border-b-2 border-sun-500 pb-1 font-manrope text-sm font-bold text-forest outline-none hover:border-forest focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-4 focus-visible:ring-offset-[#f3efe4]">
            Ask about your route <span aria-hidden="true" className="ml-3">→</span>
          </Link>
        </div>
        <CoverageMap />
      </div>
    </section>
  );
}
