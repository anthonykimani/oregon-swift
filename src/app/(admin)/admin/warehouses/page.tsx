"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Warehouse } from "@phosphor-icons/react";

export default function WarehousesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/sign-in");
  }, [status, router]);

  if (status !== "authenticated" || session?.user?.role !== "admin") return null;

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-[#173420] mb-6 flex items-center gap-3">
        <Warehouse size={24} /> Warehouses
      </h1>
      <p className="text-[#666D80]">Warehouse management coming soon.</p>
    </div>
  );
}
