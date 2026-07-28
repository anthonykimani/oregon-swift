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
                {["About", "Contact", "Blog"].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="font-manrope text-sm xl:text-base hover:opacity-70 transition-opacity"
                      style={{ color: "#3a3a3a" }}
                    >
                      {link}
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
                {["Get a Quote", "Schedule a Pickup", "Real-Time Tracking"].map(
                  (link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="font-manrope text-sm xl:text-base hover:opacity-70 transition-opacity"
                        style={{ color: "#3a3a3a" }}
                      >
                        {link}
                      </a>
                    </li>
                  )
                )}
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
                {["Terms & conditions", "Privacy policy"].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="font-manrope text-sm xl:text-base hover:opacity-70 transition-opacity"
                      style={{ color: "#3a3a3a" }}
                    >
                      {link}
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
              Stay updated with Oregon Swift
            </h4>
            <div
              className="flex flex-wrap items-center w-full gap-3"
              style={{
                borderRadius: "24px",
                border: "1px solid rgba(148, 148, 148, 0.5)",
                backgroundColor: "#ffffff",
                padding: "6px 6px 6px 16px",
              }}
            >
              <input
                type="email"
                placeholder="Enter email"
                className="font-manrope text-sm xl:text-base bg-transparent outline-none flex-1 min-w-0"
                style={{ color: "#3a3a3a" }}
              />
              <a
                href="#"
                className="font-manrope text-sm xl:text-lg text-white shrink-0"
                style={{
                  backgroundColor: "#173420",
                  padding: "8px 20px",
                  borderRadius: "24px",
                }}
              >
                Subscribe
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 md:pt-10 pb-5 mt-12 xl:mt-[115px] gap-6">
          <div className="flex items-center gap-6 xl:gap-10">
            {[
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7.8 2H16.2C19.4 2 22 4.6 22 7.8V16.2C22 17.7 21.4 19.1 20.4 20.1C19.4 21.1 18 21.7 16.2 21.7H7.8C4.6 21.7 2 19.1 2 16.2V7.8C2 4.6 4.6 2 7.8 2ZM7.6 4C5.6 4 4 5.6 4 7.6V16.4C4 18.4 5.6 20 7.6 20H16.4C18.4 20 20 18.4 20 16.4V7.6C20 5.6 18.4 4 16.4 4H7.6ZM17.3 6.5C17.9 6.5 18.3 6.9 18.3 7.5C18.3 8.1 17.9 8.5 17.3 8.5C16.7 8.5 16.3 8.1 16.3 7.5C16.3 6.9 16.7 6.5 17.3 6.5ZM12 7C14.8 7 17 9.2 17 12C17 14.8 14.8 17 12 17C9.2 17 7 14.8 7 12C7 9.2 9.2 7 12 7ZM12 9C10.3 9 9 10.3 9 12C9 13.7 10.3 15 12 15C13.7 15 15 13.7 15 12C15 10.3 13.7 9 12 9Z"
                      fill="#173420"
                    />
                  </svg>
                ),
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18.2 4.2L22 8V20C22 21.1 21.1 22 20 22H4C2.9 22 2 21.1 2 20V4C2 2.9 2.9 2 4 2H20C20.8 2 21.4 2.3 21.8 2.7L18.2 4.2ZM8 7V9H14V7H8ZM8 11V13H16V11H8ZM8 15V17H16V15H8Z"
                      fill="#173420"
                    />
                  </svg>
                ),
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12.525 2H11.475C7.4 2 5.4 2 4.2 3.2C3 4.4 3 6.4 3 10.475V11.525C3 15.6 3 17.6 4.2 18.8C5.4 20 7.4 20 11.475 20H12.525C16.6 20 18.6 20 19.8 18.8C21 17.6 21 15.6 21 11.525V10.475C21 6.4 21 4.4 19.8 3.2C18.6 2 16.6 2 12.525 2ZM9 7.5L16 11L9 14.5V7.5Z"
                      fill="#173420"
                    />
                  </svg>
                ),
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12.525 2H11.475C7.4 2 5.4 2 4.2 3.2C3 4.4 3 6.4 3 10.475V11.525C3 15.6 3 17.6 4.2 18.8C5.4 20 7.4 20 11.475 20H12.525C16.6 20 18.6 20 19.8 18.8C21 17.6 21 15.6 21 11.525V10.475C21 6.4 21 4.4 19.8 3.2C18.6 2 16.6 2 12.525 2ZM9 7.5L16 11L9 14.5V7.5Z"
                      fill="#173420"
                    />
                  </svg>
                ),
              },
            ].map((social, i) => (
              <a
                key={i}
                href="#"
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#ffffff" }}
              >
                {social.icon}
              </a>
            ))}
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
