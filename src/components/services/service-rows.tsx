const services = [
  {
    number: "01",
    dotColor: "#2e68fd",
    dotBg: "#ecf0fb",
    title: "Legal Courier Service",
    description:
      "Experienced legal couriers who understand chain of custody and deliver on time, every time.",
    bullets: [
      "Chain-of-custody tracking",
      "Court and firm filings",
      "Proof of delivery",
    ],
  },
  {
    number: "02",
    dotColor: "#fc4343",
    dotBg: "#feeded",
    title: "B2B Courier Service",
    description:
      "Reliable delivery for offices, vendors, documents, supplies, and business-critical items.",
    bullets: ["Scheduled routes", "Vendor and supply runs", "Account management"],
  },
  {
    number: "03",
    dotColor: "#08a965",
    dotBg: "#e5fcf2",
    title: "Medical Courier Service",
    description:
      "Our medical couriers on staff are OSHA, HAZMAT, HIPAA & TWIC certified.",
    bullets: [
      "Lab specimens and records",
      "Pharmacy delivery",
      "Regulated material handling",
    ],
  },
  {
    number: "04",
    dotColor: "#3b7793",
    dotBg: "#e1f1f9",
    title: "Same Day Delivery",
    description:
      "We handle all your same-day delivery needs, ensuring every shipment arrives on time, every time.",
    bullets: ["Real-time tracking", "On-demand pickup", "Delivery windows"],
  },
  {
    number: "05",
    dotColor: "#d77e1b",
    dotBg: "#faeee2",
    title: "Emergency Delivery",
    description: "Quick response for urgent shipments, whenever you need us.",
    bullets: ["24/7 dispatch", "Priority routing", "Rapid response"],
  },
  {
    number: "06",
    dotColor: "#932efa",
    dotBg: "#f4edfc",
    title: "Rush Delivery",
    description:
      "Our dedicated team is available around the clock to help you with scheduling, tracking, and support.",
    bullets: ["Expedited options", "Around-the-clock support", "Custom scheduling"],
  },
];

export default function ServiceRows() {
  return (
    <section className="bg-[#fcfcfc] px-6 lg:px-[100px] pb-8 md:pb-12">
      <div className="max-w-[1240px] mx-auto space-y-6">
        {services.map((service, i) => (
          <div
            key={service.number}
            className="rounded-3xl bg-[#f7f7f7] p-8 md:p-12 flex flex-col lg:flex-row items-start gap-8 lg:gap-16"
          >
            <div
              className={`flex items-center gap-5 shrink-0 ${
                i % 2 === 1 ? "lg:order-2" : ""
              }`}
            >
              <span className="font-clash-display text-5xl md:text-6xl text-brand/20 leading-none">
                {service.number}
              </span>
              <div
                className="size-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: service.dotBg }}
              >
                <div
                  className="size-3 rounded-full"
                  style={{ backgroundColor: service.dotColor }}
                />
              </div>
            </div>

            <div className={i % 2 === 1 ? "lg:order-1" : ""}>
              <h2 className="font-clash-display text-2xl md:text-3xl text-[#161618]">
                {service.title}
              </h2>
              <p className="font-dm-sans text-lg text-[#504c4c] mt-3 leading-relaxed max-w-[620px]">
                {service.description}
              </p>
              <ul className="mt-5 space-y-2">
                {service.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-start gap-3 font-dm-sans text-base text-[#161618]"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="mt-0.5 shrink-0"
                    >
                      <path
                        d="M3 8.5L6 11.5L13 4.5"
                        stroke="#173420"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
