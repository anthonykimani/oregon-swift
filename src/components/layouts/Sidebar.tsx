"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Package,
  Scan,
  Truck,
  UserCircle,
  Bank,
  Warehouse,
  ChartBar,
  Gear,
  Headphones,
  SignOut,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const navSections = [
  {
    label: "MAIN MENU",
    items: [
      { name: "Dashboard", icon: House, path: "/admin" },
      { name: "Shipments", icon: Package, path: "/admin/shipments" },
      { name: "Tracking", icon: Scan, path: "/admin/tracking" },
    ],
  },
  {
    label: "FEATURES",
    items: [
      { name: "Carriers", icon: Truck, path: "/admin/carriers" },
      { name: "Customers", icon: UserCircle, path: "/admin/customers" },
      { name: "Companies", icon: Bank, path: "/admin/companies" },
      { name: "Warehouses", icon: Warehouse, path: "/admin/warehouses" },
      { name: "Reports", icon: ChartBar, path: "/admin/reports" },
    ],
  },
];

const bottomNav = [
  { name: "Settings", icon: Gear, path: "/admin/settings" },
  { name: "Help & Center", icon: Headphones, path: "/admin/help" },
  { name: "Logout", icon: SignOut, path: "/logout" },
];

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

export function Sidebar({ open, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/admin" && pathname === "/admin") return true;
    if (path !== "/admin" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <aside
      className={cn(
        "flex-shrink-0 flex flex-col bg-white border-r border-[#DFE1E7] transition-all duration-300 overflow-hidden",
        open ? "w-[272px]" : "w-0 lg:w-[272px]"
      )}
    >
      <div className="flex items-center justify-between px-4 h-20 border-b border-[#DFE1E7]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[#173420] flex items-center justify-center">
            <span className="text-white text-sm font-bold">OC</span>
          </div>
          <span className="font-manrope text-xl text-[#173420]">
            Oregon Courier
          </span>
        </div>
        <button
          onClick={onToggle}
          className="w-6 h-6 flex items-center justify-center rounded-md border border-[#DFE1E7] hover:bg-gray-50 transition-colors"
        >
          {open ? (
            <CaretLeft size={14} color="#173420" />
          ) : (
            <CaretRight size={14} color="#173420" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="font-inter-tight text-sm text-[#A4ACB9] px-3 mb-1">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <li key={item.name}>
                    <Link
                      href={item.path}
                      className={cn(
                        "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-manrope transition-colors",
                        active
                          ? "bg-[#EDF2EA] text-[#173420] font-medium"
                          : "text-[#666D80] hover:bg-[#EDF2EA] hover:text-[#666D80]"
                      )}
                    >
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r bg-[#173420]" />
                      )}
                      <Icon
                        size={20}
                        weight={active ? "fill" : "regular"}
                      />
                      <span className="flex-1">{item.name}</span>
                      <CaretRight size={12} className="text-inherit opacity-50" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-3 pb-4 space-y-0.5 border-t border-[#DFE1E7] pt-2">
        {bottomNav.map((item) => {
          const Icon = item.icon;
          const isLogout = item.name === "Logout";
          return (
            <Link
              key={item.name}
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-inter-tight transition-colors",
                isLogout
                  ? "text-[#173420] hover:bg-[#EDF2EA]"
                  : "text-[#666D80] hover:bg-[#EDF2EA]"
              )}
            >
              <Icon
                size={20}
                weight={isLogout ? "fill" : "regular"}
                color={isLogout ? "#173420" : undefined}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {!open && (
        <button
          className="fixed lg:hidden inset-0 z-10"
          onClick={onToggle}
        />
      )}
    </aside>
  );
}
