"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TrackingSearch() {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (trackingNumber.trim()) {
      router.push(`/tracking/${encodeURIComponent(trackingNumber.trim())}`);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F4FD] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-clash-display font-semibold text-[#173420] mb-2">Track Your Delivery</h1>
          <p className="text-sm text-[#666D80]">Enter your tracking number to see the latest status</p>
        </div>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
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
            disabled={!trackingNumber.trim()}
            className="h-11 px-5 bg-[#173420] hover:bg-[#1F4228] rounded-lg text-white text-sm"
          >
            Track
          </Button>
        </form>
      </div>
    </div>
  );
}
