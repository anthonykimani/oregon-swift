import type { Metadata } from "next";
import PageHero from "@/components/shared/page-hero";
import QuoteProcess from "@/components/get-a-quote/quote-process";
import FaqAccordion, { type FaqItem } from "@/components/shared/faq-accordion";
import CtaPanel from "@/components/shared/cta-panel";

export const metadata: Metadata = {
  title: "Get a Quote — Oregon Swift Deliveries",
  description:
    "Get a fast, transparent quote for your next delivery with Oregon Swift Deliveries. Simple booking, real-time tracking, and PNW coverage.",
};

const faqs: FaqItem[] = [
  {
    question: "How is my quote calculated?",
    answer:
      "Quotes are based on pickup and dropoff locations, package size and weight, and delivery speed. You'll see a clear, transparent price before you book.",
  },
  {
    question: "Do you offer same-day rates?",
    answer:
      "Yes. Same-day and rush deliveries are priced per shipment, with expedited options available across our service area.",
  },
  {
    question: "Is there a minimum order?",
    answer:
      "There is no minimum order for local deliveries. Interstate and oversized shipments may have a minimum based on distance and handling.",
  },
  {
    question: "How do I book a delivery?",
    answer:
      "Sign up for an account and book through the dashboard, or contact our team by phone or email to schedule.",
  },
];

export default function GetAQuotePage() {
  return (
    <main>
      <PageHero
        badge="Get a Quote"
        title="Fast, transparent delivery pricing"
        subtitle="Tell us where it's going and we'll get you a clear quote — no surprises, no hidden fees."
      />
      <QuoteProcess />

      <section className="bg-white px-6 lg:px-[100px] py-16 md:py-[64px]">
        <div className="max-w-[1240px] mx-auto">
          <div className="text-center mb-12">
            <span className="font-clash-display text-base uppercase text-brand tracking-wide">
              FAQ
            </span>
            <h2 className="font-clash-display text-3xl md:text-[40px] leading-tight text-[#161618] mt-3">
              Pricing questions
            </h2>
          </div>
          <FaqAccordion items={faqs} />
        </div>
      </section>

      <CtaPanel
        heading="Ready to get moving?"
        subtext="Start your booking today and see how easy last-mile delivery can be."
        actions={[
          { label: "Get Started", href: "/sign-up", primary: true },
          { label: "Track a Delivery", href: "/tracking" },
        ]}
      />
    </main>
  );
}
