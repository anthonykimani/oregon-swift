const values = [
  {
    title: "Integrity",
    description:
      "We treat every package like it matters, with transparency and accountability at every step of the journey.",
  },
  {
    title: "Reliability",
    description:
      "Structured delivery protocols and real-time tracking keep us on time, even under the tightest deadlines.",
  },
  {
    title: "Precision",
    description:
      "Advanced route optimization ensures your shipment arrives exactly when and where it should.",
  },
];

export default function AboutValues() {
  return (
    <section className="bg-[#fcfcfc] px-6 lg:px-[100px] py-16 md:py-[64px]">
      <div className="max-w-[1240px] mx-auto">
        <div className="text-center mb-12">
          <span className="font-clash-display text-base uppercase text-brand tracking-wide">
            What We Stand For
          </span>
          <h2 className="font-clash-display text-3xl md:text-[40px] leading-tight text-[#161618] mt-3">
            The values behind every delivery
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-2xl bg-[#f7f7f7] p-8 flex flex-col"
            >
              <div className="size-10 rounded-full bg-white flex items-center justify-center mb-6">
                <div className="size-3 rounded-full bg-brand" />
              </div>
              <h3 className="font-clash-display text-xl text-[#161618]">
                {value.title}
              </h3>
              <p className="font-dm-sans text-lg text-[#504c4c] mt-3 leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
