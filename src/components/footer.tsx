export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#f9f9f9" }}>
      <div className="max-w-[1280px] mx-auto px-6 xl:px-[88px] pt-12 xl:pt-[72px]">
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-8">
            <div>
              <h4
                className="font-manrope text-base xl:text-xl mb-6 xl:mb-[43px]"
                style={{ color: "#1a1a1a" }}
              >
                Company
              </h4>
              <ul className="space-y-4 xl:space-y-[34px]">
                {[
                  { label: "About", href: "/about" },
                  { label: "Contact", href: "/customer-care" },
                  { label: "Blog", href: "/blog" },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="font-manrope text-sm xl:text-base hover:opacity-70 transition-opacity"
                      style={{ color: "#3a3a3a" }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4
                className="font-manrope text-base xl:text-xl mb-6 xl:mb-[43px]"
                style={{ color: "#1a1a1a" }}
              >
                Product
              </h4>
              <ul className="space-y-4 xl:space-y-[34px]">
                {[
                  { label: "Get a Quote", href: "/get-a-quote" },
                  { label: "Schedule a Pickup", href: "/dashboard/book" },
                  { label: "Real-Time Tracking", href: "/tracking" },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="font-manrope text-sm xl:text-base hover:opacity-70 transition-opacity"
                      style={{ color: "#3a3a3a" }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4
                className="font-manrope text-base xl:text-xl mb-6 xl:mb-[43px]"
                style={{ color: "#1a1a1a" }}
              >
                Legal
              </h4>
              <ul className="space-y-4 xl:space-y-[34px]">
                {[
                  { label: "Terms & conditions", href: "/terms" },
                  { label: "Privacy policy", href: "/privacy" },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="font-manrope text-sm xl:text-base hover:opacity-70 transition-opacity"
                      style={{ color: "#3a3a3a" }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="w-full lg:w-[498px] shrink-0">
            <h4
              className="font-manrope text-base xl:text-xl mb-6 xl:mb-[43px]"
              style={{ color: "#1a1a1a" }}
            >
              Talk to our team
            </h4>
            <p
              className="font-manrope text-sm xl:text-base leading-relaxed"
              style={{ color: "#3a3a3a" }}
            >
              Questions about a shipment, or need a quote? Our dispatch team is
              here to help.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <a
                href="/customer-care"
                className="font-manrope text-sm xl:text-base text-white"
                style={{
                  backgroundColor: "#173420",
                  padding: "10px 20px",
                  borderRadius: "24px",
                }}
              >
                Contact support
              </a>
              <a
                href="/get-a-quote"
                className="font-manrope text-sm xl:text-base"
                style={{
                  color: "#173420",
                  border: "1px solid rgba(23, 52, 32, 0.35)",
                  padding: "10px 20px",
                  borderRadius: "24px",
                }}
              >
                Get a quote
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 md:pt-10 pb-5 mt-12 xl:mt-[115px] gap-6">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <a
              href="/customer-care"
              className="font-manrope text-sm xl:text-base hover:opacity-70 transition-opacity"
              style={{ color: "#173420" }}
            >
              Customer care
            </a>
            <a
              href="/get-a-quote"
              className="font-manrope text-sm xl:text-base hover:opacity-70 transition-opacity"
              style={{ color: "#173420" }}
            >
              Get a quote
            </a>
          </div>

          <p
            className="font-manrope text-sm mt-4 md:mt-0"
            style={{ color: "#000000" }}
          >
            &copy; 2026 Oregon Swift Deliveries. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
