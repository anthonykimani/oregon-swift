export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[#F5F4FD]">
      <div className="hidden lg:flex w-1/2 bg-[#173420] relative items-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] bg-[url('/grid.svg')] bg-repeat" />
        <div className="relative z-10 flex flex-col justify-between gap-14 py-16 px-16 w-full max-w-[640px] mx-auto">
          <div>
            {/* Logo */}
            <img
              src="/svg/auth-logo.svg"
              alt="Oregon Swift Deliveries"
              className="h-[88px] w-auto mx-auto block"
            />
          </div>

          {/* Illustration */}
          <img
            src="/svg/auth-img.svg"
            alt="Live shipment tracking dashboard"
            className="w-full max-w-[520px] h-auto mx-auto block"
          />

          {/* Headline */}
          <div className="text-center">
            <h1 className="text-[40px] leading-tight font-clash-display text-white font-semibold mb-4">
              Welcome to Oregon Swift Deliveries
            </h1>
            <p className="text-[#C9CFD9] text-base leading-relaxed max-w-md mx-auto">
              Track every delivery in real time, run your fleet, and manage
              your warehouse — all in one place.
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
