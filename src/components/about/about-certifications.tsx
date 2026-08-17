const certifications = ["OSHA", "HAZMAT", "HIPAA", "TWIC"];

export default function AboutCertifications() {
  return (
    <section className="bg-[#fcfcfc] px-6 lg:px-[100px] py-16 md:py-[64px]">
      <div className="max-w-[1240px] mx-auto text-center">
        <span className="font-clash-display text-base uppercase text-brand tracking-wide">
          Certified & Compliant
        </span>
        <h2 className="font-clash-display text-3xl md:text-[40px] leading-tight text-[#161618] mt-3">
          Trained, certified, and ready for sensitive shipments
        </h2>
        <p className="font-dm-sans text-lg text-[#504c4c] mt-6 max-w-[560px] mx-auto leading-relaxed">
          Our couriers are certified to handle regulated and time-critical
          cargo with the care it demands.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
          {certifications.map((cert) => (
            <span
              key={cert}
              className="inline-flex items-center gap-2 rounded-full bg-[#edf2ea] px-5 py-2.5"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="shrink-0"
              >
                <path
                  d="M3 8.5L6 11.5L13 4.5"
                  stroke="#173420"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-dm-sans text-base text-[#173420]">
                {cert}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
