"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Package, Clock, CheckCircle, Truck, MagnifyingGlass } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  trackingEvents: TrackingEvent[];
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  "picked-up": "Picked Up",
  "in-transit": "In Transit",
  "out-for-delivery": "Out for Delivery",
  delivered: "Delivered",
  "failed-attempt": "Failed Attempt",
  cancelled: "Cancelled",
};

const statusColors: Record<string, string> = {
  pending: "bg-[#FFF3D6] text-[#B8860B]",
  "picked-up": "bg-[#E3EDFF] text-[#235BC2]",
  "in-transit": "bg-[#E0E0E0] text-[#333333]",
  "out-for-delivery": "bg-[#FCDEE0] text-[#F04A4A]",
  delivered: "bg-[#D9F9E7] text-[#007837]",
  "failed-attempt": "bg-[#FCDEE0] text-[#C0392B]",
  cancelled: "bg-[#F0F0F0] text-[#999999]",
};

const eventIcons: Record<string, React.ReactNode> = {
  pending: <Clock size={16} className="text-[#B8860B]" />,
  "picked-up": <Package size={16} className="text-[#235BC2]" />,
  "in-transit": <Truck size={16} className="text-[#333333]" />,
  "out-for-delivery": <Truck size={16} className="text-[#F04A4A]" />,
  delivered: <CheckCircle size={16} className="text-[#007837]" />,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

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
      const res = await fetch(`${API_URL}/tracking/${encodeURIComponent(number)}`);
      const json = await res.json();
      if (json.status === 200 && json.data) {
        setData(json.data);
      } else {
        setError(json.errors?.[0] || "Delivery not found");
      }
    } catch {
      setError("Network error — is the API server running?");
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
    <div className="min-h-screen bg-[#F5F4FD]">
      <div className="max-w-xl mx-auto px-4 pt-16 pb-20">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-clash-display font-semibold text-[#173420] mb-2">Track Your Delivery</h1>
          <p className="text-sm text-[#666D80]">Enter your tracking number to see the latest status</p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2 mb-8">
          <div className="relative flex-1">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8094A7]" />
            <Input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. OC-A1B2C3D4"
              className="pl-9 h-11 bg-white border-[#E3E6ED] rounded-lg text-sm"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !trackingNumber.trim()}
            className="h-11 px-5 bg-[#173420] hover:bg-[#1F4228] rounded-lg text-white text-sm"
          >
            {loading ? "..." : "Track"}
          </Button>
        </form>

        {loading && (
          <div className="text-center text-sm text-[#8094A7] py-12">Loading tracking information...</div>
        )}

        {error && (
          <div className="bg-[#FCDEE0] text-[#C0392B] text-sm rounded-xl px-5 py-6 text-center">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E3E6ED] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-[#173420]">{data.trackingNumber}</h2>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[data.status] || "bg-[#E3E6ED] text-[#666]"}`}>
                  {statusLabels[data.status] || data.status}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-[#3D724D] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[#8094A7]">Pickup</p>
                    <p className="text-sm text-[#333]">{data.pickupAddress || "—"}</p>
                    {data.pickupContactName && (
                      <p className="text-xs text-[#8094A7]">{data.pickupContactName}{data.pickupContactPhone ? ` — ${data.pickupContactPhone}` : ""}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-[#F04A4A] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[#8094A7]">Dropoff</p>
                    <p className="text-sm text-[#333]">{data.dropoffAddress || "—"}</p>
                    {data.dropoffContactName && (
                      <p className="text-xs text-[#8094A7]">{data.dropoffContactName}{data.dropoffContactPhone ? ` — ${data.dropoffContactPhone}` : ""}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#E3E6ED]">
                <p className="text-xs text-[#8094A7]">Package</p>
                <p className="text-sm text-[#333]">{data.packageDesc || "—"}</p>
                <p className="text-xs text-[#8094A7]">
                  {data.packagePieces} piece{data.packagePieces > 1 ? "s" : ""}
                  {data.packageWeight ? ` · ${data.packageWeight} lbs` : ""}
                </p>
              </div>
            </div>

            {data.trackingEvents.length > 0 && (
              <div className="bg-white border border-[#E3E6ED] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-[#173420] mb-4">Tracking Timeline</h3>
                <div className="space-y-0">
                  {data.trackingEvents.map((e, i) => (
                    <div key={e.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${i === data.trackingEvents.length - 1 ? "bg-[#173420]" : "bg-[#E3E6ED]"}`} />
                        {i < data.trackingEvents.length - 1 && <div className="w-px flex-1 bg-[#E3E6ED] min-h-[24px]" />}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm text-[#333]">{e.note}</p>
                        <p className="text-xs text-[#8094A7]">{new Date(e.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F4FD] flex items-center justify-center">
        <p className="text-sm text-[#8094A7]">Loading...</p>
      </div>
    }>
      <TrackingContent />
    </Suspense>
  );
}
