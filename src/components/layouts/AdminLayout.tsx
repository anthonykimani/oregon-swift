"use client";

import { useState } from "react";
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
  MagnifyingGlass,
  CaretLeft,
  CaretRight,
  Plus,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const navSections = [
  {
    label: "MAIN MENU",
    items: [
      { name: "Dashboard", icon: House, path: "/admin", active: true },
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

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isActive = (path: string) => {
    if (path === "/admin" && pathname === "/admin") return true;
    if (path !== "/admin" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex-shrink-0 flex flex-col bg-white border-r border-[#dfe1e7] transition-all duration-300 overflow-hidden",
          sidebarOpen ? "w-[272px]" : "w-0 lg:w-[272px]"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 h-20 border-b border-[#dfe1e7]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#0088ff] flex items-center justify-center">
              <span className="text-white text-sm font-bold">OC</span>
            </div>
            <span className="font-manrope text-xl text-[#0d0d12]">
              Oregon Courier
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-6 h-6 flex items-center justify-center rounded-md border border-[#dfe1e7] hover:bg-gray-50 transition-colors"
          >
            {sidebarOpen ? (
              <CaretLeft size={14} color="#0d0d12" />
            ) : (
              <CaretRight size={14} color="#0d0d12" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="font-inter text-sm text-[#a4acb9] px-3 mb-1">
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
                            ? "bg-[#f6f8fa] text-[#0088ff] font-medium"
                            : "text-[#666d80] hover:bg-[#f6f8fa] hover:text-[#666d80]"
                        )}
                      >
                        {active && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r bg-[#0088ff]" />
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

        {/* Bottom Nav */}
        <div className="px-3 pb-4 space-y-0.5 border-t border-[#dfe1e7] pt-2">
          {bottomNav.map((item) => {
            const Icon = item.icon;
            const isLogout = item.name === "Logout";
            return (
              <Link
                key={item.name}
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-inter transition-colors",
                  isLogout
                    ? "text-[#0088ff] hover:bg-[#f6f8fa]"
                    : "text-[#666d80] hover:bg-[#f6f8fa]"
                )}
              >
                <Icon
                  size={20}
                  weight={isLogout ? "fill" : "regular"}
                  color={isLogout ? "#0088ff" : undefined}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Mobile Overlay */}
      {!sidebarOpen && (
        <button
          className="fixed lg:hidden inset-0 z-10"
          onClick={() => setSidebarOpen(true)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-5 h-[79px] bg-white border-b border-[#e3e6ed]">
          <h1 className="text-2xl text-[#161618] font-sans">Welcome</h1>

          <div className="relative w-[444px]">
            <MagnifyingGlass
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8094a7]"
            />
            <Input
              placeholder="Search"
              className="pl-9 h-8 bg-[#f9f9f9] border-[#e3e6ed] rounded-xl text-sm text-[#8094a7] placeholder:text-[#8094a7]"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button className="h-10 px-4 bg-[#0088ff] hover:bg-[#0088ff]/90 rounded-xl text-white text-sm font-sans gap-2">
              <Plus size={18} weight="bold" />
              Schedule Session
            </Button>
            <Button
              variant="outline"
              className="h-10 px-3 bg-[#fdfdfd] border-[#e3e6ed] rounded-lg text-xs text-[#052d50] font-inter"
            >
              New Patient
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
