import type { Metadata } from "next";
import PageHero from "@/components/shared/page-hero";
import LegalProse, { type LegalSection } from "@/components/legal/legal-prose";

export const metadata: Metadata = {
  title: "Privacy Policy — Oregon Swift Deliveries",
  description:
    "How Oregon Swift Deliveries collects, uses, and protects your personal information.",
};

const sections: LegalSection[] = [
  {
    heading: "1. Information We Collect",
    paragraphs: [
      "We collect information you provide when you create an account, book a delivery, or contact us — including your name, contact details, and shipment addresses. We may also collect usage data as you interact with our platform.",
    ],
  },
  {
    heading: "2. How We Use Information",
    paragraphs: [
      "We use your information to provide and improve our delivery services, process bookings, communicate about your shipments, and maintain the security of our platform.",
    ],
  },
  {
    heading: "3. Sharing of Information",
    paragraphs: [
      "We do not sell your personal information. We may share information with couriers, payment providers, and service providers strictly as needed to fulfill your deliveries and operate our business.",
    ],
  },
  {
    heading: "4. Data Security",
    paragraphs: [
      "We use reasonable technical and organizational safeguards to protect your information. No method of transmission over the internet is completely secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    heading: "5. Your Rights",
    paragraphs: [
      "Depending on your location, you may have rights to access, correct, or delete your personal information. Contact us to exercise these rights.",
    ],
  },
  {
    heading: "6. Contact",
    paragraphs: [
      "Questions about this policy can be directed to oregonswiftdeliveries@gmail.com or +1 (503) 705-0431.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main>
      <PageHero
        badge="Legal"
        title="Privacy Policy"
        subtitle="How we collect, use, and protect your information."
      />
      <LegalProse sections={sections} />
    </main>
  );
}
