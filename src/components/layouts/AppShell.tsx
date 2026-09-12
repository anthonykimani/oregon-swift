"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  CaretLeft,
  CaretRight,
  SignOut,
  type Icon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useUnreadCount } from "@/lib/messaging/use-unread-count";
import { BrandMark } from "./BrandMark";

export interface AppNavItem {
  name: string;
  icon: Icon;
  path?: string;
  /** Renders a sign-out action instead of a link. */
  action?: "logout";
  /** Shows the live unread count from the messaging service. */
  badge?: "messages";
  /** Unfinished area: rendered disabled with a "Soon" marker. */
  soon?: boolean;
}

export interface AppNavSection {
  label?: string;
  items: AppNavItem[];
}

export interface AppHeaderAction {
  label: string;
  shortLabel?: string;
  icon: Icon;
  href: string;
}

interface AppShellProps {
  navSections: AppNavSection[];
  bottomNav?: AppNavItem[];
  /** Optional override; defaults to the active nav item's label. */
  pageTitle?: string;
  fallbackTitle?: string;
  headerAction?: AppHeaderAction;
  headerSlot?: React.ReactNode;
  userInitial: string;
  userHref: string;
  children: React.ReactNode;
}

function isItemActive(pathname: string, path: string, roots: string[]) {
  const root = roots.find((r) => path === r || path.startsWith(`${r}/`));
  if (root) {
    if (path === root) return pathname === root || pathname === `${root}/`;
    return pathname.startsWith(path);
  }
  return pathname.startsWith(path);
}

/**
 * One application shell for admin, customer, and courier roles. Owns the
 * shared brand lock-up, sidebar navigation, mobile overlay, header, and
 * account affordances so the three products read as a single system.
 */
export function AppShell({
  navSections,
  bottomNav = [],
  pageTitle,
  fallbackTitle = "Dashboard",
  headerAction,
  headerSlot,
  userInitial,
  userHref,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { unreadCount } = useUnreadCount(session?.accessToken);
  const [sidebarOpen, setSidebarOpen] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setSidebarOpen(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const allItems = [
    ...navSections.flatMap((s) => s.items),
    ...bottomNav,
  ];

  const roots = allItems
    .map((i) => i.path)
    .filter((p): p is string => Boolean(p));

  const activeItem = allItems.find(
    (i) => i.path && isItemActive(pathname, i.path, roots)
  );

  const title = pageTitle ?? activeItem?.name ?? fallbackTitle;

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      <aside
        aria-label="Primary"
        className={cn(
          "fixed lg:static z-50 inset-y-0 left-0 flex-shrink-0 flex flex-col bg-white border-r border-[#DFE1E7] transition-all duration-300 overflow-hidden",
          sidebarOpen ? "w-[272px]" : "w-0 lg:w-[272px]"
        )}
      >
        <div className="flex items-center justify-between px-4 h-20 border-b border-[#DFE1E7]">
          <BrandMark href={userHref} />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="w-6 h-6 flex items-center justify-center rounded-md border border-[#DFE1E7] hover:bg-forest-50 transition-colors"
          >
            {sidebarOpen ? (
              <CaretLeft size={14} color="#173420" />
            ) : (
              <CaretRight size={14} color="#173420" />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section, sectionIndex) => (
            <div key={section.label ?? sectionIndex}>
              {section.label && (
                <p className="font-manrope text-xs uppercase tracking-wide text-[#A4ACB9] px-3 mb-1.5">
                  {section.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.name}>
                    <NavRow
                      item={item}
                      active={
                        item.path
                          ? isItemActive(pathname, item.path, roots)
                          : false
                      }
                      unreadCount={unreadCount}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {bottomNav.length > 0 && (
          <div className="px-3 pb-4 space-y-0.5 border-t border-[#DFE1E7] pt-2">
            {bottomNav.map((item) => (
              <NavRow
                key={item.name}
                item={item}
                active={false}
                unreadCount={unreadCount}
              />
            ))}
          </div>
        )}

      </aside>

      {/* Rendered outside the drawer so it dims and captures taps on the
          content behind it without covering the navigation itself. */}
      {sidebarOpen && (
        <button
          aria-label="Close navigation"
          className="fixed lg:hidden inset-0 z-40 bg-black/20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between gap-3 px-4 sm:px-5 h-[79px] bg-white border-b border-[#E3E6ED]">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={sidebarOpen}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-md border border-[#DFE1E7] shrink-0"
            >
              <CaretRight size={14} color="#173420" />
            </button>
            <h1 className="text-xl sm:text-2xl text-[#161618] truncate">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {headerSlot}
            {headerAction && (
              <Link
                href={headerAction.href}
                className="inline-flex items-center gap-2 h-10 px-3 sm:px-4 rounded-xl bg-sun-500 hover:bg-sun-400 text-forest text-sm font-medium whitespace-nowrap transition-colors"
              >
                <headerAction.icon size={18} weight="bold" />
                <span className="hidden sm:inline">{headerAction.label}</span>
                <span className="sm:hidden">
                  {headerAction.shortLabel ?? headerAction.label}
                </span>
              </Link>
            )}
            <Link
              href={userHref}
              aria-label="Account"
              className="w-10 h-10 rounded-full bg-forest flex items-center justify-center text-white text-sm font-semibold shrink-0"
            >
              {userInitial}
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function NavRow({
  item,
  active,
  unreadCount,
}: {
  item: AppNavItem;
  active: boolean;
  unreadCount: number;
}) {
  const Icon = item.icon;

  const inner = (
    <>
      {active && !item.soon && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r bg-forest" />
      )}
      <Icon size={20} weight={active && !item.soon ? "fill" : "regular"} />
      <span className="flex-1">{item.name}</span>
      {item.badge === "messages" && unreadCount > 0 && (
        <span className="h-[18px] min-w-[18px] px-1 flex items-center justify-center rounded-full bg-[#C0392B] text-white text-xs font-bold">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
      {item.soon ? (
        <span className="rounded-full border border-[#E3E6ED] bg-[#F9F9F9] px-2 py-0.5 text-xs font-medium text-[#8094A7]">
          Soon
        </span>
      ) : (
        <CaretRight size={12} className="text-inherit opacity-50" />
      )}
    </>
  );

  const base =
    "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-manrope transition-colors";

  if (item.soon) {
    return (
      <span
        aria-disabled="true"
        title={`${item.name} is coming soon`}
        className={cn(base, "text-[#A4ACB9] cursor-not-allowed")}
      >
        {inner}
      </span>
    );
  }

  const isLogout = item.action === "logout";

  if (isLogout) {
    return (
      <button
        onClick={() => signOut({ callbackUrl: "/sign-in" })}
        className={cn(
          base,
          "w-full text-forest hover:bg-forest-100"
        )}
      >
        {inner}
      </button>
    );
  }

  return (
    <Link
      href={item.path ?? "#"}
      className={cn(
        base,
        active
          ? "bg-forest-100 text-forest font-medium"
          : "text-[#666D80] hover:bg-forest-100 hover:text-[#666D80]"
      )}
    >
      {inner}
    </Link>
  );
}
