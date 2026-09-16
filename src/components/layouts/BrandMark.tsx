import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  href?: string;
  showWordmark?: boolean;
  className?: string;
  tone?: "default" | "inverse";
}

/**
 * Shared brand lock-up used by application shells, the public header, and
 * auth screens so the wordmark never drifts between surfaces.
 */
export function BrandMark({
  href = "/",
  showWordmark = true,
  className,
  tone = "default",
}: BrandMarkProps) {
  return (
    <Link
      href={href}
      aria-label="Oregon Swift Deliveries home"
      className={cn(
        "inline-flex shrink-0 items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500 focus-visible:ring-offset-2",
        tone === "inverse" && "bg-white/[0.96] px-1.5 py-1 shadow-sm ring-1 ring-black/5",
        className
      )}
    >
      <Image
        src="/images/oregon-swift-deliveries-logo.png"
        alt=""
        width={1254}
        height={1254}
        sizes={showWordmark ? "(max-width: 640px) 64px, 76px" : "48px"}
        className={cn(
          "block h-auto object-contain",
          showWordmark ? "w-16 sm:w-[76px]" : "w-12"
        )}
        priority
      />
    </Link>
  );
}
