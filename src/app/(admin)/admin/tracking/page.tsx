"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Scan, Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { TrackingList, type TrackingShipment } from "@/components/admin/tracking-list";
import { TrackingMap } from "@/components/admin/tracking-map";
import { LiveTrackingPanel } from "@/components/admin/live-tracking-panel";
import { VehicleInfoPanel } from "@/components/admin/vehicle-info-panel";
import { api } from "@/lib/api";

interface DeliveriesPayload {
  items: TrackingShipment[];
  meta: {
    statusCounts: Record<string, number>;
  } | null;
}

function AdminTrackingContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const token = session?.accessToken;
  const [items, setItems] = useState<TrackingShipment[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchDeliveries = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const res = await api<DeliveriesPayload>("/admin/deliveries", { token: session.accessToken });
      if (res.status === 200 && res.data) {
        const list = res.data.items ?? [];
        setItems(list);
        setStatusCounts(res.data.meta?.statusCounts ?? {});
        setSelectedId((prev) => prev ?? list[0]?.id ?? null);
        setExpandedId((prev) => prev ?? list[0]?.id ?? null);
      } else {
        setError(res.errors?.[0] || `API returned status ${res.status}`);
      }
    } catch {
      setError("Network error — is the API server running?");
    }
    setLoading(false);
  }, [session?.accessToken]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
      return;
    }
    if (status === "authenticated") {
      fetchDeliveries();
    }
  }, [status, fetchDeliveries, router]);

  const selected = items.find((d) => d.id === selectedId) ?? null;

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const select = useCallback((id: string) => {
    setSelectedId(id);
    setExpandedId(id);
  }, []);

  return (
    <div className="min-h-full flex flex-col bg-[#F5F4FD]">
      {/* Header */}
      <div className="px-4 sm:px-5 pt-8 sm:pt-10 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-clash-display font-semibold text-[#052D50]">Tracking</h1>
            </div>
            <p className="text-sm text-[#8094A7] font-inter mt-1">
              {items.length} shipment{items.length !== 1 ? "s" : ""} tracked · live updates
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button className="h-9 px-4 bg-[#173420] hover:bg-[#1F4228] text-white rounded-lg text-sm gap-1.5">
              <Plus size={15} weight="bold" /> New Tracking
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-[#FCDEE0] text-[#C0392B] text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
        )}
      </div>

      {/* Two-column layout */}
      <div className="px-4 sm:px-5 pb-8 grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-4 items-start">
        {/* Left: list */}
        <div className="min-w-0">
          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white border border-[#E3E6ED] rounded-lg p-4 animate-pulse">
                  <div className="h-4 w-24 bg-[#E3E6ED] rounded mb-2" />
                  <div className="h-3 w-32 bg-[#E3E6ED] rounded mb-3" />
                  <div className="h-1.5 bg-[#E3E6ED] rounded-full mb-3" />
                  <div className="h-3 w-24 bg-[#E3E6ED] rounded" />
                </div>
              ))}
            </div>
          ) : (
            <TrackingList
              items={items}
              statusCounts={statusCounts}
              selectedId={selectedId}
              onSelect={select}
              expandedId={expandedId}
              onToggleExpand={toggleExpand}
            />
          )}
        </div>

        {/* Right: map + panels */}
        <div className="min-w-0 flex flex-col gap-4">
          {loading ? (
            <div className="bg-white border border-[#E3E6ED] rounded-lg h-[360px] animate-pulse" />
          ) : (
            <div className="bg-white border border-[#E3E6ED] rounded-lg p-3 h-[380px]">
              <TrackingMap
                trackingNumber={selected?.trackingNumber ?? ""}
                status={selected?.status ?? ""}
                pickupAddress={selected?.pickupAddress ?? null}
                dropoffAddress={selected?.dropoffAddress ?? null}
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4">
            <LiveTrackingPanel shipment={selected} />
            <VehicleInfoPanel shipment={selected} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminTrackingPage() {
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center bg-[#F5F4FD]">
        <p className="text-sm text-[#8094A7] font-inter">Loading...</p>
      </div>
    }>
      <AdminTrackingContent />
    </Suspense>
  );
}
