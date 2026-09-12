"use client";

import { useSession } from "next-auth/react";
import {
  House,
  Package,
  Scan,
  ClipboardText,
  ChatsCircle,
  Truck,
  UserCircle,
  Bank,
  Warehouse,
  ChartBar,
  Receipt,
  Gear,
  Headphones,
  SignOut,
} from "@phosphor-icons/react";
import { AppShell, type AppNavItem, type AppNavSection } from "./AppShell";

const navSections: AppNavSection[] = [
  {
    label: "Main menu",
    items: [
      { name: "Dashboard", icon: House, path: "/admin" },
      { name: "Deliveries", icon: Package, path: "/admin/deliveries" },
      { name: "Tracking", icon: Scan, path: "/admin/tracking" },
      {
        name: "Applications",
        icon: ClipboardText,
        path: "/admin/applications",
      },
      { name: "Messages", icon: ChatsCircle, path: "/admin/messages", badge: "messages" },
    ],
  },
  {
    label: "Operations",
    items: [
      { name: "Invoices", icon: Receipt, path: "/admin/invoices" },
      { name: "Carriers", icon: Truck, path: "/admin/carriers" },
      { name: "Customers", icon: UserCircle, path: "/admin/customers" },
      { name: "Companies", icon: Bank, path: "/admin/companies" },
      { name: "Warehouses", icon: Warehouse, path: "/admin/warehouses" },
      { name: "Reports", icon: ChartBar, path: "/admin/reports" },
    ],
  },
];

const bottomNav: AppNavItem[] = [
  { name: "Settings", icon: Gear, path: "/admin/settings" },
  { name: "Help & Center", icon: Headphones, path: "/admin/help" },
  { name: "Logout", icon: SignOut, action: "logout" },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const initial =
    session?.user?.firstname?.[0] || session?.user?.name?.[0] || "A";

  return (
    <AppShell
      navSections={navSections}
      bottomNav={bottomNav}
      fallbackTitle="Dispatch Overview"
      headerAction={{
        label: "Review applications",
        shortLabel: "Review",
        icon: ClipboardText,
        href: "/admin/applications",
      }}
      userInitial={initial}
      userHref="/admin"
    >
      {children}
    </AppShell>
  );
}
