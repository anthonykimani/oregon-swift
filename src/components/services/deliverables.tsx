const items = [
  "Small parcels and retail goods for e-commerce and local businesses",
  "Bulky items including furniture, appliances, and oversized freight",
  "Sensitive medical supplies and time-critical business materials",
];

export default function Deliverables() {
  return (
    <section className="bg-white px-6 lg:px-[100px] py-16 md:py-[64px]">
      <div className="max-w-[1240px] mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-[75px]">
        <div className="w-full lg:w-1/2">
          <span className="font-clash-display text-base uppercase text-brand tracking-wide">
            What We Deliver
          </span>
          <h2 className="font-clash-display text-3xl md:text-[40px] leading-tight text-[#161618] mt-3">
            From retail goods to furniture — and everything in between
          </h2>
          <p className="font-dm-sans text-lg text-[#504c4c] mt-6 leading-relaxed">
            Our modern fleet handles a wide range of shipments, from small
            parcels to bulky items and sensitive materials.
          </p>
        </div>

        <ul className="w-full lg:w-1/2 space-y-6">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <div className="size-6 rounded-full shrink-0 mt-0.5 flex items-center justify-center bg-[#edf2ea]">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8.5L6 11.5L13 4.5"
                    stroke="#173420"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="font-dm-sans text-lg text-[#161618] leading-snug">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
