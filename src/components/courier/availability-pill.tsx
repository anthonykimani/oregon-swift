"use client";

import { useCourierPresence } from "@/lib/courier-presence";
import { cn } from "@/lib/utils";

/**
 * Courier availability control surfaced in the shared header so a driver can
 * go online/offline from anywhere without hunting for the account page.
 */
export function AvailabilityPill() {
  const { availabilityStatus, loading, toggling, setAvailability } =
    useCourierPresence();
  const online = availabilityStatus === "online";

  return (
    <button
      type="button"
      onClick={() => setAvailability(online ? "offline" : "online")}
      disabled={loading || toggling}
      aria-pressed={online}
      aria-label={online ? "Go offline" : "Go online"}
      className={cn(
        "hidden sm:inline-flex items-center gap-2 h-10 px-3 rounded-xl border text-sm font-medium transition-colors disabled:opacity-60",
        online
          ? "border-forest-200 bg-forest-50 text-forest"
          : "border-[#E3E6ED] bg-white text-[#666D80] hover:border-forest"
      )}
    >
      <span
        className={cn(
          "size-2 rounded-full",
          online ? "bg-[#12806B]" : "bg-[#A4ACB9]"
        )}
      />
      {loading || toggling ? "Updating…" : online ? "Online" : "Offline"}
    </button>
  );
}
