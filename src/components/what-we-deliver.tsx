import Link from "next/link";
import { cn } from "@/lib/utils";

const PAPER = "#efe6d2";
const PAPER_LIGHT = "#f8f2e4";
const PAPER_HI = "#fbf7ec";
const PAPER_DARK = "#d8c9ab";
const PAPER_EDGE = "#c3b28f";
const CARGO = "#8a7f6a";
const CARGO_DARK = "#6f6554";
const CREAM = "#f4f1e8";
const SUN = "#f3bc24";
const INK = "#173420";
const SHADOW = "#0d1f13";

function SmallParcel({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 100" fill="none" aria-hidden className={className}>
      <ellipse cx="48" cy="90" rx="32" ry="6" fill={SHADOW} opacity="0.55" />
      <rect x="16" y="40" width="64" height="48" rx="3" fill={PAPER} />
      <rect x="16" y="40" width="64" height="8" rx="3" fill={PAPER_LIGHT} />
      <rect x="42" y="40" width="12" height="48" fill={PAPER_DARK} />
      <rect x="16" y="62" width="64" height="9" fill={PAPER_DARK} />
      <rect x="21" y="47" width="18" height="12" rx="1.5" fill={CREAM} />
      <path
        d="M24 50v6M27 50v6M30 50v6M33.5 50v6M36.5 50v6"
        stroke={INK}
        strokeWidth="1"
      />
      <circle cx="70" cy="53" r="2.6" fill={SUN} />
      <path
        d="M58 84l4-4 4 4M62 80v9"
        stroke={PAPER_EDGE}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BulkyFreight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 190" fill="none" aria-hidden className={className}>
      <ellipse cx="120" cy="176" rx="106" ry="9" fill={SHADOW} opacity="0.55" />
      <rect x="26" y="164" width="20" height="8" rx="1.5" fill={CARGO_DARK} />
      <rect x="78" y="164" width="20" height="8" rx="1.5" fill={CARGO_DARK} />
      <rect x="130" y="164" width="20" height="8" rx="1.5" fill={CARGO_DARK} />
      <rect x="182" y="164" width="20" height="8" rx="1.5" fill={CARGO_DARK} />
      <rect x="16" y="156" width="208" height="8" rx="2" fill={CARGO} />

      <rect x="30" y="74" width="140" height="48" rx="9" fill={PAPER} />
      <rect x="20" y="88" width="24" height="68" rx="8" fill={PAPER_LIGHT} />
      <rect x="156" y="88" width="24" height="68" rx="8" fill={PAPER_LIGHT} />
      <rect x="30" y="112" width="140" height="26" rx="6" fill={PAPER_LIGHT} />
      <rect x="42" y="103" width="56" height="15" rx="6" fill={PAPER_HI} />
      <rect x="102" y="103" width="56" height="15" rx="6" fill={PAPER_HI} />
      <rect x="40" y="138" width="8" height="14" fill={CARGO_DARK} />
      <rect x="152" y="138" width="8" height="14" fill={CARGO_DARK} />
      <rect x="114" y="82" width="20" height="14" rx="2" fill={CREAM} />
      <path d="M117.5 85v8M121 85v8M124.5 85v8M128 85v8" stroke={INK} strokeWidth="1" />

      <rect x="188" y="110" width="38" height="46" rx="3" fill={PAPER} />
      <rect x="188" y="110" width="38" height="7" rx="3" fill={PAPER_LIGHT} />
      <rect x="203" y="110" width="9" height="46" fill={PAPER_DARK} />
      <path
        d="M199 148l7-7 7 7M206 141v14"
        stroke={SUN}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SensitiveCrate({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 170 160" fill="none" aria-hidden className={className}>
      <ellipse cx="85" cy="146" rx="66" ry="8" fill={SHADOW} opacity="0.55" />
      <rect x="22" y="58" width="126" height="84" rx="9" fill={PAPER_LIGHT} />
      <rect x="22" y="58" width="126" height="14" rx="7" fill={PAPER_HI} />
      <rect x="22" y="70" width="126" height="2.5" fill={PAPER_DARK} />
      <path
        d="M68 58v-6a17 9 0 0 1 34 0v6"
        stroke={CARGO}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="79" y="70" width="12" height="9" rx="2" fill={CARGO} />
      <path
        d="M79 98h12v9h9v12h-9v9H79v-9H70v-12h9z"
        fill={SUN}
      />
      <path
        d="M36 74v-6h8M134 74v-6h-8M36 126v6h8M134 126v6h-8"
        stroke={INK}
        strokeOpacity="0.35"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="30" y="118" width="20" height="14" rx="1.5" fill={CREAM} />
      <path
        d="M33 121v8M36 121v8M39 121v8M42.5 121v8M45.5 121v8"
        stroke={INK}
        strokeWidth="1"
      />
    </svg>
  );
}

function PriorityPack({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 190 140" fill="none" aria-hidden className={className}>
      <ellipse cx="92" cy="126" rx="72" ry="7" fill={SHADOW} opacity="0.55" />
      <rect x="34" y="24" width="110" height="16" rx="2" fill={PAPER_HI} />
      <rect x="30" y="34" width="118" height="18" rx="2" fill={PAPER_LIGHT} />
      <path d="M30 40h118" stroke={PAPER_DARK} strokeWidth="2" />
      <rect x="18" y="52" width="136" height="70" rx="5" fill={PAPER} />
      <rect x="18" y="52" width="136" height="8" rx="4" fill={PAPER_LIGHT} />
      <path
        d="M22 57l64 40 64-40"
        stroke={PAPER_EDGE}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="22" y="108" width="128" height="7" rx="3.5" fill={SUN} />
      <rect x="154" y="22" width="3" height="64" rx="1.5" fill={CARGO} />
      <path d="M157 26l26 9-26 9z" fill={SUN} />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d="M2.8 8h9.4m0 0-3.5-3.5M12.2 8l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const capabilities = [
  {
    id: "parcels",
    stage: "Small",
    title: "Parcels and retail",
    description: "Everyday shipments for local businesses.",
    art: <SmallParcel className="w-[60px] sm:w-[90px] lg:w-[92px]" />,
  },
  {
    id: "bulky",
    stage: "Bulky",
    title: "Furniture and appliances",
    description: "Oversized items and large freight.",
    art: <BulkyFreight className="w-[118px] sm:w-[210px] lg:w-[220px]" />,
  },
  {
    id: "sensitive",
    stage: "Sensitive",
    title: "Medical and delicate",
    description: "Supplies that need to travel with care.",
    art: <SensitiveCrate className="w-[90px] sm:w-[150px] lg:w-[150px]" />,
  },
  {
    id: "priority",
    stage: "Time-critical",
    title: "Documents and priority",
    description: "Business papers and urgent items.",
    art: <PriorityPack className="w-[106px] sm:w-[170px] lg:w-[172px]" />,
  },
];

export default function WhatWeDeliver() {
  return (
    <section
      aria-labelledby="shipment-capabilities-heading"
      className="bg-forest px-6 py-16 text-[#f4f1e8] md:py-[100px] lg:py-[120px] xl:px-[135px]"
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[46rem]">
            <p className="flex items-center gap-3 font-manrope text-xs font-semibold uppercase tracking-[0.22em] text-forest-200">
              <span className="h-px w-8 bg-sun-500" aria-hidden />
              Shipment capabilities
            </p>
            <h2
              id="shipment-capabilities-heading"
              className="mt-4 max-w-[22ch] font-clash-display text-[clamp(2rem,4vw,2.9rem)] font-semibold leading-[1.05] tracking-[-0.01em] text-balance"
            >
              From parcels to{" "}
              <span className="whitespace-nowrap">high-priority</span> freight.
            </h2>
            <p className="mt-4 max-w-[46ch] font-manrope text-base leading-relaxed text-forest-100">
              Oregon Swift moves varied shipment sizes and urgency levels across
              the Pacific Northwest.
            </p>
          </div>

          <Link
            href="/get-a-quote"
            className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-sun-500 px-6 font-manrope text-sm font-semibold text-forest transition-colors hover:bg-sun-400 active:bg-sun-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-forest"
          >
            Get a quote
            <span className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:transform-none">
              <ArrowRight />
            </span>
          </Link>
        </div>

        <div className="relative mt-12 lg:mt-16">
          <div
            aria-hidden
            className="absolute inset-x-0 top-[190px] hidden h-px bg-white/15 lg:block"
          />
          <ol className="relative grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-8 lg:grid-cols-[0.95fr_1.35fr_1fr_1.05fr]">
            {capabilities.map((item) => {
              const focal = item.id === "priority";
              return (
                <li key={item.id} className="flex flex-col items-center">
                  <div className="flex h-[112px] items-end justify-center sm:h-[190px]">
                    {item.art}
                  </div>
                  <span aria-hidden className="h-5 w-px bg-white/20" />
                  <div className="flex flex-col items-center text-center">
                    <span
                      className={cn(
                        "font-manrope text-xs font-semibold uppercase tracking-[0.18em]",
                        focal ? "text-sun-300" : "text-forest-200"
                      )}
                    >
                      {item.stage}
                    </span>
                    <h3
                      className={cn(
                        "mt-2 font-clash-display text-lg leading-tight text-[#f4f1e8] lg:text-xl",
                        item.id === "bulky" && "lg:text-[1.35rem]"
                      )}
                    >
                      {item.title}
                    </h3>
                    <p className="mt-1.5 max-w-[24ch] font-manrope text-[15px] leading-relaxed text-forest-100">
                      {item.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
