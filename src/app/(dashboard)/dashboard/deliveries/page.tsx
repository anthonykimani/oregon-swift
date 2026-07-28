"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Package, CaretRight, CaretLeft, MapPin } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import type { Delivery } from "@/types/delivery";
import { StatusBadge } from "@/components/ui/status-badge";

function DeliveryDetailView({ id, token, onBack }: { id: string; token: string; onBack: () => void }) {
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Delivery>(`/deliveries/${id}`, { token }).then((res) => {
      if (res.status === 200 && res.data) setDelivery(res.data);
      setLoading(false);
    });
  }, [id, token]);

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
        <button onClick={onBack} className="text-sm text-[#173420] underline">Back to deliveries</button>
      </div>
    );
  }

  const events = delivery.trackingEvents || [];

  return (
    <div className="h-full flex flex-col bg-[#F5F4FD] overflow-y-auto">
      <div className="px-4 sm:px-6 pt-8 pb-4">
        <button onClick={onBack} className="inline-flex items-center gap-1 text-sm text-[#8094A7] hover:text-[#173420] mb-3">
          <CaretLeft size={14} /> My Deliveries
        </button>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-clash-display font-semibold text-[#173420]">{delivery.trackingNumber}</h1>
          <StatusBadge label={delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)} status={delivery.status as any} />
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-20 space-y-4 max-w-3xl">
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

function DeliveriesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const detailId = searchParams.get("id");
  const justCreated = searchParams.get("created");
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  const token = session?.accessToken;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  if (detailId && token) {
    return <DeliveryDetailView id={detailId} token={token} onBack={() => router.push("/dashboard/deliveries")} />;
  }

  const fetchDeliveries = useCallback(async () => {
    if (!token) return;
    const res = await api<Delivery[]>("/deliveries", { token });
    if (res.status === 200 && res.data) {
      setDeliveries(res.data);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (token) fetchDeliveries();
  }, [token, fetchDeliveries]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F5F4FD]">
        <p className="text-sm text-[#8094A7] font-inter">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#F5F4FD] overflow-y-auto">
      <div className="px-4 sm:px-6 pt-8 pb-4">
        <h1 className="text-xl font-clash-display font-semibold text-[#173420]">My Deliveries</h1>
      </div>

      <div className="px-4 sm:px-6 pb-20">
        {justCreated && (
          <div className="bg-[#D9F9E7] text-[#007837] text-sm rounded-lg px-4 py-3 mb-4">
            Delivery booked successfully! You can track it below.
          </div>
        )}

        {deliveries.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E3E6ED] p-8 text-center">
            <Package size={40} className="mx-auto text-[#8094A7]" />
            <p className="text-sm text-[#8094A7] font-inter mt-4">No deliveries yet.</p>
            <Link href="/dashboard/book" className="inline-block mt-4 px-5 py-2.5 bg-[#173420] text-white text-sm rounded-lg">
              Book your first delivery
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {deliveries.map((d) => (
              <div
                key={d.id}
                onClick={() => router.push(`/dashboard/deliveries?id=${d.id}`)}
                className="block bg-white rounded-xl border border-[#E3E6ED] p-4 hover:border-[#173420] transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[#173420]">{d.trackingNumber}</span>
                      <StatusBadge label={d.status.charAt(0).toUpperCase() + d.status.slice(1)} status={d.status as any} />
                    </div>
                    <p className="text-xs text-[#666D80] mt-1 truncate">{d.packageDesc}</p>
                    <div className="flex items-center gap-2 text-xs text-[#8094A7] mt-2">
                      <span>{d.pickupAddress}</span>
                      <CaretRight size={10} />
                      <span>{d.dropoffAddress}</span>
                    </div>
                    <p className="text-xs text-[#8094A7] mt-1">{new Date(d.createdAt).toLocaleDateString()}</p>
                  </div>
                  <CaretRight size={16} className="text-[#8094A7] shrink-0 mt-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyDeliveriesPage() {
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center bg-[#F5F4FD]">
        <p className="text-sm text-[#8094A7] font-inter">Loading...</p>
      </div>
    }>
      <DeliveriesContent />
    </Suspense>
  );
}
