import {
  Phone,
  EnvelopeSimple,
  Clock,
  MapPin,
  Buildings,
} from "@phosphor-icons/react/dist/ssr";

const channels = [
  {
    icon: Phone,
    title: "Phone",
    lines: ["+1 (503) 705-0431", "Mon–Fri, 8am–6pm PT"],
  },
  {
    icon: EnvelopeSimple,
    title: "Email",
    lines: [
      "oregonswiftdeliveries@gmail.com",
      "We reply within one business day",
    ],
  },
  {
    icon: Buildings,
    title: "Office",
    lines: ["1107 NW 15th Ave, Suite 334", "Gresham, OR 97030"],
  },
  {
    icon: Clock,
    title: "Hours",
    lines: ["Mon–Fri: 8am–6pm PT", "Sat: 9am–1pm PT · Sun: Closed"],
  },
  {
    icon: MapPin,
    title: "Service Area",
    lines: [
      "Portland metro & Willamette Valley",
      "Interstate: WA, ID, CA, NV",
    ],
  },
];

export default function ContactChannels() {
  return (
    <section className="bg-[#fcfcfc] px-6 lg:px-[100px] pb-8 md:pb-12">
      <div className="max-w-[1240px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {channels.map((channel) => {
          const Icon = channel.icon;
          return (
            <div
              key={channel.title}
              className="rounded-2xl bg-[#f7f7f7] p-8 flex flex-col"
            >
              <div className="size-12 rounded-full bg-white flex items-center justify-center mb-6">
                <Icon size={22} className="text-brand" />
              </div>
              <h3 className="font-clash-display text-xl text-[#161618]">
                {channel.title}
              </h3>
              <div className="mt-3 space-y-1">
                {channel.lines.map((line) => (
                  <p
                    key={line}
                    className="font-dm-sans text-base text-[#504c4c] break-words"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
