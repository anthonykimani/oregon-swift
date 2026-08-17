"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { verifyLocationServices } from "@/lib/location/verify-location-services";

/**
 * Verifies browser/device location access once per courier session (on login
 * or when the session becomes available) and surfaces the result as a toast.
 * Actively prompts the browser when permission is undecided; never blocks the
 * courier from going online.
 */
export function useLocationVerification(token?: string) {
  const ranRef = useRef(false);

  useEffect(() => {
    if (!token || ranRef.current) return;
    ranRef.current = true;

    let cancelled = false;
    verifyLocationServices().then(({ status }) => {
      if (cancelled) return;
      switch (status) {
        case "granted":
          toast.success("Location services on — dispatch can see you.");
          break;
        case "denied":
          toast.error("Location access is blocked. Enable it in your browser to be visible to dispatch.");
          break;
        case "unavailable":
          toast.error("Device location services are off. Turn them on to be tracked.");
          break;
        case "unsupported":
          toast.error("Your browser doesn't support location tracking.");
          break;
      }
    });

    return () => {
      cancelled = true;
    };
  }, [token]);
}
