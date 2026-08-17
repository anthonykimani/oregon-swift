import Hero from "@/components/hero";
import HowItWorks from "@/components/how-it-works";
import WhatWeDeliver from "@/components/what-we-deliver";
import ServiceArea from "@/components/service-area";
import WhyChooseUs from "@/components/why-choose-us";
import Testimonials from "@/components/testimonials";
import MultiStateCTA from "@/components/multi-state-cta";

export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <WhatWeDeliver />
      <ServiceArea />
      <WhyChooseUs />
      <Testimonials />
      <MultiStateCTA />
    </main>
  );
}
