import type { Metadata } from "next";
import PageHero from "@/components/shared/page-hero";
import ContactChannels from "@/components/customer-care/contact-channels";
import FaqAccordion, { type FaqItem } from "@/components/shared/faq-accordion";
import CtaPanel from "@/components/shared/cta-panel";

export const metadata: Metadata = {
  title: "Customer Care — Oregon Swift Deliveries",
  description:
    "Get help with your Oregon Swift Deliveries shipment — contact details, hours, and answers to common questions.",
};

const faqs: FaqItem[] = [
  {
    question: "How do I track my delivery?",
    answer:
      "Use the tracking page with the tracking number from your confirmation. You'll see live status, pickup and dropoff details, and the delivery timeline.",
  },
  {
    question: "What should I do if my delivery is late?",
    answer:
      "Contact our team with your tracking number and we'll provide an updated ETA and resolve any issues as quickly as possible.",
  },
  {
    question: "How do I schedule a pickup?",
    answer:
      "Sign in to your account and book a delivery, or reach out by phone or email and we'll get you scheduled.",
  },
  {
    question: "Do you deliver on weekends?",
    answer:
      "Yes, we offer Saturday delivery across most of our service area. Same-day and rush options are available depending on location.",
  },
];

export default function CustomerCarePage() {
  return (
    <main>
      <PageHero
        badge="Customer Care"
        title="We're here to help"
        subtitle="Questions about a shipment, booking, or our services? Our team is ready to help you get answers."
      />
      <ContactChannels />

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
        heading="Need to find a package?"
        subtext="Track your delivery in real time, from dispatch to drop-off."
        actions={[
          { label: "Track a Delivery", href: "/tracking", primary: true },
          { label: "Get a Quote", href: "/get-a-quote" },
        ]}
      />
    </main>
  );
}
