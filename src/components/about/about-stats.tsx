const stats = [
  { value: "5+", label: "Years of service" },
  { value: "10K+", label: "Deliveries completed" },
  { value: "25+", label: "Cities served" },
  { value: "99%", label: "On-time rate" },
];

export default function AboutStats() {
  return (
    <section className="bg-white px-6 lg:px-[100px] py-16 md:py-[64px]">
      <div className="max-w-[1240px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="font-clash-display text-4xl md:text-5xl text-brand">
              {stat.value}
            </div>
            <div className="font-dm-sans text-base text-[#504c4c] mt-2">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
