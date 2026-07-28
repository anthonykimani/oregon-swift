"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Package, CaretRight } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import type { Delivery } from "@/types/delivery";
import { StatusBadge } from "@/components/ui/status-badge";

function DeliveriesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const justCreated = searchParams.get("created");
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  const token = session?.accessToken;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

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
        <h1 className="text-xl font-clash-display font-semibold text-[#173420]">
          My Deliveries
        </h1>
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
            <Link
              href="/dashboard/book"
              className="inline-block mt-4 px-5 py-2.5 bg-[#173420] text-white text-sm rounded-lg"
            >
              Book your first delivery
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {deliveries.map((d) => (
              <Link
                key={d.id}
                href={`/dashboard/deliveries/${d.id}`}
                className="block bg-white rounded-xl border border-[#E3E6ED] p-4 hover:border-[#173420] transition-colors"
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
                    <p className="text-xs text-[#8094A7] mt-1">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <CaretRight size={16} className="text-[#8094A7] shrink-0 mt-1" />
                </div>
              </Link>
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
