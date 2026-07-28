"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { CaretLeft, MapPin } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Delivery } from "@/types/delivery";
import { StatusBadge } from "@/components/ui/status-badge";

export default function DeliveryDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);

  const token = session?.accessToken;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  useEffect(() => {
    if (!token || !params.id) return;
    api<Delivery>(`/deliveries/${params.id}`, { token }).then((res) => {
      if (res.status === 200 && res.data) setDelivery(res.data);
      setLoading(false);
    });
  }, [token, params.id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F5F4FD]">
        <p className="text-sm text-[#8094A7] font-inter">Loading...</p>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#F5F4FD] gap-4">
        <p className="text-sm text-[#8094A7] font-inter">Delivery not found</p>
        <Link href="/dashboard/deliveries" className="text-sm text-[#173420] underline">Back to deliveries</Link>
      </div>
    );
  }

  const events = delivery.trackingEvents || [];

  return (
    <div className="h-full flex flex-col bg-[#F5F4FD] overflow-y-auto">
      <div className="px-4 sm:px-6 pt-8 pb-4">
        <Link href="/dashboard/deliveries" className="inline-flex items-center gap-1 text-sm text-[#8094A7] hover:text-[#173420] mb-3">
          <CaretLeft size={14} /> My Deliveries
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-clash-display font-semibold text-[#173420]">
            {delivery.trackingNumber}
          </h1>
          <StatusBadge label={delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)} status={delivery.status as any} />
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-20 space-y-4 max-w-3xl">
        {/* Tracking Timeline */}
        {events.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E3E6ED] p-4 sm:p-6">
            <h2 className="text-sm font-semibold text-[#173420] mb-4">Tracking</h2>
            <div className="space-y-0">
              {events.map((e, i) => (
                <div key={e.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${i === events.length - 1 ? "bg-[#173420]" : "bg-[#E3E6ED]"}`} />
                    {i < events.length - 1 && <div className="w-px flex-1 bg-[#E3E6ED] min-h-[24px]" />}
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

        {/* Details */}
        <div className="bg-white rounded-xl border border-[#E3E6ED] p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-semibold text-[#173420] uppercase tracking-wider mb-2 flex items-center gap-1">
                <MapPin size={12} /> Pickup
              </h3>
              <p className="text-sm text-[#333]">{delivery.pickupAddress}</p>
              <p className="text-xs text-[#8094A7]">{delivery.pickupContactName} | {delivery.pickupContactPhone}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#173420] uppercase tracking-wider mb-2 flex items-center gap-1">
                <MapPin size={12} /> Dropoff
              </h3>
              <p className="text-sm text-[#333]">{delivery.dropoffAddress}</p>
              <p className="text-xs text-[#8094A7]">{delivery.dropoffContactName} | {delivery.dropoffContactPhone}</p>
            </div>
          </div>
          <div className="h-px bg-[#E3E6ED]" />
          <div>
            <h3 className="text-xs font-semibold text-[#173420] uppercase tracking-wider mb-2">Package</h3>
            <p className="text-sm text-[#333]">{delivery.packageDesc}</p>
            <p className="text-xs text-[#8094A7]">
              {delivery.packagePieces} piece{delivery.packagePieces > 1 ? "s" : ""}
              {delivery.packageWeight ? ` · ${delivery.packageWeight} lbs` : ""}
              {delivery.packageFragile ? " · Fragile" : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
