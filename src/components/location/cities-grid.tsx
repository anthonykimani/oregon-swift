const regions = [
  {
    state: "Oregon",
    cities: [
      "Portland",
      "Gresham",
      "Beaverton",
      "Hillsboro",
      "Salem",
      "Eugene",
      "Bend",
      "Medford",
      "Willamette Valley",
    ],
  },
  {
    state: "Washington",
    cities: ["Vancouver", "Seattle", "Tacoma", "Spokane"],
  },
  {
    state: "Idaho",
    cities: ["Boise", "Meridian", "Nampa"],
  },
  {
    state: "California",
    cities: ["Eureka", "Los Angeles", "Redding", "Sacramento", "San Diego"],
  },
  {
    state: "Nevada",
    cities: ["Carson City", "Reno", "Sparks"],
  },
];

export default function CitiesGrid() {
  return (
    <section className="bg-[#fcfcfc] px-6 lg:px-[100px] py-16 md:py-[64px]">
      <div className="max-w-[1240px] mx-auto">
        <div className="text-center mb-12">
          <span className="font-clash-display text-base uppercase text-brand tracking-wide">
            Where We Deliver
          </span>
          <h2 className="font-clash-display text-3xl md:text-[40px] leading-tight text-[#161618] mt-3">
            Cities we serve
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {regions.map((region) => (
            <div
              key={region.state}
              className="rounded-2xl bg-[#f7f7f7] p-8"
            >
              <h3 className="font-clash-display text-xl text-[#161618]">
                {region.state}
              </h3>
              <ul className="mt-4 space-y-2">
                {region.cities.map((city) => (
                  <li
                    key={city}
                    className="font-dm-sans text-base text-[#504c4c]"
                  >
                    {city}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
