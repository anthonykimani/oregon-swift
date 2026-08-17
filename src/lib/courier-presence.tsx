"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { api } from "@/lib/api";

type AvailabilityStatus = "online" | "offline";

interface CourierPresence {
  availabilityStatus: AvailabilityStatus;
  lastSeenAt: string | null;
  loading: boolean;
  toggling: boolean;
  setAvailability: (next: AvailabilityStatus) => Promise<boolean>;
}

const CourierPresenceContext = createContext<CourierPresence | null>(null);

export function CourierPresenceProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>("offline");
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    api<{ availabilityStatus: string; lastSeenAt: string | null }>("/courier/availability", { token })
      .then((res) => {
        if (cancelled) return;
        if (res.status === 200 && res.data) {
          setAvailabilityStatus(res.data.availabilityStatus === "online" ? "online" : "offline");
          setLastSeenAt(res.data.lastSeenAt);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const setAvailability = useCallback(
    async (next: AvailabilityStatus): Promise<boolean> => {
      if (!token || toggling) return false;
      setToggling(true);
      const res = await api<{ availabilityStatus: string; lastSeenAt: string | null }>("/courier/availability", {
        method: "PATCH",
        token,
        body: JSON.stringify({ availabilityStatus: next }),
      });
      setToggling(false);
      if (res.status === 200 && res.data) {
        setAvailabilityStatus(res.data.availabilityStatus === "online" ? "online" : "offline");
        setLastSeenAt(res.data.lastSeenAt);
        return true;
      }
      toast.error(res.errors?.[0] || "Failed to update availability");
      return false;
    },
    [token, toggling]
  );

  const value = useMemo<CourierPresence>(
    () => ({ availabilityStatus, lastSeenAt, loading, toggling, setAvailability }),
    [availabilityStatus, lastSeenAt, loading, toggling, setAvailability]
  );

  return <CourierPresenceContext.Provider value={value}>{children}</CourierPresenceContext.Provider>;
}

export function useCourierPresence(): CourierPresence {
  const ctx = useContext(CourierPresenceContext);
  if (!ctx) {
    throw new Error("useCourierPresence must be used within CourierPresenceProvider");
  }
  return ctx;
}
