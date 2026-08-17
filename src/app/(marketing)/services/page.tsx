import type { Metadata } from "next";
import PageHero from "@/components/shared/page-hero";
import ServiceRows from "@/components/services/service-rows";
import Deliverables from "@/components/services/deliverables";
import FaqAccordion, { type FaqItem } from "@/components/shared/faq-accordion";
import CtaPanel from "@/components/shared/cta-panel";

export const metadata: Metadata = {
  title: "Services — Oregon Swift Deliveries",
  description:
    "Legal, B2B, medical, same-day, emergency, and rush courier services from Oregon Swift Deliveries across the Pacific Northwest.",
};

const faqs: FaqItem[] = [
  {
    question: "What areas do you serve?",
    answer:
      "We cover the Portland metro area and the Willamette Valley, plus interstate delivery to Washington, Idaho, California, and Nevada.",
  },
  {
    question: "Do you offer same-day delivery?",
    answer:
      "Yes. Our same-day and rush services are designed for time-critical shipments, backed by real-time GPS tracking from dispatch to drop-off.",
  },
  {
    question: "Can you handle oversized or regulated shipments?",
    answer:
      "Absolutely. Our fleet and certified couriers handle furniture, appliances, and sensitive medical materials under OSHA, HAZMAT, HIPAA, and TWIC protocols.",
  },
  {
    question: "How do I get a quote?",
    answer:
      "Sign up or book a delivery through the dashboard to get a fast, transparent quote for your shipment.",
  },
];

export default function ServicesPage() {
  return (
    <main>
      <PageHero
        badge="Our Services"
        title="Delivery solutions for every shipment"
        subtitle="From legal documents to oversized freight, Oregon Swift delivers the Pacific Northwest with speed, precision, and care."
      />
      <ServiceRows />
      <Deliverables />

      <section className="bg-white px-6 lg:px-[100px] py-16 md:py-[64px]">
        <div className="max-w-[1240px] mx-auto">
          <div className="text-center mb-12">
            <span className="font-clash-display text-base uppercase text-brand tracking-wide">
              FAQ
            </span>
            <h2 className="font-clash-display text-3xl md:text-[40px] leading-tight text-[#161618] mt-3">
              Frequently asked questions
            </h2>
          </div>
          <FaqAccordion items={faqs} />
        </div>
      </section>

      <CtaPanel
        heading="Ready to ship with Oregon Swift?"
        subtext="Get a fast, transparent quote for your next delivery, or speak with our team about your logistics needs."
        actions={[
          { label: "Get a Quote", href: "/get-a-quote", primary: true },
          { label: "Track a Delivery", href: "/tracking" },
        ]}
      />
    </main>
  );
}
