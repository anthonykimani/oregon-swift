"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { CaretRight, List, X, type Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useUnreadCount } from "@/lib/messaging/use-unread-count";
import { BrandMark } from "./BrandMark";

export interface AppNavItem {
  name: string;
  icon: Icon;
  path?: string;
  action?: "logout";
  badge?: "messages";
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
  pageTitle?: string;
  fallbackTitle?: string;
  headerAction?: AppHeaderAction;
  headerSlot?: React.ReactNode;
  userInitial: string;
  userHref: string;
  children: React.ReactNode;
}

function isItemActive(pathname: string, path: string, roots: string[]) {
  const root = roots.find((candidate) => path === candidate || path.startsWith(`${candidate}/`));
  if (!root) return pathname.startsWith(path);
  return path === root ? pathname === root || pathname === `${root}/` : pathname.startsWith(path);
}

function workspaceFor(pathname: string) {
  if (pathname.startsWith("/admin")) return "Dispatch control";
  if (pathname.startsWith("/courier")) return "Courier field desk";
  return "Customer workspace";
}

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
  const [navigationOpen, setNavigationOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const allItems = [...navSections.flatMap((section) => section.items), ...bottomNav];
  const roots = allItems.map((item) => item.path).filter((path): path is string => Boolean(path));
  const activeItem = allItems.find((item) => item.path && isItemActive(pathname, item.path, roots));
  const title = pageTitle ?? activeItem?.name ?? fallbackTitle;
  const workspace = workspaceFor(pathname);
  const firstName = session?.user?.firstname || session?.user?.name?.split(" ")[0] || "Account";
  const email = session?.user?.email || "View your profile";

  useEffect(() => {
    if (!navigationOpen) return;
    const drawer = drawerRef.current;
    const menuButton = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = drawer?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
    focusable?.[0]?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") return setNavigationOpen(false);
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      menuButton?.focus();
    };
  }, [navigationOpen]);

  return (
    <div className="flex h-dvh overflow-hidden bg-[#F3F5F1] font-manrope text-[#161618]">
      <aside ref={drawerRef} aria-label="Primary" className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-[280px] shrink-0 flex-col overflow-hidden border-r border-white/10 bg-forest text-white shadow-2xl transition-transform duration-300 ease-out lg:static lg:z-auto lg:translate-x-0 lg:shadow-none",
        navigationOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-24 items-center justify-between border-b border-white/10 px-5">
          <div>
            <BrandMark href={userHref} tone="inverse" />
            <p className="mt-1 pl-[42px] text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">{workspace}</p>
          </div>
          <button type="button" onClick={() => setNavigationOpen(false)} aria-label="Close navigation" className="flex size-11 items-center justify-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white lg:hidden">
            <X size={20} weight="bold" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-7">
            {navSections.map((section, index) => (
              <section key={section.label ?? index} aria-label={section.label}>
                {section.label && <p className="mb-2 px-3 text-xs font-bold uppercase tracking-[0.14em] text-white/40">{section.label}</p>}
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.name}>
                      <NavRow item={item} active={Boolean(item.path && isItemActive(pathname, item.path, roots))} unreadCount={unreadCount} onNavigate={() => setNavigationOpen(false)} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </nav>

        <div className="border-t border-white/10 p-3">
          <Link href={userHref} onClick={() => setNavigationOpen(false)} className="mb-2 flex min-h-16 items-center gap-3 rounded-2xl bg-white/[0.07] px-3 py-2.5 hover:bg-white/[0.12]">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sun-500 text-sm font-extrabold text-forest">{userInitial}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-white">{firstName}</span>
              <span className="block truncate text-xs text-white/50">{email}</span>
            </span>
            <CaretRight size={15} className="shrink-0 text-white/35" />
          </Link>
          <div className="space-y-1">
            {bottomNav.filter((item) => item.path !== userHref).map((item) => <NavRow key={item.name} item={item} active={Boolean(item.path && isItemActive(pathname, item.path, roots))} unreadCount={unreadCount} onNavigate={() => setNavigationOpen(false)} />)}
          </div>
        </div>
      </aside>

      {navigationOpen && <button type="button" aria-label="Close navigation" className="fixed inset-0 z-40 bg-[#08170e]/55 backdrop-blur-[2px] lg:hidden" onClick={() => setNavigationOpen(false)} />}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-20 shrink-0 items-center justify-between gap-4 border-b border-[#DCE2D9] bg-[#FBFCFA]/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button ref={menuButtonRef} type="button" onClick={() => setNavigationOpen(true)} aria-label="Open navigation" aria-expanded={navigationOpen} className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#D7DED4] bg-white text-forest hover:bg-forest-50 lg:hidden">
              <List size={21} weight="bold" />
            </button>
            <div className="min-w-0">
              <p className="hidden text-xs font-bold uppercase tracking-[0.14em] text-forest-600 sm:block">{workspace}</p>
              <h1 className="truncate text-xl font-semibold tracking-[-0.02em] text-[#161618] sm:text-2xl">{title}</h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {headerSlot}
            {headerAction && (
              <Link href={headerAction.href} className="inline-flex h-11 items-center gap-2 rounded-xl bg-sun-500 px-3.5 text-sm font-bold text-forest shadow-[0_6px_18px_rgba(243,188,36,0.2)] transition-[background-color,transform,box-shadow] hover:-translate-y-0.5 hover:bg-sun-400 hover:shadow-[0_8px_22px_rgba(243,188,36,0.28)] sm:px-4">
                <headerAction.icon size={18} weight="bold" />
                <span className="hidden sm:inline">{headerAction.label}</span><span className="sm:hidden">{headerAction.shortLabel ?? headerAction.label}</span>
              </Link>
            )}
            <Link href={userHref} aria-label={`Account: ${firstName}`} title={email} className="flex size-11 items-center justify-center rounded-xl border border-forest-200 bg-white text-sm font-extrabold text-forest hover:bg-forest-50">{userInitial}</Link>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto bg-[#F3F5F1]">{children}</main>
      </div>
    </div>
  );
}

function NavRow({ item, active, unreadCount, onNavigate }: { item: AppNavItem; active: boolean; unreadCount: number; onNavigate: () => void }) {
  const Icon = item.icon;
  const base = "group relative flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors";
  const inner = <>
    {active && !item.soon && <span className="absolute -left-3 top-2.5 h-6 w-1 rounded-r-full bg-sun-500" />}
    <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", active && !item.soon ? "bg-white/10 text-sun-300" : "text-white/55 group-hover:text-white")}><Icon size={19} weight={active && !item.soon ? "fill" : "regular"} /></span>
    <span className="min-w-0 flex-1 truncate text-left">{item.name}</span>
    {item.badge === "messages" && unreadCount > 0 && <span aria-label={`${unreadCount} unread messages`} className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sun-500 px-1.5 text-xs font-extrabold text-forest">{unreadCount > 99 ? "99+" : unreadCount}</span>}
    {item.soon ? <span className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/45">Soon</span> : item.action !== "logout" ? <CaretRight size={13} className="shrink-0 text-white/25 transition-transform group-hover:translate-x-0.5 group-hover:text-white/55" /> : null}
  </>;
  if (item.soon) return <span aria-disabled="true" title={`${item.name} is coming soon`} className={cn(base, "cursor-not-allowed text-white/35")}>{inner}</span>;
  if (item.action === "logout") return <button type="button" onClick={() => signOut({ callbackUrl: "/sign-in" })} className={cn(base, "text-white/65 hover:bg-white/[0.08] hover:text-white")}>{inner}</button>;
  return <Link href={item.path ?? "#"} onClick={onNavigate} aria-current={active ? "page" : undefined} className={cn(base, active ? "bg-white/[0.1] text-white" : "text-white/65 hover:bg-white/[0.07] hover:text-white")}>{inner}</Link>;
}
