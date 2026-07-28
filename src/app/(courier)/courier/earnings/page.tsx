"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Cube, Wallet, Truck, ArrowRight } from "@phosphor-icons/react";
import { api } from "@/lib/api";

interface EarningsStats {
  totalDelivered: number;
  activeDeliveries: number;
  totalEarnedCents: number;
}

export default function CourierEarnings() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<EarningsStats | null>(null);
  const [loading, setLoading] = useState(true);

  const token = session?.accessToken;

  useEffect(() => {
    if (!token) return;
    api<EarningsStats>("/courier/earnings", { token }).then((res) => {
      if (res.status === 200 && res.data) setStats(res.data);
    }).finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="h-full flex flex-col bg-[#F5F4FD]">
      <div className="px-5 pt-10 pb-5">
        <h1 className="text-xl font-clash-display font-semibold text-[#173420]">Earnings</h1>
        <p className="text-sm text-[#666D80] font-inter mt-1">Your delivery performance and pay summary</p>
      </div>

      <div className="px-5 flex-1 pb-5">
        {loading ? (
          <div className="grid grid-cols-3 gap-[10px]">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-[#E3E6ED] rounded-lg p-5 min-h-[135px] animate-pulse shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-[10px]">
              <div className="bg-white border border-[#E3E6ED] rounded-lg p-5 min-h-[135px] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-inter text-[#2D5A3A]">Total Earned</span>
                  <Wallet size={16} className="text-[#173420]" />
                </div>
                <div>
                  <div className="text-2xl font-inter font-semibold text-[#173420] mb-1">
                    ${((stats?.totalEarnedCents ?? 0) / 100).toFixed(2)}
                  </div>
                  <span className="text-xs font-inter text-[#8094A7]">all time</span>
                </div>
              </div>
              <div className="bg-white border border-[#E3E6ED] rounded-lg p-5 min-h-[135px] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-inter text-[#2D5A3A]">Delivered</span>
                  <Cube size={16} className="text-[#173420]" />
                </div>
                <div>
                  <div className="text-2xl font-inter font-semibold text-[#173420] mb-1">
                    {stats?.totalDelivered ?? 0}
                  </div>
                  <span className="text-xs font-inter text-[#8094A7]">completed deliveries</span>
                </div>
              </div>
              <div className="bg-white border border-[#E3E6ED] rounded-lg p-5 min-h-[135px] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-inter text-[#2D5A3A]">Active</span>
                  <Truck size={16} className="text-[#173420]" />
                </div>
                <div>
                  <div className="text-2xl font-inter font-semibold text-[#173420] mb-1">
                    {stats?.activeDeliveries ?? 0}
                  </div>
                  <span className="text-xs font-inter text-[#8094A7]">in progress</span>
                </div>
              </div>
            </div>

            <Link
              href="/courier/deliveries"
              className="flex items-center justify-between bg-white border border-[#E3E6ED] rounded-xl p-4 shadow-sm hover:border-[#173420] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Truck size={20} className="text-[#173420]" />
                <div>
                  <p className="text-sm font-semibold text-[#173420]">View Deliveries</p>
                  <p className="text-xs text-[#8094A7]">See detailed delivery history</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-[#173420]" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
