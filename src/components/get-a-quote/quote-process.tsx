const steps = [
  {
    number: "01",
    title: "Booking",
    description:
      "Schedule your shipment online or by phone. We'll confirm pickup details and provide a real-time window.",
  },
  {
    number: "02",
    title: "Packing",
    description:
      "Our team carefully secures and organizes your items in our modern fleet of high-roof cargo vans.",
  },
  {
    number: "03",
    title: "Delivery",
    description:
      "Real-time GPS tracking from dispatch to delivery. You'll know exactly when your shipment arrives.",
  },
];

export default function QuoteProcess() {
  return (
    <section className="bg-[#fcfcfc] px-6 lg:px-[100px] pb-8 md:pb-12">
      <div className="max-w-[1240px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-2xl bg-[#f7f7f7] p-8 relative overflow-hidden"
            >
              <span className="font-clash-display text-6xl text-brand/15 leading-none">
                {step.number}
              </span>
              <h3 className="font-clash-display text-xl text-[#161618] mt-4">
                {step.title}
              </h3>
              <p className="font-dm-sans text-lg text-[#504c4c] mt-3 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/sign-up"
            className="inline-flex justify-center rounded-full bg-brand px-6 py-3 font-inter text-sm text-white hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Get Started
          </a>
          <a
            href="/dashboard/book"
            className="inline-flex justify-center rounded-full border border-[#e5e5e5] px-6 py-3 font-inter text-sm text-brand hover:border-brand transition-colors whitespace-nowrap"
          >
            Book a Delivery
          </a>
        </div>
      </div>
    </section>
  );
}
