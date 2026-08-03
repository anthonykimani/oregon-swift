"use client";

import { Phone, ChatTeardrop, Truck, UserCircle } from "@phosphor-icons/react";import type { TrackingShipment } from "@/components/admin/tracking-list";

export function VehicleInfoPanel({ shipment }: { shipment: TrackingShipment | null }) {
  if (!shipment) {
    return (
      <section className="bg-white border border-[#E3E6ED] rounded-lg p-5 flex items-center justify-center min-h-[240px]">
        <span className="text-sm text-[#8094A7]">Select a shipment to view courier</span>
      </section>
    );
  }

  return (
    <section className="bg-white border border-[#E3E6ED] rounded-lg p-5 flex flex-col min-w-0">
      <h3 className="text-sm font-manrope text-[#333] mb-4">Courier &amp; Vehicle</h3>

      {/* Vehicle */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-[#F3F4F8] flex items-center justify-center text-[#45617D] shrink-0">
          <Truck size={20} />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-manrope text-[#8094A7]">Vehicle</div>
          <div className="text-sm font-manrope text-[#333] truncate">
            {shipment.courierVehicle || "—"}
          </div>
        </div>
      </div>

      {/* Courier */}
      <div className="border-t border-[#EDEDED] pt-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#EFFEFA] flex items-center justify-center text-[#12806B] text-sm font-semibold font-manrope shrink-0">
            {(shipment.courierName || "?").slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-manrope text-[#8094A7]">Courier</div>
            <div className="text-sm font-manrope text-[#333] truncate">
              {shipment.courierName || "Unassigned"}
            </div>
            {shipment.courierPhone && (
              <div className="text-[11px] font-manrope text-[#8094A7] truncate">
                {shipment.courierPhone}
              </div>
            )}
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button
              className="relative w-9 h-9 bg-[#F0F0F0] rounded-lg flex items-center justify-center text-[#333] hover:bg-[#E3E6ED] transition-colors"
              title="Message courier"
            >
              <ChatTeardrop size={16} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#F04A4A]" />
            </button>
            <button
              className="w-9 h-9 bg-[#F0F0F0] rounded-lg flex items-center justify-center text-[#333] hover:bg-[#E3E6ED] transition-colors"
              title={shipment.courierPhone ? `Call ${shipment.courierPhone}` : "Call courier"}
            >
              <Phone size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Customer */}
      <div className="border-t border-[#EDEDED] pt-3 mt-auto">
        <div className="flex items-center gap-3">
          <UserCircle size={20} className="text-[#45617D] shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] font-manrope text-[#8094A7]">Customer</div>
            <div className="text-xs font-manrope text-[#333] truncate">
              {shipment.customerName || "—"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}