"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function LogoutPage() {
  useEffect(() => {
    signOut({ callbackUrl: "/sign-in" });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F4FD]">
      <p className="text-sm text-[#8094A7] font-inter">Signing out...</p>
    </div>
  );
}
