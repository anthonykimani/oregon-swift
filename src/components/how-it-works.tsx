import Link from "next/link";

const steps = [
  { number: "01", title: "Book the run", detail: "Share the pickup, destination, and timing." },
  { number: "02", title: "We take the wheel", detail: "A local courier collects and moves your shipment." },
  { number: "03", title: "Follow it home", detail: "Track the route and receive delivery confirmation." },
];

function Arrow() {
  return (
    <svg viewBox="0 0 18 18" fill="none" className="size-[18px]" aria-hidden>
      <path d="M3 9h11m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works-heading" className="bg-[#f3efe4] px-6 py-20 md:py-28 xl:px-[135px]">
      <div className="mx-auto grid max-w-[1200px] gap-14 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="font-manrope text-[11px] font-bold uppercase tracking-[0.24em] text-forest-600">The delivery run</p>
          <h2 id="how-it-works-heading" className="mt-5 max-w-[11ch] font-clash-display text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[0.92] tracking-[-0.035em] text-forest">
            Three handoffs. One clear route.
          </h2>
          <p className="mt-6 max-w-[31ch] font-manrope text-base leading-7 text-forest-700">
            From the first address to the final signature, every stage stays visible.
          </p>
          <Link href="/get-a-quote" className="group mt-8 inline-flex min-h-12 items-center gap-3 border-b-2 border-sun-500 pb-1 font-manrope text-sm font-bold text-forest outline-none transition-colors hover:border-forest focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-4 focus-visible:ring-offset-[#f3efe4]">
            Start a delivery <Arrow />
          </Link>
        </div>

        <ol className="relative border-t border-forest/20 lg:border-l lg:border-t-0">
          {steps.map((step, index) => (
            <li key={step.number} className="group relative grid gap-5 border-b border-forest/20 py-8 sm:grid-cols-[5rem_1fr_auto] sm:items-center sm:py-10 lg:pl-12">
              <span aria-hidden className="absolute -left-[5px] top-1/2 hidden size-[9px] -translate-y-1/2 rounded-full border-2 border-[#f3efe4] bg-forest ring-1 ring-forest lg:block" />
              <span className="font-manrope text-xs font-bold tracking-[0.22em] text-forest-600">{step.number}</span>
              <div>
                <h3 className="font-clash-display text-[clamp(1.65rem,3vw,2.35rem)] font-medium leading-none tracking-[-0.02em] text-forest">{step.title}</h3>
                <p className="mt-3 max-w-[38ch] font-manrope text-[15px] leading-6 text-forest-700">{step.detail}</p>
              </div>
              <span aria-hidden className="hidden font-clash-display text-4xl text-sun-500 transition-transform duration-300 group-hover:translate-x-1 sm:block">→</span>
              {index < steps.length - 1 && <span aria-hidden className="absolute bottom-[-5px] left-0 z-10 size-[9px] rounded-full bg-sun-500 lg:hidden" />}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
