"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Scan } from "@phosphor-icons/react";

export default function TrackingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/sign-in");
  }, [status, router]);

  if (status !== "authenticated" || session?.user?.role !== "admin") return null;

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-[#173420] mb-6 flex items-center gap-3">
        <Scan size={24} /> Tracking
      </h1>
      <p className="text-[#666D80]">Live package tracking coming soon.</p>
    </div>
  );
}
