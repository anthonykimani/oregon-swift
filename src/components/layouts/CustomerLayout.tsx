"use client";

import { useSession } from "next-auth/react";
import {
  House,
  Package,
  Truck,
  Bank,
  ChatsCircle,
  UserCircle,
  Headphones,
  SignOut,
  Plus,
} from "@phosphor-icons/react";
import { AppShell, type AppNavItem, type AppNavSection } from "./AppShell";

const navSections: AppNavSection[] = [
  {
    items: [
      { name: "Dashboard", icon: House, path: "/dashboard" },
      { name: "Book Delivery", icon: Package, path: "/dashboard/book" },
      { name: "My Deliveries", icon: Truck, path: "/dashboard/deliveries" },
      { name: "Invoices", icon: Bank, path: "/dashboard/invoices" },
      { name: "Messages", icon: ChatsCircle, path: "/dashboard/messages", badge: "messages" },
    ],
  },
];

const bottomNav: AppNavItem[] = [
  { name: "Account", icon: UserCircle, path: "/dashboard/account" },
  { name: "Help & Center", icon: Headphones, path: "/dashboard/help" },
  { name: "Sign Out", icon: SignOut, action: "logout" },
];

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const initial =
    session?.user?.firstname?.[0] || session?.user?.name?.[0] || "U";

  return (
    <AppShell
      navSections={navSections}
      bottomNav={bottomNav}
      fallbackTitle="Dashboard"
      headerAction={{
        label: "Book a delivery",
        shortLabel: "Book",
        icon: Plus,
        href: "/dashboard/book",
      }}
      userInitial={initial}
      userHref="/dashboard/account"
    >
      {children}
    </AppShell>
  );
}
