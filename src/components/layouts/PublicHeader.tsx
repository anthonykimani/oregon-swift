import Link from "next/link";
import { BrandMark } from "./BrandMark";

interface PublicHeaderProps {
  right?: React.ReactNode;
}

/**
 * Slim public header for standalone routes (tracking, legal, etc.) that are
 * outside the marketing layout. Gives every public surface a home affordance.
 */
export function PublicHeader({ right }: PublicHeaderProps) {
  return (
    <header className="border-b border-[#E3E6ED] bg-white">
      <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 h-16">
        <BrandMark />
        <div className="flex items-center gap-4">
          {right}
          <Link
            href="/"
            className="font-manrope text-sm text-[#666D80] hover:text-forest transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </header>
  );
}
