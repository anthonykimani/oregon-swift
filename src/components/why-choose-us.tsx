const serviceCards = [
  {
    dotColor: "#2e68fd",
    dotBg: "#ecf0fb",
    title: "Legal Courier Service",
    description:
      "Experienced legal couriers who understand chain of custody and deliver on time, every time.",
  },
  {
    dotColor: "#fc4343",
    dotBg: "#feeded",
    title: "B2B Courier Service",
    description:
      "Reliable delivery for offices, vendors, documents, supplies, and business-critical items.",
  },
  {
    dotColor: "#08a965",
    dotBg: "#e5fcf2",
    title: "Medical Courier Service",
    description:
      "Our medical couriers on staff are OSHA, HAZMAT, HIPAA & TWIC certified",
  },
  {
    dotColor: "#3b7793",
    dotBg: "#e1f1f9",
    title: "Same Day Delivery",
    description:
      "We handle all your same-day delivery needs, ensuring every shipment arrives on time, every time.",
  },
  {
    dotColor: "#d77e1b",
    dotBg: "#faeee2",
    title: "Emergency Delivery",
    description: "Quick Response for Urgent Shipments",
  },
  {
    dotColor: "#932efa",
    dotBg: "#f4edfc",
    title: "Rush Delivery",
    description:
      "Our dedicated team is available around the clock to help you with scheduling, tracking, and support.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-white px-6 xl:px-[135px] py-[120px]">
      <div className="w-full max-w-[1170px] mx-auto">
        <div className="mb-12">
          <span
            className="font-outfit text-base uppercase text-brand"
          >
            WHY CHOOSE US
          </span>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mt-1 gap-8">
            <h2
              className="font-inter text-3xl md:text-4xl lg:text-[40px] max-w-[511px] leading-tight"
              style={{ color: "#01081b" }}
            >
              Speed, precision, and accountability every delivery, every time
            </h2>
            <p
              className="font-manrope text-base max-w-[573px] leading-relaxed"
              style={{ color: "#4d525f" }}
            >
              We leverage advanced route optimization technology, real-time GPS
              tracking, and structured delivery protocols to maintain
              exceptional on-time performance — even under tight deadlines or
              challenging conditions.
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl p-6 md:p-6 md:py-10 md:px-6"
          style={{ backgroundColor: "#f6f6f6" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0">
            {serviceCards.map((card, i) => (
              <div
                key={card.title}
                className="md:px-6 md:py-0 md:pb-6"
                style={
                  i < 3
                    ? { paddingTop: "0", paddingBottom: "24px" }
                    : { paddingTop: "24px" }
                }
              >
                <div className="relative">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: card.dotBg }}
                  >
                    <div
                      className="w-[10px] h-[10px] rounded-full"
                      style={{ backgroundColor: card.dotColor }}
                    />
                  </div>
                  <div className="mt-4">
                    <h3
                      className="font-manrope text-xl"
                      style={{ color: "#01081b" }}
                    >
                      {card.title}
                    </h3>
                    <p
                      className="font-outfit text-base leading-relaxed mt-2 max-w-[300px]"
                      style={{ color: "#4d525f" }}
                    >
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
