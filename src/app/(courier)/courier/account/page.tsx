"use client";

import { useSession } from "next-auth/react";
import { Truck, Gear, Warning } from "@phosphor-icons/react";

export default function CourierAccount() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 sm:px-6 pt-8 pb-4">
        <h1 className="text-xl font-clash-display font-semibold text-[#173420]">Account</h1>
        <p className="text-sm text-[#666D80] font-inter mt-1">Your courier profile and settings</p>
      </div>

      <div className="px-4 sm:px-6 flex-1 pb-5 space-y-4">
        <div className="bg-white border border-[#E3E6ED] rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-[#173420] mb-3">Profile</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[#8094A7]">Name</p>
              <p className="text-sm text-[#333333]">
                {user?.firstname || user?.name || "—"} {user?.lastname || ""}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#8094A7]">Email</p>
              <p className="text-sm text-[#333333]">{user?.email || "—"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E3E6ED] rounded-xl p-4 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#173420] mb-3">
            <Truck size={16} /> Vehicle & Work Info
          </h3>
          <p className="text-sm text-[#8094A7]">
            Vehicle details, service zones, and certifications are managed by the admin team. Contact support to update your profile.
          </p>
        </div>

        <div className="bg-white border border-[#E3E6ED] rounded-xl p-4 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#173420] mb-3">
            <Gear size={16} /> Settings
          </h3>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-[#333333]">Notifications</p>
              <p className="text-xs text-[#8094A7]">Push alerts for new assignments</p>
            </div>
            <div className="w-10 h-6 bg-[#DCE8D6] rounded-full relative">
              <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-[#173420] rounded-full" />
            </div>
          </div>
        </div>

        <div className="bg-[#FFF3D6] border border-[#F8D776] rounded-xl p-4 flex items-start gap-3">
          <Warning size={18} className="text-[#B8860B] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#B8860B]">Profile Approval</p>
            <p className="text-xs text-[#B8860B] mt-0.5">
              If your account hasn&apos;t been approved yet, you won&apos;t receive delivery assignments. An admin will review your application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
