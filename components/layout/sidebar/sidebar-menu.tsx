"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, LogOut, X } from "lucide-react";

import {
  NAV_BOTTOM,
  SIDEBAR_CONFIG,
  NAV_GROUPS,
} from "./sidebar-menu-constant";
import {
  clearSession,
  getSessionUser,
  type SessionUser,
} from "@/lib/helper/session";
import { useThemeConfig } from "@/lib/hooks/use-theme-config";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

function handleLogout() {
  clearSession();
  window.location.href = "/auth/login";
}

const SidebarMenu = ({ isOpen, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const { config, SIZE_SCALES } = useThemeConfig();
  const scale = SIZE_SCALES[config.size];

  const iconSize = parseInt(scale.iconSize);
  const fontSize = scale.baseFontSize;
  const navPy = scale.spacingNav;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getSessionUser());
  }, []);

  const initials = user ? getInitials(user.full_name) : "??";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        style={{
          backgroundColor: "var(--sidebar-bg)",
          width: "var(--sidebar-w)",
        }}
        className={[
          "fixed top-0 left-0 z-50 h-screen flex flex-col",
          "border-r-[3px] border-border",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:static lg:z-auto lg:shrink-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        aria-label="Sidebar navigasi"
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between gap-2 px-5 border-b-[3px] border-border shrink-0 box-content"
          style={{ height: "var(--navbar-h)" }}
        >
          <Link href="/" className="flex items-center gap-2 group">
            <div
              style={{ background: "var(--accent-bg)" }}
              className="w-8 h-8 border-[3px] border-border flex items-center justify-center shadow-[2px_2px_0px_#000] group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all duration-100"
            >
              <span
                style={{ color: "var(--accent-fg)", fontSize }}
                className="font-black leading-none select-none"
              >
                C
              </span>
            </div>
            <span
              className="font-black tracking-tight text-foreground uppercase select-none"
              style={{ fontSize: `calc(${fontSize} + 4px)` }}
            >
              {SIDEBAR_CONFIG.appName}
            </span>
          </Link>

          {/* Close button — mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 border-[2px] border-border bg-card text-foreground hover:bg-foreground hover:text-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
            aria-label="Tutup sidebar"
          >
            <X size={iconSize - 2} strokeWidth={3} />
          </button>
        </div>

        {/* ── Nav groups ── */}
        <nav
          className="flex-1 overflow-y-auto py-4 px-3 space-y-5"
          aria-label="Menu utama"
        >
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <p
                className="font-black text-foreground/40 tracking-[0.18em] px-2 mb-2 uppercase select-none"
                style={{ fontSize: `calc(${fontSize} - 3px)` }}
              >
                {group.title}
              </p>
              <ul className="space-y-[3px]" role="list">
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={isActive ? "page" : undefined}
                        className={[
                          "flex items-center gap-3 px-3 font-bold",
                          "border-[2px] transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground",
                          isActive
                            ? "border-border shadow-brutal -translate-x-0.5 -translate-y-0.5"
                            : "border-transparent text-foreground/65 hover:border-border hover:bg-card hover:shadow-[2px_2px_0px_hsl(var(--border))] hover:-translate-x-0.5 hover:-translate-y-0.5",
                        ].join(" ")}
                        style={{
                          fontSize,
                          paddingTop: navPy,
                          paddingBottom: navPy,
                          ...(isActive
                            ? {
                                background: "var(--accent-bg)",
                                color: "var(--accent-fg)",
                              }
                            : {}),
                        }}
                      >
                        <Icon
                          size={iconSize}
                          strokeWidth={2.5}
                          className="shrink-0"
                        />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span
                            className="bg-foreground text-background font-black min-w-[18px] h-[18px] px-1 flex items-center justify-center border-[2px] border-border leading-none"
                            style={{ fontSize: `calc(${fontSize} - 3px)` }}
                          >
                            {item.badge > 99 ? "99+" : item.badge}
                          </span>
                        )}
                        {isActive && (
                          <ChevronRight
                            size={iconSize - 3}
                            strokeWidth={3}
                            className="shrink-0"
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── Nav bottom ── */}
        <div className="px-3 pt-3 pb-2 border-t-[3px] border-border space-y-[3px] shrink-0">
          {NAV_BOTTOM.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "flex items-center gap-3 px-3 font-bold",
                  "border-[2px] transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground",
                  isActive
                    ? "border-border shadow-brutal -translate-x-[1px] -translate-y-[1px]"
                    : "border-transparent text-foreground/55 hover:border-border hover:bg-card hover:shadow-[2px_2px_0px_hsl(var(--border))] hover:-translate-x-[1px] hover:-translate-y-[1px]",
                ].join(" ")}
                style={{
                  fontSize,
                  paddingTop: navPy,
                  paddingBottom: navPy,
                  ...(isActive
                    ? {
                        background: "var(--accent-bg)",
                        color: "var(--accent-fg)",
                      }
                    : {}),
                }}
              >
                <Icon size={iconSize} strokeWidth={2.5} className="shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* ── User card ── */}
        <div className="px-3 pb-4 pt-2 shrink-0">
          <div className="flex items-center gap-3 p-3 border-[3px] border-border bg-card shadow-brutal">
            <div
              style={{ background: "var(--accent-bg)" }}
              className="w-9 h-9 border-[2px] border-border flex items-center justify-center shrink-0 select-none"
              aria-hidden="true"
            >
              <span
                style={{
                  color: "var(--accent-fg)",
                  fontSize: `calc(${fontSize} - 2px)`,
                }}
                className="font-black"
              >
                {initials}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="font-black text-foreground truncate leading-tight"
                style={{ fontSize }}
              >
                {user?.full_name ?? "—"}
              </p>
              <p
                className="text-foreground/45 font-semibold truncate"
                style={{ fontSize: `calc(${fontSize} - 2px)` }}
              >
                @{user?.username ?? "—"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 border-[2px] border-transparent text-foreground hover:border-border hover:bg-foreground hover:text-background transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
              aria-label="Logout"
            >
              <LogOut size={iconSize - 3} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidebarMenu;
