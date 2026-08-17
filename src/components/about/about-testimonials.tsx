const reviews = [
  {
    quote:
      "Oregon Swift has been our go-to delivery partner for over two years. Their on-time performance and communication are exceptional — they treat every package like it matters.",
    name: "Ethan Williams",
    role: "Owner, Hawthorne Retail Collective, Portland",
  },
  {
    quote:
      "We rely on Oregon Swift for all our medical supply deliveries. Their handling protocols and real-time tracking give us complete confidence, even with time-critical shipments.",
    name: "Daniel Thompson",
    role: "Chief of Operations, PNW Medical Supply",
  },
];

export default function AboutTestimonials() {
  return (
    <section className="bg-white px-6 lg:px-[100px] py-16 md:py-[80px]">
      <div className="max-w-[1240px] mx-auto">
        <div className="text-center mb-12">
          <span className="font-clash-display text-base uppercase text-brand tracking-wide">
            Testimonials
          </span>
          <h2 className="font-clash-display text-3xl md:text-[40px] leading-tight text-[#161618] mt-3">
            Trusted by businesses across the Pacific Northwest
          </h2>
          <p className="font-dm-sans text-lg text-[#504c4c] mt-6 max-w-[540px] mx-auto leading-relaxed">
            We are committed to building lasting partnerships through
            integrity, reliability, and operational excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="rounded-2xl bg-[#f7f7f7] p-8 flex flex-col"
            >
              <div className="flex items-center gap-[2px] mb-5">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M8 1.33337L10.06 5.50671L14.6667 6.18004L11.3333 9.42671L12.12 14.0134L8 11.8467L3.88 14.0134L4.66667 9.42671L1.33334 6.18004L5.94 5.50671L8 1.33337Z"
                      fill="#fcbe1d"
                    />
                  </svg>
                ))}
              </div>

              <p className="font-dm-sans text-lg text-[#161618] leading-relaxed">
                &ldquo;{review.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3 mt-6">
                <div className="size-[52px] rounded-full bg-white shrink-0" />
                <div>
                  <p className="font-clash-display text-lg text-[#161618]">
                    {review.name}
                  </p>
                  <p className="font-dm-sans text-base text-[#504c4c]">
                    {review.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
