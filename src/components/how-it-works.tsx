import Image from "next/image";

const steps = [
  {
    number: "01",
    icon: "/images/icon-booking.svg",
    title: "Booking",
    description:
      "Schedule your shipment online or by phone. We'll confirm pickup details and provide a real-time window.",
  },
  {
    number: "02",
    icon: "/images/icon-packing.svg",
    title: "Packing",
    description:
      "Our team carefully secures and organizes your items in our modern fleet of high-roof cargo vans.",
  },
  {
    number: "03",
    icon: "/images/icon-delivery.svg",
    title: "Delivery",
    description:
      "Real-time GPS tracking from dispatch to delivery. You'll know exactly when your shipment arrives.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-white px-6 xl:px-[135px] py-[120px]">
      <div className="w-full max-w-[1170px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-12">
          <div>
            <span className="font-outfit text-base uppercase" style={{ color: "#042f89" }}>
              HOW IT WORKS
            </span>
            <h2 className="font-inter text-3xl md:text-4xl mt-1" style={{ color: "#01081b" }}>
              Professional delivery in three easy steps
            </h2>
          </div>
          <a
            href="#"
            className="font-inter text-xs bg-[#0a47c9] text-white px-5 py-2.5 rounded-xl shrink-0 text-nowrap w-fit hover:opacity-90 transition-opacity"
          >
            Get A Quote
          </a>
        </div>

        <div className="rounded-2xl bg-white relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 relative">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className="relative rounded-lg p-[24px]"
                style={{ paddingTop: "48px", paddingBottom: "24px" }}
              >
                <span
                  className="font-urbanist text-8xl font-semibold leading-none absolute"
                  style={{ color: "#f3f3f3", top: "0", left: "14px" }}
                >
                  {step.number}
                </span>
                <div className="w-12 h-12 bg-white flex items-center justify-center relative z-10">
                  <Image src={step.icon} alt="" width={48} height={48} />
                </div>
                <div className="mt-16 max-w-[245px]">
                  <h3 className="font-urbanist text-xl" style={{ color: "#01081b" }}>
                    {step.title}
                  </h3>
                  <p
                    className="font-outfit text-base leading-relaxed mt-2"
                    style={{ color: "#4d525f" }}
                  >
                    {step.description}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className="hidden md:block absolute top-[81.5px] right-0 w-1/2 h-px"
                    style={{ backgroundColor: "#cfd0d1" }}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 w-full rounded-2xl border border-[#cfd0d1] overflow-hidden">
            <Image
              src="/images/video-placeholder.png"
              alt="Video"
              width={1170}
              height={660}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
