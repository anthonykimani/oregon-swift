"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  House,
  Truck,
  Wallet,
  SignOut,
  CaretLeft,
  CaretRight,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", icon: House, path: "/courier" },
  { name: "My Deliveries", icon: Truck, path: "/courier/deliveries" },
  { name: "Earnings", icon: Wallet, path: "/courier/earnings" },
];

const pageTitles: Record<string, string> = {
  "/courier": "Dashboard",
  "/courier/": "Dashboard",
  "/courier/deliveries": "My Deliveries",
  "/courier/earnings": "Earnings",
  "/courier/account": "Account",
};

export function CourierLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setSidebarOpen(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSidebarOpen(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const isActive = (path: string) => {
    if (path === "/courier" && (pathname === "/courier" || pathname === "/courier/")) return true;
    if (path !== "/courier" && pathname.startsWith(path)) return true;
    return false;
  };

  const pageTitle = pageTitles[pathname] || "Courier";

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      <aside
        className={cn(
          "flex-shrink-0 flex flex-col bg-white border-r border-[#DFE1E7] transition-all duration-300 overflow-hidden",
          sidebarOpen ? "w-[272px]" : "w-0 lg:w-[272px]"
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
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-6 h-6 flex items-center justify-center rounded-md border border-[#DFE1E7] hover:bg-gray-50 transition-colors"
          >
            {sidebarOpen ? (
              <CaretLeft size={14} color="#173420" />
            ) : (
              <CaretRight size={14} color="#173420" />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
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
                <Icon size={20} weight={active ? "fill" : "regular"} />
                <span className="flex-1">{item.name}</span>
                <CaretRight size={12} className="text-inherit opacity-50" />
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4 space-y-0.5 border-t border-[#DFE1E7] pt-2">
          <button
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-inter-tight text-[#173420] hover:bg-[#EDF2EA] transition-colors"
          >
            <SignOut size={20} weight="fill" color="#173420" />
            <span>Sign Out</span>
          </button>
        </div>

        {sidebarOpen && (
          <button
            className="fixed lg:hidden inset-0 z-10 bg-black/20"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-5 h-[79px] bg-white border-b border-[#E3E6ED]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden w-7 h-7 flex items-center justify-center rounded-md border border-[#DFE1E7]"
            >
              <CaretRight size={14} color="#173420" />
            </button>
            <h1 className="text-2xl text-[#161618]" style={{ fontFamily: "Geist, var(--font-sans)" }}>
              {pageTitle}
            </h1>
          </div>

          <div className="relative w-[444px] hidden sm:block">
            <MagnifyingGlass
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8094A7]"
            />
            <Input
              placeholder="Search"
              className="pl-9 h-8 bg-[#F9F9F9] border-[#E3E6ED] rounded-xl text-sm text-[#8094A7] placeholder:text-[#8094A7]"
            />
          </div>

          <div className="w-10 h-10 rounded-full bg-[#173420] flex items-center justify-center text-white text-sm font-semibold">
            {session?.user?.firstname?.[0] || session?.user?.name?.[0] || "C"}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
