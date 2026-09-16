import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[#F5F4FD]">
      <div className="hidden lg:flex w-1/2 bg-forest relative items-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] bg-[url('/grid.svg')] bg-repeat" />
        <div className="relative z-10 flex flex-col justify-between gap-14 py-16 px-16 w-full max-w-[640px] mx-auto">
          <Link
            href="/"
            aria-label="Oregon Swift Deliveries home"
            className="inline-flex rounded-xl"
          >
            <Image
              src="/images/oregon-swift-deliveries-logo.png"
              alt=""
              width={1254}
              height={1254}
              sizes="144px"
              className="mx-auto block h-auto w-36 rounded-2xl bg-white/[0.96] p-2 shadow-sm"
              priority
            />
          </Link>

          <img
            src="/svg/auth-img.svg"
            alt="Live shipment tracking dashboard"
            className="w-full max-w-[520px] h-auto mx-auto block"
          />

          <div className="text-center">
            <h1 className="text-[40px] leading-tight font-clash-display text-white font-semibold mb-4">
              Welcome to Oregon Swift Deliveries
            </h1>
            <p className="text-[#C9CFD9] text-base leading-relaxed max-w-md mx-auto">
              Track every delivery in real time, run your fleet, and manage your
              warehouse — all in one place.
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center px-6 py-8 sm:py-12 overflow-y-auto">
        <div className="w-full max-w-md flex items-center justify-between mb-8">
          <Link href="/" aria-label="Oregon Swift Deliveries home" className="rounded-xl lg:hidden">
            <Image
              src="/images/oregon-swift-deliveries-logo.png"
              alt=""
              width={1254}
              height={1254}
              sizes="72px"
              className="h-auto w-[72px] object-contain"
              priority
            />
          </Link>
          <Link
            href="/"
            className="ml-auto text-sm text-[#666D80] hover:text-forest transition-colors"
          >
            Back to home
          </Link>
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
