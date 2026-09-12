"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Package, MapPin, CalendarBlank, Clock, CheckCircle, ChatsCircle } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import type { Delivery } from "@/types/delivery";
import type { TrackingShipment } from "@/components/shared/tracking/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { TrackingMap } from "@/components/shared/tracking/tracking-map";
import { LiveTrackingPanel } from "@/components/shared/tracking/live-tracking-panel";
import { VehicleInfoPanel } from "@/components/shared/tracking/vehicle-info-panel";

export const statusLabels: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  "picked-up": "Picked Up",
  "in-transit": "In Transit",
  "out-for-delivery": "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  "failed-attempt": "Failed Attempt",
};

export const statusVariants: Record<string, "pending" | "processing" | "in-transit" | "out-for-delivery" | "delivered" | "cancelled"> = {
  pending: "pending",
  processing: "processing",
  "picked-up": "in-transit",
  "in-transit": "in-transit",
  "out-for-delivery": "out-for-delivery",
  delivered: "delivered",
  "failed-attempt": "pending",
  cancelled: "cancelled",
};

function formatLongDate(ts: string) {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "—";
  return (
    d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) +
    " – " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  );
}

function deliveryToShipment(delivery: Delivery): TrackingShipment {
  const events = (delivery.trackingEvents || []).map((e) => ({
    id: e.id,
    status: e.status,
    note: e.note,
    locationText: e.locationText,
    createdAt: e.createdAt,
  }));
  return {
    id: delivery.id,
    trackingNumber: delivery.trackingNumber,
    status: delivery.status,
    customerId: delivery.customerId,
    customerName: delivery.customerName ?? null,
    courierId: delivery.courierId,
    courierName: delivery.courierName ?? null,
    courierPhone: delivery.courierPhone ?? null,
    courierVehicle: delivery.courierVehicle ?? null,
    courierLocation: delivery.courierLocation ?? null,
    pickupAddress: delivery.pickupAddress,
    dropoffAddress: delivery.dropoffAddress,
    packageDesc: delivery.packageDesc,
    packagePieces: delivery.packagePieces,
    packageWeight: delivery.packageWeight,
    packageSizeClass: delivery.packageSizeClass,
    priority: delivery.priority,
    priceCents: delivery.priceCents,
    pickupWindowStart: delivery.pickupWindowStart,
    pickupWindowEnd: delivery.pickupWindowEnd,
    scheduledDate: delivery.scheduledDate,
    dropoffWindowEnd: delivery.dropoffWindowEnd,
    createdAt: delivery.createdAt,
    latestEvent: delivery.latestEvent
      ? {
          id: delivery.latestEvent.id,
          status: delivery.latestEvent.status,
          note: delivery.latestEvent.note,
          locationText: delivery.latestEvent.locationText,
          createdAt: delivery.latestEvent.createdAt,
        }
      : events[events.length - 1] ?? null,
  };
}

export function DeliveryDetailContent({ id, token }: { id: string; token: string }) {
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [messaging, setMessaging] = useState(false);
  const router = useRouter();

  if (id !== loadedId) {
    setLoadedId(id);
    setDelivery(null);
  }

  useEffect(() => {
    let cancelled = false;
    api<Delivery>(`/deliveries/${id}`, { token })
      .then((res) => {
        if (cancelled) return;
        if (res.status === 200 && res.data) setDelivery(res.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id, token]);

  const loading = !delivery && id === loadedId;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-40 bg-[#E3E6ED] rounded animate-pulse" />
        <div className="h-[320px] bg-[#E3E6ED] rounded-xl animate-pulse" />
        <div className="h-48 bg-[#E3E6ED] rounded-xl animate-pulse" />
        <div className="h-40 bg-[#E3E6ED] rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <Package size={40} className="text-[#E3E6ED]" />
        <p className="text-sm text-[#8094A7] font-inter">Delivery not found</p>
      </div>
    );
  }

  const shipment = deliveryToShipment(delivery);
  const events = delivery.trackingEvents || [];
  const bookedDate = new Date(delivery.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const currentDelivery = delivery;

  async function messageAboutDelivery() {
    if (messaging || !token) return;
    setMessaging(true);
    try {
      const res = await api<{ conversation: { id: string } }>("/messages/threads", {
        method: "POST",
        token,
        body: JSON.stringify({ deliveryId: currentDelivery.id }),
      });
      if ((res.status === 200 || res.status === 201) && res.data?.conversation?.id) {
        router.push(`/dashboard/messages?thread=${encodeURIComponent(res.data.conversation.id)}`);
      }
    } finally {
      setMessaging(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pr-8">
        <div className="min-w-0">
          <h2 className="text-2xl font-clash-display font-semibold text-[#173420]">
            {delivery.trackingNumber}
          </h2>
          <p className="text-sm text-[#8094A7] mt-1">
            Booked {bookedDate}
            {delivery.courierName ? ` · ${delivery.courierName}` : ""}
            {delivery.priceCents != null ? ` · $${(delivery.priceCents / 100).toFixed(2)}` : ""}
          </p>
        </div>
        <StatusBadge
          label={statusLabels[delivery.status] || delivery.status}
          status={statusVariants[delivery.status] || "pending"}
        />
      </div>

      {/* Message about this delivery */}
      <button
        type="button"
        onClick={messageAboutDelivery}
        disabled={messaging}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#173420] bg-white text-[#173420] text-sm font-manrope font-semibold py-2.5 hover:bg-[#EDF2EA] disabled:opacity-50 transition-colors"
      >
        <ChatsCircle size={16} />
        {messaging ? "Opening conversation…" : "Message about this delivery"}
      </button>

      {/* Map */}
      <div className="bg-white border border-[#E3E6ED] rounded-lg overflow-hidden h-[320px]">
        <TrackingMap
          trackingNumber={delivery.trackingNumber}
          status={delivery.status}
          pickupAddress={delivery.pickupAddress}
          dropoffAddress={delivery.dropoffAddress}
          courierPosition={
            delivery.courierLocation
              ? { lat: delivery.courierLocation.lat, lng: delivery.courierLocation.lng }
              : null
          }
        />
      </div>

      {/* Live tracking + courier */}
      <LiveTrackingPanel
        shipment={shipment}
        showHeader={false}
        courierLocation={delivery.courierLocation}
        etaMinutes={delivery.etaMinutes}
        etaDistanceMiles={delivery.etaDistanceMiles}
      />
      <VehicleInfoPanel shipment={shipment} />

      {/* Delivery info */}
      <Card className="border-[#E3E6ED] rounded-xl shadow-none bg-white">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-2 min-w-0">
              <MapPin className="h-4 w-4 text-[#173420] mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-[#8094A7]">Pickup</p>
                <p className="text-sm font-medium text-[#161618]">{delivery.pickupAddress}</p>
                <p className="text-xs text-[#8094A7] mt-0.5">
                  {delivery.pickupContactName} | {delivery.pickupContactPhone}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 min-w-0">
              <MapPin className="h-4 w-4 text-[#40C4AA] mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-[#8094A7]">Dropoff</p>
                <p className="text-sm font-medium text-[#161618]">{delivery.dropoffAddress}</p>
                <p className="text-xs text-[#8094A7] mt-0.5">
                  {delivery.dropoffContactName} | {delivery.dropoffContactPhone}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 min-w-0">
              <CalendarBlank className="h-4 w-4 text-[#8094A7] mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-[#8094A7]">Booked</p>
                <p className="text-sm font-medium text-[#161618]">{bookedDate}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Package */}
      <Card className="border-[#E3E6ED] rounded-xl shadow-none bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-[#052D50]">
            <Package className="h-5 w-5 text-[#173420]" />
            Package
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-[#161618]">{delivery.packageDesc}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#5B5A64]">
            <span>{delivery.packagePieces} piece{delivery.packagePieces > 1 ? "s" : ""}</span>
            {delivery.packageWeight && <span>{delivery.packageWeight} lbs</span>}
            {delivery.packageFragile && <span className="text-[#C0392B]">Fragile</span>}
          </div>
        </CardContent>
      </Card>

      {/* Tracking history */}
      <Card className="border-[#E3E6ED] rounded-xl shadow-none bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-[#052D50]">
            <Clock className="h-5 w-5 text-[#173420]" />
            Tracking History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-[#8094A7] py-2">No tracking events yet.</p>
          ) : (
            <div>
              {events.map((e, i) => (
                <div key={e.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    {e.status === "delivered" ? (
                      <CheckCircle className="h-3.5 w-3.5 text-[#007837] shrink-0" />
                    ) : (
                      <div className={`w-3 h-3 rounded-full mt-0.5 ${i === events.length - 1 ? "bg-[#173420]" : "bg-[#E3E6ED]"}`} />
                    )}
                    {i < events.length - 1 && <div className="w-px flex-1 bg-[#E3E6ED] min-h-[24px]" />}
                  </div>
                  <div className="pb-5">
                    <p className="text-sm text-[#161618]">{e.note || statusLabels[e.status] || "Update"}</p>
                    <p className="text-xs text-[#8094A7] mt-0.5">{formatLongDate(e.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface DeliveryDetailSheetProps {
  open: boolean;
  id: string | null;
  token?: string;
  onClose: () => void;
}

export function DeliveryDetailSheet({ open, id, token, onClose }: DeliveryDetailSheetProps) {
  const [lastId, setLastId] = useState<string | null>(id ?? null);

  if (id && id !== lastId) {
    setLastId(id);
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent className="w-full sm:max-w-[599px] p-0 overflow-hidden">
        <div className="h-full overflow-y-auto p-4 sm:p-6">
          <SheetTitle className="sr-only">Delivery details</SheetTitle>
          <SheetDescription className="sr-only">
            Delivery tracking information for {lastId ?? ""}
          </SheetDescription>
          {lastId && token && <DeliveryDetailContent id={lastId} token={token} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
