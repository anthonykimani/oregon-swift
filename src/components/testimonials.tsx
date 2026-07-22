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

export default function Testimonials() {
  return (
    <section
      className="px-6 xl:px-[135px] py-[120px]"
      style={{ backgroundColor: "#f6f6f6" }}
    >
      <div className="w-full max-w-[1170px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-12 lg:gap-0">
          <div className="w-full lg:w-[549px] shrink-0">
            <span
              className="font-outfit text-base uppercase"
              style={{ color: "#0a47c9" }}
            >
              TESTIMONIALS
            </span>
            <h2
              className="font-inter text-3xl md:text-[40px] leading-tight mt-1 max-w-[549px]"
              style={{ color: "#01081b" }}
            >
              Trusted by businesses across the Pacific Northwest
            </h2>
            <p
              className="font-outfit text-base mt-4 max-w-[461px] leading-relaxed"
              style={{ color: "#4d525f" }}
            >
              We are committed to building lasting partnerships through
              integrity, reliability, and operational excellence.
            </p>

            <div className="flex items-center gap-3 mt-8">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  border: "1px solid #cfd0d1",
                  backgroundColor: "transparent",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="#4d525f"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#0a47c9" }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[549px] shrink-0 space-y-6">
            {reviews.map((review) => (
              <div
                key={review.name}
                className="bg-white rounded-2xl p-6 md:p-8"
                style={{ padding: "32px 24px" }}
              >
                <div className="flex items-center gap-[2px] mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 1.33337L10.06 5.50671L14.6667 6.18004L11.3333 9.42671L12.12 14.0134L8 11.8467L3.88 14.0134L4.66667 9.42671L1.33334 6.18004L5.94 5.50671L8 1.33337Z"
                        fill="#fcbe1d"
                      />
                    </svg>
                  ))}
                </div>
                <p
                  className="font-outfit text-base leading-relaxed mb-6"
                  style={{ color: "#4d525f" }}
                >
                  &ldquo;{review.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-[52px] h-[52px] rounded-full shrink-0"
                    style={{ backgroundColor: "#f7f0fc" }}
                  />
                  <div>
                    <p
                      className="font-urbanist text-lg"
                      style={{ color: "#01081b" }}
                    >
                      {review.name}
                    </p>
                    <p
                      className="font-outfit text-base"
                      style={{ color: "#4d525f" }}
                    >
                      {review.role}
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
