import Link from "next/link";
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
      className={cn("inline-flex items-center gap-2.5 rounded-lg", className)}
    >
      <span className={cn(
        "w-8 h-8 shrink-0 rounded-md flex items-center justify-center text-sm font-bold",
        tone === "inverse" ? "bg-sun-500 text-forest" : "bg-forest text-white"
      )}>
        OS
      </span>
      {showWordmark && (
        <span className={cn(
          "font-manrope text-lg font-semibold whitespace-nowrap",
          tone === "inverse" ? "text-white" : "text-forest"
        )}>
          Oregon Swift
        </span>
      )}
    </Link>
  );
}
