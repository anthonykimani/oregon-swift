"use client";

import { useSession } from "next-auth/react";
import {
  House,
  Truck,
  Wallet,
  Receipt,
  ChatsCircle,
  UserCircle,
  SignOut,
} from "@phosphor-icons/react";
import { AppShell, type AppNavItem, type AppNavSection } from "./AppShell";
import { AvailabilityPill } from "@/components/courier/availability-pill";
import {
  CourierPresenceProvider,
  useCourierPresence,
} from "@/lib/courier-presence";
import { useCourierLocationReporter } from "@/lib/location/use-courier-location-reporter";
import { useLocationVerification } from "@/lib/location/use-location-verification";

const navSections: AppNavSection[] = [
  {
    items: [
      { name: "Dashboard", icon: House, path: "/courier" },
      { name: "My Deliveries", icon: Truck, path: "/courier/deliveries" },
      { name: "Invoices", icon: Receipt, path: "/courier/invoices" },
      { name: "Earnings", icon: Wallet, path: "/courier/earnings" },
      { name: "Messages", icon: ChatsCircle, path: "/courier/messages", badge: "messages" },
    ],
  },
];

const bottomNav: AppNavItem[] = [
  { name: "Account", icon: UserCircle, path: "/courier/account" },
  { name: "Sign Out", icon: SignOut, action: "logout" },
];

export function CourierLayout({ children }: { children: React.ReactNode }) {
  return (
    <CourierPresenceProvider>
      <CourierShell>{children}</CourierShell>
    </CourierPresenceProvider>
  );
}

function CourierShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { availabilityStatus } = useCourierPresence();
  const initial =
    session?.user?.firstname?.[0] || session?.user?.name?.[0] || "C";

  useCourierLocationReporter(
    session?.accessToken,
    availabilityStatus === "online"
  );
  useLocationVerification(session?.accessToken);

  return (
    <AppShell
      navSections={navSections}
      bottomNav={bottomNav}
      fallbackTitle="Dashboard"
      headerSlot={<AvailabilityPill />}
      userInitial={initial}
      userHref="/courier/account"
    >
      {children}
    </AppShell>
  );
}
