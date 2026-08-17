import type { Metadata } from "next";
import PageHero from "@/components/shared/page-hero";
import LegalProse, { type LegalSection } from "@/components/legal/legal-prose";

export const metadata: Metadata = {
  title: "Terms & Conditions — Oregon Swift Deliveries",
  description:
    "Terms and conditions for Oregon Swift Deliveries' courier and last-mile delivery services.",
};

const sections: LegalSection[] = [
  {
    heading: "1. Overview",
    paragraphs: [
      "These Terms & Conditions govern your use of the Oregon Swift Deliveries website and services. By booking a delivery or using our platform, you agree to these terms.",
    ],
  },
  {
    heading: "2. Services",
    paragraphs: [
      "Oregon Swift Deliveries provides last-mile courier and delivery services across the Pacific Northwest and select interstate routes. Service availability, coverage, and delivery windows vary by location and shipment type.",
    ],
  },
  {
    heading: "3. User Responsibilities",
    paragraphs: [
      "You are responsible for providing accurate pickup and dropoff information, properly packaging your items, and ensuring a recipient is available as agreed. Prohibited items may not be shipped through our service.",
    ],
  },
  {
    heading: "4. Pricing & Payment",
    paragraphs: [
      "Quotes are provided before booking based on route, package details, and service level. Payment is due at the time of booking unless otherwise agreed. Prices are subject to change for additional services requested after booking.",
    ],
  },
  {
    heading: "5. Liability",
    paragraphs: [
      "Oregon Swift Deliveries is not liable for indirect or consequential damages. Our liability for loss or damage is limited as described in your shipment agreement and applicable law.",
    ],
  },
  {
    heading: "6. Contact",
    paragraphs: [
      "Questions about these terms can be directed to our customer care team at support@oregonswift.com or (503) 555-0123.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main>
      <PageHero
        badge="Legal"
        title="Terms & Conditions"
        subtitle="The terms that govern your use of Oregon Swift Deliveries."
      />
      <LegalProse sections={sections} />
    </main>
  );
}
