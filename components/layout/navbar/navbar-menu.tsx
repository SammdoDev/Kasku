/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  Bell,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Palette,
} from "lucide-react";

import { NAVBAR_CONFIG } from "../sidebar/sidebar-menu-constant";
import {
  clearSession,
  getSessionUser,
  type SessionUser,
} from "@/lib/helper/session";
import {
  useThemeConfig,
  ACCENT_COLORS,
  SIZE_SCALES,
  type SizeScale,
} from "@/lib/hooks/use-theme-config";

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

type DrawerType = "profile" | "theme" | null;

const NavbarMenu = ({ onMenuToggle, isSidebarOpen }: NavbarProps) => {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [drawer, setDrawer] = useState<DrawerType>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const { config, update } = useThemeConfig();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getSessionUser());
  }, []);

  useEffect(() => {
    if (!drawer) return;
    const handleClick = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setDrawer(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [drawer]);

  useEffect(() => {
    setDrawer(null);
  }, [pathname]);

  const pageLabel = getPageLabel(pathname);
  const initials = user ? getInitials(user.full_name) : "??";
  const showBadge =
    NAVBAR_CONFIG.showNotificationDot && NAVBAR_CONFIG.notificationCount > 0;
  const sizes = Object.entries(SIZE_SCALES) as [
    SizeScale,
    (typeof SIZE_SCALES)[SizeScale],
  ][];

  const toggleDrawer = (type: DrawerType) =>
    setDrawer((prev) => (prev === type ? null : type));

  return (
    <>
      <header
        style={{ backgroundColor: "var(--navbar-bg)" }}
        className="sticky top-0 z-30 flex items-center gap-3 px-4 md:px-5 border-b-[3px] border-border shrink-0"
        // height via CSS var
      >
        <div
          style={{ height: "var(--navbar-h)" }}
          className="flex items-center gap-3 w-full"
        >
          {/* Hamburger */}
          <button
            onClick={onMenuToggle}
            aria-label={isSidebarOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={isSidebarOpen}
            className={[
              "hidden md:flex lg:hidden items-center justify-center w-9 h-9 border-[3px] border-border font-black text-foreground",
              "transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground",
              isSidebarOpen
                ? "shadow-none translate-x-[2px] translate-y-[2px]"
                : "bg-card shadow-brutal hover:shadow-[1px_1px_0px_hsl(var(--border))] hover:translate-x-[2px] hover:translate-y-[2px]",
            ].join(" ")}
            style={isSidebarOpen ? { background: "var(--accent-bg)" } : {}}
          >
            {isSidebarOpen ? (
              <X
                size={17}
                strokeWidth={3}
                style={{ color: "var(--accent-fg)" }}
              />
            ) : (
              <Menu size={17} strokeWidth={3} />
            )}
          </button>

          {/* Page title */}
          <div className="flex-1 min-w-0">
            <h1
              className="font-black uppercase tracking-tight text-foreground leading-none truncate"
              style={{ fontSize: "calc(var(--nav-font-size) + 3px)" }}
            >
              {pageLabel}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Bell */}
            <button
              aria-label={`Notifikasi${showBadge ? `, ${NAVBAR_CONFIG.notificationCount} baru` : ""}`}
              className="relative flex items-center justify-center w-9 h-9 border-[3px] border-border bg-card text-foreground shadow-brutal hover:shadow-[1px_1px_0px_hsl(var(--border))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
            >
              <Bell size={16} strokeWidth={2.5} />
              {showBadge && (
                <span
                  style={{
                    background: "var(--accent-bg)",
                    color: "var(--accent-fg)",
                  }}
                  className="absolute -top-[6px] -right-[6px] min-w-[16px] h-[16px] px-[3px] border-[2px] border-border text-[9px] font-black flex items-center justify-center leading-none"
                >
                  {NAVBAR_CONFIG.notificationCount > 99
                    ? "99+"
                    : NAVBAR_CONFIG.notificationCount}
                </span>
              )}
            </button>

            {/* Theme picker button */}
            <button
              onClick={() => toggleDrawer("theme")}
              aria-label="Theme"
              className={[
                "flex items-center justify-center w-9 h-9 border-[3px] border-border font-black",
                "transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground",
                drawer === "theme"
                  ? "shadow-none translate-x-[2px] translate-y-[2px]"
                  : "bg-card shadow-brutal hover:shadow-[1px_1px_0px_hsl(var(--border))] hover:translate-x-[2px] hover:translate-y-[2px]",
              ].join(" ")}
              style={
                drawer === "theme"
                  ? {
                      background: "var(--accent-bg)",
                      color: "var(--accent-fg)",
                    }
                  : {}
              }
            >
              <Palette size={16} strokeWidth={2.5} />
            </button>

            {/* User chip */}
            <button
              onClick={() => toggleDrawer("profile")}
              aria-label="Buka profil"
              className={[
                "flex items-center gap-2 px-2 py-1 border-[3px] border-border bg-card shadow-brutal",
                "hover:shadow-[1px_1px_0px_hsl(var(--border))] hover:translate-x-[2px] hover:translate-y-[2px]",
                "transition-all duration-100 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground",
                drawer === "profile"
                  ? "shadow-none translate-x-[2px] translate-y-[2px]"
                  : "",
              ].join(" ")}
              style={
                drawer === "profile" ? { background: "var(--accent-bg)" } : {}
              }
            >
              <div
                style={{
                  background:
                    drawer === "profile"
                      ? "var(--accent-fg)"
                      : "var(--accent-bg)",
                }}
                className="w-6 h-6 border-[2px] border-border flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                <span
                  style={{
                    color:
                      drawer === "profile"
                        ? "var(--accent-bg)"
                        : "var(--accent-fg)",
                    fontSize: "9px",
                  }}
                  className="font-black"
                >
                  {initials}
                </span>
              </div>
              <span
                className="hidden sm:block font-black max-w-[100px] truncate"
                style={{
                  fontSize: "var(--nav-font-size)",
                  color: drawer === "profile" ? "var(--accent-fg)" : undefined,
                }}
              >
                {user?.full_name ?? "—"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {drawer && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setDrawer(null)}
          aria-hidden="true"
        />
      )}

      {/* Shared drawer wrapper */}
      <div
        ref={drawerRef}
        className={[
          "fixed top-0 right-0 z-50 h-screen w-[300px] flex flex-col",
          "border-l-[3px] border-border",
          "transition-transform duration-300 ease-in-out",
          drawer ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        style={{ backgroundColor: "var(--sidebar-bg)" }}
      >
        {/* ── PROFILE DRAWER ── */}
        {drawer === "profile" && (
          <>
            <div
              className="flex items-center justify-between px-5 py-[18px] border-b-[3px] border-border shrink-0"
              style={{ background: "var(--accent-bg)" }}
            >
              <span
                className="font-black text-sm uppercase tracking-widest"
                style={{ color: "var(--accent-fg)" }}
              >
                PROFIL
              </span>
              <button
                onClick={() => setDrawer(null)}
                className="p-1 border-[2px] border-border flex items-center justify-center"
                style={{
                  background: "var(--accent-fg)",
                  color: "var(--accent-bg)",
                }}
                aria-label="Tutup"
              >
                <X size={14} strokeWidth={3} />
              </button>
            </div>

            <div className="px-4 py-5 border-b-[3px] border-border shrink-0">
              <div className="flex items-center gap-3">
                <div
                  style={{ background: "var(--accent-bg)" }}
                  className="w-12 h-12 border-[3px] border-border flex items-center justify-center shrink-0"
                >
                  <span
                    style={{ color: "var(--accent-fg)" }}
                    className="font-black text-base"
                  >
                    {initials}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-black text-foreground truncate leading-tight">
                    {user?.full_name ?? "—"}
                  </p>
                  <p className="text-[11px] text-foreground/45 font-semibold truncate mt-0.5">
                    @{user?.username ?? "—"}
                  </p>
                </div>
              </div>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-[3px]">
              {[
                { href: "/profil", label: "Lihat Profil", icon: User },
                {
                  href: "/profil/pengaturan",
                  label: "Pengaturan",
                  icon: Settings,
                },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-[10px] text-[13px] font-bold text-foreground/70 border-[2px] border-transparent hover:border-border hover:bg-card hover:shadow-[2px_2px_0px_hsl(var(--border))] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100"
                >
                  <Icon size={15} strokeWidth={2.5} className="shrink-0" />
                  <span className="flex-1">{label}</span>
                  <ChevronRight
                    size={13}
                    strokeWidth={3}
                    className="opacity-40"
                  />
                </Link>
              ))}
            </nav>

            <div className="px-3 pb-4 pt-2 border-t-[3px] border-border shrink-0">
              <button
                onClick={() => {
                  clearSession();
                  window.location.href = "/auth/login";
                }}
                className="w-full flex items-center gap-3 px-3 py-[10px] text-[13px] font-bold border-[2px] border-transparent text-foreground/55 hover:border-border hover:bg-card hover:shadow-[2px_2px_0px_hsl(var(--border))] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100"
              >
                <LogOut size={15} strokeWidth={2.5} className="shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </>
        )}

        {/* ── THEME DRAWER ── */}
        {drawer === "theme" && (
          <>
            <div
              className="flex items-center justify-between px-5 py-[18px] border-b-[3px] border-border shrink-0"
              style={{ background: "var(--accent-bg)" }}
            >
              <span
                className="font-black text-sm uppercase tracking-widest"
                style={{ color: "var(--accent-fg)" }}
              >
                TAMPILAN
              </span>
              <button
                onClick={() => setDrawer(null)}
                className="p-1 border-[2px] border-border flex items-center justify-center"
                style={{
                  background: "var(--accent-fg)",
                  color: "var(--accent-bg)",
                }}
                aria-label="Tutup"
              >
                <X size={14} strokeWidth={3} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
              {/* Warna Aksen */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-foreground/40 mb-3">
                  WARNA AKSEN
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {ACCENT_COLORS.map((color) => {
                    const isActive = config.accentId === color.id;
                    return (
                      <button
                        key={color.id}
                        onClick={() => update({ accentId: color.id })}
                        className={[
                          "flex flex-col items-center gap-1.5 p-2 border-[2px] transition-all duration-100",
                          isActive
                            ? "border-border shadow-brutal -translate-x-0.5 -translate-y-0.5"
                            : "border-transparent hover:border-border",
                        ].join(" ")}
                        title={color.label}
                      >
                        <div
                          className="w-7 h-7 border-[2px] border-border"
                          style={{ background: color.bg }}
                        />
                        <span className="text-[9px] font-black text-foreground/60 uppercase tracking-wide">
                          {color.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ukuran */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-foreground/40 mb-3">
                  UKURAN
                </p>
                <div className="flex gap-2">
                  {sizes.map(([key, scale]) => {
                    const isActive = config.size === key;
                    return (
                      <button
                        key={key}
                        onClick={() => update({ size: key })}
                        className={[
                          "flex-1 py-2 text-[11px] font-black border-[2px] transition-all duration-100",
                          isActive
                            ? "border-border shadow-brutal -translate-x-0.5 -translate-y-0.5"
                            : "border-border/40 text-foreground/50 hover:border-border hover:text-foreground",
                        ].join(" ")}
                        style={
                          isActive
                            ? {
                                background: "var(--accent-bg)",
                                color: "var(--accent-fg)",
                              }
                            : {}
                        }
                      >
                        {scale.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] font-bold text-foreground/35 mt-2">
                  Mempengaruhi tinggi navbar, lebar sidebar, dan ukuran font.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default NavbarMenu;
