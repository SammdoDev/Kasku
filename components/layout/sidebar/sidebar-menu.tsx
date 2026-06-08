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
          width: SIDEBAR_CONFIG.sidebarWidth,
          backgroundColor: SIDEBAR_CONFIG.bgColor,
        }}
        className={[
          "fixed top-0 left-0 z-50 h-screen flex flex-col",
          "border-r-[3px] border-black",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:static lg:z-auto lg:shrink-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        aria-label="Sidebar navigasi"
      >
        <div className="flex items-center justify-between px-5 py-[18px] border-b-[3px] border-black shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <div
              style={{ background: SIDEBAR_CONFIG.accentColor }}
              className="w-8 h-8 border-[3px] border-black flex items-center justify-center shadow-[2px_2px_0px_#000] group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all duration-100"
            >
              <span className="font-black text-sm text-black leading-none select-none">
                K
              </span>
            </div>
            <span className="font-black text-xl tracking-tight text-black uppercase select-none">
              {SIDEBAR_CONFIG.appName}
            </span>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden p-1 border-[2px] border-black bg-white hover:bg-black hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            aria-label="Tutup sidebar"
          >
            <X size={15} strokeWidth={3} />
          </button>
        </div>

        <nav
          className="flex-1 overflow-y-auto py-4 px-3 space-y-5"
          aria-label="Menu utama"
        >
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="text-[10px] font-black text-black/40 tracking-[0.18em] px-2 mb-2 uppercase select-none">
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
                          "flex items-center gap-3 px-3 py-[9px] text-[13.5px] font-bold",
                          "border-[2px] transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black",
                          isActive
                            ? "border-black text-black shadow-brutal -translate-x-0.5 -translate-y-0.5"
                            : "border-transparent text-black/65 hover:border-black hover:bg-white hover:shadow-[2px_2px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5",
                        ].join(" ")}
                        style={
                          isActive
                            ? { background: SIDEBAR_CONFIG.accentColor }
                            : {}
                        }
                      >
                        <Icon
                          size={16}
                          strokeWidth={2.5}
                          className="shrink-0"
                        />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="bg-black text-white text-[10px] font-black min-w-[18px] h-[18px] px-1 flex items-center justify-center border-[2px] border-black leading-none">
                            {item.badge > 99 ? "99+" : item.badge}
                          </span>
                        )}
                        {isActive && (
                          <ChevronRight
                            size={13}
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

        <div className="px-3 pt-3 pb-2 border-t-[3px] border-black space-y-[3px] shrink-0">
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
                  "flex items-center gap-3 px-3 py-[9px] text-[13.5px] font-bold",
                  "border-[2px] transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black",
                  isActive
                    ? "border-black text-black shadow-brutal -translate-x-[1px] -translate-y-[1px]"
                    : "border-transparent text-black/55 hover:border-black hover:bg-white hover:shadow-[2px_2px_0px_#000] hover:-translate-x-[1px] hover:-translate-y-[1px]",
                ].join(" ")}
                style={
                  isActive ? { background: SIDEBAR_CONFIG.accentColor } : {}
                }
              >
                <Icon size={16} strokeWidth={2.5} className="shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="px-3 pb-4 pt-2 shrink-0">
          <div className="flex items-center gap-3 p-3 border-[3px] border-black bg-white shadow-brutal">
            <div
              style={{ background: SIDEBAR_CONFIG.accentColor }}
              className="w-9 h-9 border-[2px] border-black flex items-center justify-center shrink-0 select-none"
              aria-hidden="true"
            >
              <span className="font-black text-[11px] text-black">
                {initials}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-black text-black truncate leading-tight">
                {user?.full_name ?? "—"}
              </p>
              <p className="text-[11px] text-black/45 font-semibold truncate">
                @{user?.username ?? "—"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 border-[2px] border-transparent hover:border-black hover:bg-black hover:text-white transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
              aria-label="Logout"
            >
              <LogOut size={13} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidebarMenu;
