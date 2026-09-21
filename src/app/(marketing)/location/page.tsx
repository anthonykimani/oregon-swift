import type { Metadata } from "next";
import PageHero from "@/components/shared/page-hero";
import Coverage from "@/components/location/coverage";
import CitiesGrid from "@/components/location/cities-grid";
import CtaPanel from "@/components/shared/cta-panel";

export const metadata: Metadata = {
  title: "Service Areas — Oregon Swift Deliveries",
  description:
    "Oregon Swift Deliveries serves the Portland metro area, the Willamette Valley, and interstate routes across Washington, Idaho, California, and Nevada, including Sparks, Los Angeles, and San Diego.",
};

export default function LocationPage() {
  return (
    <main>
      <PageHero
        badge="Service Areas"
        title="Comprehensive Pacific Northwest coverage"
        subtitle="From the Portland metro area to interstate routes, Oregon Swift reaches the communities that keep the region moving."
      />
      <Coverage />
      <CitiesGrid />
      <CtaPanel
        heading="Is your city on our routes?"
        subtext="Our coverage grows with demand. Get in touch to check availability in your area or request a delivery."
        actions={[
          { label: "Get a Quote", href: "/get-a-quote", primary: true },
          { label: "Track a Delivery", href: "/tracking" },
        ]}
      />
    </main>
  );
}
