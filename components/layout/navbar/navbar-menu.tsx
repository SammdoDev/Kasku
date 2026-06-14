"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Menu, X } from "lucide-react";

import {
  NAVBAR_CONFIG,
  SIDEBAR_CONFIG,
} from "../sidebar/sidebar-menu-constant";
import { getSessionUser, type SessionUser } from "@/lib/helper/session";

type NavbarProps = {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
};

const ROUTE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/transaksi": "Transaksi",
  "/kategori": "Kategori",
  "/tag-transaksi": "Tag Transaksi",
  "/metode-pembayaran": "Dompet",
  "/anggaran": "Anggaran",
  "/ringkasan": "Ringkasan",
  "/saya": "Profil",
};

function getPageLabel(pathname: string): string {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
  const match = Object.keys(ROUTE_LABELS)
    .filter((k) => k !== "/" && pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];
  if (match) return ROUTE_LABELS[match];
  const seg = pathname.split("/").filter(Boolean).pop() ?? "Dashboard";
  return seg.charAt(0).toUpperCase() + seg.slice(1);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

const NavbarMenu = ({ onMenuToggle, isSidebarOpen }: NavbarProps) => {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getSessionUser());
  }, []);

  const pageLabel = getPageLabel(pathname);
  const initials = user ? getInitials(user.full_name) : "??";
  const showBadge =
    NAVBAR_CONFIG.showNotificationDot && NAVBAR_CONFIG.notificationCount > 0;

  return (
    <header
      style={{ backgroundColor: SIDEBAR_CONFIG.bgColor }}
      className="sticky top-0 z-30 flex items-center gap-3 px-4 md:px-5 h-[71px] border-b-[3px] border-black shrink-0"
    >
      <button
        onClick={onMenuToggle}
        aria-label={isSidebarOpen ? "Tutup menu" : "Buka menu"}
        aria-expanded={isSidebarOpen}
        className={[
          "hidden md:flex lg:hidden items-center justify-center w-9 h-9 border-[3px] border-black font-black",
          "transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black",
          isSidebarOpen
            ? "shadow-none translate-x-[2px] translate-y-[2px]"
            : "bg-white shadow-brutal hover:shadow-[1px_1px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]",
        ].join(" ")}
        style={isSidebarOpen ? { background: SIDEBAR_CONFIG.accentColor } : {}}
      >
        {isSidebarOpen ? (
          <X size={17} strokeWidth={3} />
        ) : (
          <Menu size={17} strokeWidth={3} />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="font-black text-[17px] md:text-lg uppercase tracking-tight text-black leading-none truncate">
          {pageLabel}
        </h1>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          aria-label={`Notifikasi${showBadge ? `, ${NAVBAR_CONFIG.notificationCount} baru` : ""}`}
          className="relative flex items-center justify-center w-9 h-9 border-[3px] border-black bg-white shadow-brutal hover:shadow-[1px_1px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
        >
          <Bell size={16} strokeWidth={2.5} />
          {showBadge && (
            <span
              style={{ background: SIDEBAR_CONFIG.accentColor }}
              className="absolute -top-[6px] -right-[6px] min-w-[16px] h-[16px] px-[3px] border-[2px] border-black text-[9px] font-black flex items-center justify-center leading-none text-black"
            >
              {NAVBAR_CONFIG.notificationCount > 99
                ? "99+"
                : NAVBAR_CONFIG.notificationCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 px-2 py-1 border-[3px] border-black bg-white shadow-brutal hover:shadow-[1px_1px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100 cursor-default select-none">
          <div
            style={{ background: SIDEBAR_CONFIG.accentColor }}
            className="w-6 h-6 border-[2px] border-black flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <span className="font-black text-[9px] text-black">{initials}</span>
          </div>
          <span className="hidden sm:block text-[12px] font-black text-black max-w-[100px] truncate">
            {user?.full_name ?? "—"}
          </span>
        </div>
      </div>
    </header>
  );
};

export default NavbarMenu;
