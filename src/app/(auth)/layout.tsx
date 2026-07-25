export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[#F5F4FD]">
      <div className="hidden lg:flex w-1/2 bg-[#173420] relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('/grid.svg')] bg-repeat" />
        <div className="relative z-10 text-center px-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[#F3BC24] mb-8">
            <span className="text-[#173420] text-2xl font-bold">OC</span>
          </div>
          <h1 className="text-4xl font-clash-display text-white font-semibold mb-4 leading-tight">
            Oregon Swift<br />Deliveries
          </h1>
          <p className="text-[#A4ACB9] text-lg leading-relaxed max-w-md mx-auto">
            Connecting the PNW with speed, precision & trust.
          </p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
