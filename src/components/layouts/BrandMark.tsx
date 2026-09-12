import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  href?: string;
  showWordmark?: boolean;
  className?: string;
}

/**
 * Shared brand lock-up used by application shells, the public header, and
 * auth screens so the wordmark never drifts between surfaces.
 */
export function BrandMark({
  href = "/",
  showWordmark = true,
  className,
}: BrandMarkProps) {
  return (
    <Link
      href={href}
      aria-label="Oregon Swift Deliveries home"
      className={cn("inline-flex items-center gap-2.5 rounded-lg", className)}
    >
      <span className="w-8 h-8 shrink-0 rounded-md bg-forest flex items-center justify-center text-white text-sm font-bold">
        OS
      </span>
      {showWordmark && (
        <span className="font-manrope text-lg text-forest whitespace-nowrap">
          Oregon Swift
        </span>
      )}
    </Link>
  );
}
