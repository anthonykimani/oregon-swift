"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MapPin,
  Package,
  Clock,
  CheckCircle,
  Truck,
  MagnifyingGlass,
  WarningCircle,
  ArrowClockwise,
  NavigationArrow,
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/layouts/PublicHeader";
import {
  statusLabels,
  statusPillStyles,
} from "@/components/shared/tracking/types";

interface TrackingEvent {
  id: string;
  status: string;
  note: string;
  createdAt: string;
}

interface TrackingData {
  trackingNumber: string;
  status: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupContactName: string | null;
  pickupContactPhone: string | null;
  dropoffContactName: string | null;
  dropoffContactPhone: string | null;
  packageDesc: string;
  packagePieces: number;
  packageWeight: string;
  createdAt: string;
  courierNearby?: boolean;
  etaMinutes?: number | null;
  etaDistanceMiles?: number | null;
  trackingEvents: TrackingEvent[];
}

const eventIcons: Record<string, React.ReactNode> = {
  pending: <Clock size={16} className="text-[#B8860B]" />,
  processing: <Package size={16} className="text-[#235BC2]" />,
  "picked-up": <Package size={16} className="text-[#235BC2]" />,
  "in-transit": <Truck size={16} className="text-[#333333]" />,
  "out-for-delivery": <Truck size={16} className="text-[#F04A4A]" />,
  delivered: <CheckCircle size={16} className="text-[#007837]" />,
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

function statusPill(status: string) {
  const style = statusPillStyles[status] ?? {
    bg: "bg-[#E3E6ED]",
    text: "text-[#666D80]",
  };
  return `${style.bg} ${style.text}`;
}

function TrackingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  const [trackingNumber, setTrackingNumber] = useState(q || "");
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (q) {
      setTrackingNumber(q);
      fetchTracking(q);
    }
  }, [q]);

  async function fetchTracking(number: string) {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(
        `${API_URL}/tracking/${encodeURIComponent(number)}`
      );
      const json = await res.json();
      if (json.status === 200 && json.data) {
        setData(json.data);
      } else {
        setError(
          json.errors?.[0] ||
            "We couldn't find a delivery with that tracking number."
        );
      }
    } catch {
      setError("We couldn't reach the tracking service. Please try again.");
    }
    setLoading(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (trackingNumber.trim()) {
      router.push(`/tracking?q=${encodeURIComponent(trackingNumber.trim())}`);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F4FD] flex flex-col">
      <PublicHeader />
      <div className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-20">
        <header className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-clash-display font-semibold text-forest mb-2">
            Track your delivery
          </h1>
          <p className="text-sm text-[#666D80]">
            Enter the tracking number from your confirmation to see live status
            and the delivery timeline.
          </p>
        </header>

        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row items-stretch gap-2"
        >
          <div className="relative flex-1">
            <label htmlFor="tracking-number" className="sr-only">
              Tracking number
            </label>
            <MagnifyingGlass
              size={16}
              aria-hidden
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8094A7]"
            />
            <Input
              id="tracking-number"
              name="q"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. OC-A1B2C3D4"
              autoComplete="off"
              aria-describedby="tracking-help"
              className="pl-9 h-11 bg-white border-[#E3E6ED] rounded-lg text-sm"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !trackingNumber.trim()}
            className="h-11 px-5 bg-forest hover:bg-forest-800 rounded-lg text-white text-sm"
          >
            {loading ? "Tracking…" : "Track"}
          </Button>
        </form>

        <p
          id="tracking-help"
          className="text-xs text-[#666D80] mt-3 mb-8 text-center"
        >
          Tracking numbers look like <span className="font-medium">OC-A1B2C3D4</span>.{" "}
          Lost your number?{" "}
          <Link
            href="/customer-care"
            className="text-forest font-medium hover:underline"
          >
            Contact support
          </Link>
          .
        </p>

        <div aria-live="polite" aria-busy={loading}>
          {loading && (
            <div className="space-y-4" aria-hidden>
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-[#E3E6ED] rounded-xl p-5 animate-pulse"
                >
                  <div className="h-4 w-32 bg-[#E3E6ED] rounded mb-3" />
                  <div className="h-3 w-full bg-[#E3E6ED] rounded mb-2" />
                  <div className="h-3 w-2/3 bg-[#E3E6ED] rounded" />
                </div>
              ))}
            </div>
          )}

          {error && !loading && (
            <div
              role="alert"
              className="bg-white border border-[#F5CED2] rounded-xl px-5 py-6 text-center"
            >
              <WarningCircle
                size={28}
                weight="fill"
                className="text-[#C0392B] mx-auto mb-3"
              />
              <p className="text-sm text-[#333]">{error}</p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <Button
                  onClick={() => fetchTracking(trackingNumber.trim())}
                  disabled={!trackingNumber.trim()}
                  variant="outline"
                  className="h-10 px-4 rounded-lg text-sm border-[#E3E6ED] text-forest"
                >
                  <ArrowClockwise size={16} className="mr-2" />
                  Try again
                </Button>
                <Link
                  href="/customer-care"
                  className="text-sm text-forest font-medium hover:underline"
                >
                  Get help
                </Link>
              </div>
            </div>
          )}

          {!data && !loading && !error && (
            <div className="bg-white border border-[#E3E6ED] rounded-xl px-6 py-10 text-center">
              <Package
                size={32}
                className="text-[#A4ACB9] mx-auto mb-3"
                aria-hidden
              />
              <p className="text-sm font-medium text-forest">
                No delivery selected
              </p>
              <p className="text-sm text-[#666D80] mt-1 max-w-sm mx-auto">
                Enter a tracking number above to see the current status, route,
                and timeline for your shipment.
              </p>
            </div>
          )}

          {data && !loading && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E3E6ED] rounded-xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h2 className="text-lg font-semibold text-forest">
                    {data.trackingNumber}
                  </h2>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${statusPill(
                      data.status
                    )}`}
                  >
                    {statusLabels[data.status] || data.status}
                  </span>
                </div>

                {data.etaMinutes != null &&
                  data.status !== "delivered" &&
                  data.status !== "cancelled" && (
                    <div className="flex items-center gap-2 rounded-lg bg-forest-50 border border-forest-200 px-3 py-2 mb-4 text-sm text-forest">
                      <NavigationArrow size={16} weight="fill" aria-hidden />
                      <span>
                        {data.courierNearby
                          ? "Your courier is nearby"
                          : "Estimated arrival"}{" "}
                        — about {data.etaMinutes} min
                        {data.etaDistanceMiles != null
                          ? ` · ${data.etaDistanceMiles.toFixed(1)} mi away`
                          : ""}
                      </span>
                    </div>
                  )}

                <dl className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin
                      size={16}
                      aria-hidden
                      className="text-[#3D724D] mt-0.5 shrink-0"
                    />
                    <div>
                      <dt className="text-xs text-[#666D80]">Pickup</dt>
                      <dd className="text-sm text-[#333]">
                        {data.pickupAddress || "—"}
                      </dd>
                      {data.pickupContactName && (
                        <dd className="text-xs text-[#666D80]">
                          {data.pickupContactName}
                          {data.pickupContactPhone
                            ? ` — ${data.pickupContactPhone}`
                            : ""}
                        </dd>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin
                      size={16}
                      aria-hidden
                      className="text-[#F04A4A] mt-0.5 shrink-0"
                    />
                    <div>
                      <dt className="text-xs text-[#666D80]">Dropoff</dt>
                      <dd className="text-sm text-[#333]">
                        {data.dropoffAddress || "—"}
                      </dd>
                      {data.dropoffContactName && (
                        <dd className="text-xs text-[#666D80]">
                          {data.dropoffContactName}
                          {data.dropoffContactPhone
                            ? ` — ${data.dropoffContactPhone}`
                            : ""}
                        </dd>
                      )}
                    </div>
                  </div>
                </dl>

                <div className="mt-4 pt-4 border-t border-[#E3E6ED]">
                  <dt className="text-xs text-[#666D80]">Package</dt>
                  <dd className="text-sm text-[#333]">
                    {data.packageDesc || "—"}
                  </dd>
                  <dd className="text-xs text-[#666D80]">
                    {data.packagePieces} piece
                    {data.packagePieces > 1 ? "s" : ""}
                    {data.packageWeight
                      ? ` · ${data.packageWeight} lbs`
                      : ""}
                  </dd>
                </div>
              </div>

              {data.trackingEvents.length > 0 && (
                <div className="bg-white border border-[#E3E6ED] rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-forest mb-4">
                    Tracking timeline
                  </h3>
                  <ol className="space-y-0">
                    {data.trackingEvents.map((e, i) => (
                      <li key={e.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span className="flex h-6 w-6 items-center justify-center">
                            {eventIcons[e.status] ?? (
                              <Clock
                                size={16}
                                className="text-[#8094A7]"
                                aria-hidden
                              />
                            )}
                          </span>
                          {i < data.trackingEvents.length - 1 && (
                            <span className="w-px flex-1 bg-[#E3E6ED] min-h-[16px]" />
                          )}
                        </div>
                        <div className="pb-4">
                          <p className="text-sm text-[#333]">
                            {e.note ||
                              statusLabels[e.status] ||
                              e.status}
                          </p>
                          <time
                            dateTime={e.createdAt}
                            className="text-xs text-[#666D80]"
                          >
                            {new Date(e.createdAt).toLocaleString()}
                          </time>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F4FD]">
          <PublicHeader />
          <p className="text-sm text-[#666D80] text-center pt-16">
            Loading tracking…
          </p>
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
