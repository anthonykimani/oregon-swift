import type { Metadata } from "next";
import AboutHero from "@/components/about/about-hero";
import AboutStory from "@/components/about/about-story";
import AboutValues from "@/components/about/about-values";
import AboutStats from "@/components/about/about-stats";
import AboutCertifications from "@/components/about/about-certifications";
import AboutTestimonials from "@/components/about/about-testimonials";
import AboutCTA from "@/components/about/about-cta";

export const metadata: Metadata = {
  title: "About Us — Oregon Swift Deliveries",
  description:
    "Portland-based logistics and last-mile delivery company. Learn about Oregon Swift Deliveries' story, values, certifications, and commitment to the Pacific Northwest.",
};

export default function AboutPage() {
  return (
    <main>
      <AboutHero />
      <AboutStory />
      <AboutValues />
      <AboutStats />
      <AboutCertifications />
      <AboutTestimonials />
      <AboutCTA />
    </main>
  );
}
