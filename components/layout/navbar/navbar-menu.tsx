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
import { useTranslate } from "@/lib/i18n/use-translate";

type NavbarProps = {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
};

function getPageLabel(
  pathname: string,
  C: ReturnType<typeof useTranslate>,
): string {
  const ROUTE_LABELS: Record<string, string> = {
    "/": C.dashboard,
    "/transaksi": C.transaction,
    "/kategori": C.category,
    "/tag-transaksi": C.tag,
    "/metode-pembayaran": C.wallet,
    "/anggaran": C.budget,
    "/ringkasan": C.summary,
    "/profil": C.profile,
  };

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
  const CONSTANT = useTranslate();

  const scale = SIZE_SCALES[config.size];
  const iconSize = parseInt(scale.iconSize);
  const fontSize = scale.baseFontSize;
  const navFontSize = scale.navFontSize;

  useEffect(() => {
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

  const pageLabel = getPageLabel(pathname, CONSTANT);
  const initials = user ? getInitials(user.full_name) : "??";
  const showBadge =
    NAVBAR_CONFIG.showNotificationDot && NAVBAR_CONFIG.notificationCount > 0;
  const sizes = Object.entries(SIZE_SCALES) as [
    SizeScale,
    (typeof SIZE_SCALES)[SizeScale],
  ][];

  const toggleDrawer = (type: DrawerType) =>
    setDrawer((prev) => (prev === type ? null : type));

  // Button size scales with icon
  const btnSize = iconSize + 20; // icon + padding

  return (
    <>
      <header
        style={{
          backgroundColor: "var(--navbar-bg)",
          height: "var(--navbar-h)",
        }}
        className="sticky top-0 z-30 flex items-center gap-3 px-4 md:px-5 border-b-[3px] border-border shrink-0 box-content"
      >
        {/* Hamburger */}
        <button
          onClick={onMenuToggle}
          aria-label={isSidebarOpen ? CONSTANT.closeMenu : CONSTANT.openMenu}
          aria-expanded={isSidebarOpen}
          className={[
            "hidden md:flex lg:hidden items-center justify-center border-[3px] border-border font-black text-foreground",
            "transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground",
            isSidebarOpen
              ? "shadow-none translate-x-[2px] translate-y-[2px]"
              : "bg-card shadow-brutal hover:shadow-[1px_1px_0px_hsl(var(--border))] hover:translate-x-[2px] hover:translate-y-[2px]",
          ].join(" ")}
          style={{
            width: btnSize,
            height: btnSize,
            ...(isSidebarOpen ? { background: "var(--accent-bg)" } : {}),
          }}
        >
          {isSidebarOpen ? (
            <X
              size={iconSize - 3}
              strokeWidth={3}
              style={{ color: "var(--accent-fg)" }}
            />
          ) : (
            <Menu size={iconSize - 3} strokeWidth={3} />
          )}
        </button>

        {/* Page title */}
        <div className="flex-1 min-w-0">
          <h1
            className="font-black uppercase tracking-tight text-foreground leading-none truncate"
            style={{ fontSize: `calc(${navFontSize} + 3px)` }}
          >
            {pageLabel}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Bell */}
          <button
            aria-label={`${CONSTANT.notification}${showBadge ? `, ${NAVBAR_CONFIG.notificationCount} baru` : ""}`}
            style={{ width: btnSize, height: btnSize }}
            className="relative flex items-center justify-center border-[3px] border-border bg-card text-foreground shadow-brutal hover:shadow-[1px_1px_0px_hsl(var(--border))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
          >
            <Bell size={iconSize - 2} strokeWidth={2.5} />
            {showBadge && (
              <span
                style={{
                  background: "var(--accent-bg)",
                  color: "var(--accent-fg)",
                  fontSize: `calc(${fontSize} - 4px)`,
                }}
                className="absolute -top-[6px] -right-[6px] min-w-[16px] h-[16px] px-[3px] border-[2px] border-border font-black flex items-center justify-center leading-none"
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
            aria-label={CONSTANT.appearance}
            style={{
              width: btnSize,
              height: btnSize,
              ...(drawer === "theme"
                ? { background: "var(--accent-bg)", color: "var(--accent-fg)" }
                : {}),
            }}
            className={[
              "flex items-center justify-center border-[3px] border-border font-black",
              "transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground",
              drawer === "theme"
                ? "shadow-none translate-x-[2px] translate-y-[2px]"
                : "bg-card shadow-brutal hover:shadow-[1px_1px_0px_hsl(var(--border))] hover:translate-x-[2px] hover:translate-y-[2px]",
            ].join(" ")}
          >
            <Palette size={iconSize - 2} strokeWidth={2.5} />
          </button>

          {/* User chip */}
          <button
            onClick={() => toggleDrawer("profile")}
            aria-label={CONSTANT.openProfile}
            style={
              drawer === "profile" ? { background: "var(--accent-bg)" } : {}
            }
            className={[
              "flex items-center gap-2 px-2 py-1 border-[3px] border-border bg-card shadow-brutal",
              "hover:shadow-[1px_1px_0px_hsl(var(--border))] hover:translate-x-[2px] hover:translate-y-[2px]",
              "transition-all duration-100 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground",
              drawer === "profile"
                ? "shadow-none translate-x-[2px] translate-y-[2px]"
                : "",
            ].join(" ")}
          >
            <div
              style={{
                background:
                  drawer === "profile"
                    ? "var(--accent-fg)"
                    : "var(--accent-bg)",
                width: iconSize + 8,
                height: iconSize + 8,
              }}
              className="border-[2px] border-border flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <span
                style={{
                  color:
                    drawer === "profile"
                      ? "var(--accent-bg)"
                      : "var(--accent-fg)",
                  fontSize: `calc(${fontSize} - 4px)`,
                }}
                className="font-black"
              >
                {initials}
              </span>
            </div>
            <span
              className="hidden sm:block font-black max-w-[100px] truncate"
              style={{
                fontSize: navFontSize,
                color: drawer === "profile" ? "var(--accent-fg)" : undefined,
              }}
            >
              {user?.full_name ?? "—"}
            </span>
          </button>
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
                className="font-black uppercase tracking-widest"
                style={{ fontSize, color: "var(--accent-fg)" }}
              >
                {CONSTANT.profile}
              </span>
              <button
                onClick={() => setDrawer(null)}
                className="p-1 border-[2px] border-border flex items-center justify-center"
                style={{
                  background: "var(--accent-fg)",
                  color: "var(--accent-bg)",
                }}
                aria-label={CONSTANT.close}
              >
                <X size={iconSize - 4} strokeWidth={3} />
              </button>
            </div>

            <div className="px-4 py-5 border-b-[3px] border-border shrink-0">
              <div className="flex items-center gap-3">
                <div
                  style={{ background: "var(--accent-bg)" }}
                  className="w-12 h-12 border-[3px] border-border flex items-center justify-center shrink-0"
                >
                  <span
                    style={{ color: "var(--accent-fg)", fontSize }}
                    className="font-black"
                  >
                    {initials}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-black text-foreground truncate leading-tight"
                    style={{ fontSize: `calc(${fontSize} + 1px)` }}
                  >
                    {user?.full_name ?? "—"}
                  </p>
                  <p
                    className="text-foreground/45 font-semibold truncate mt-0.5"
                    style={{ fontSize: `calc(${fontSize} - 2px)` }}
                  >
                    @{user?.username ?? "—"}
                  </p>
                </div>
              </div>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-[3px]">
              {[
                { href: "/profil", label: CONSTANT.viewProfile, icon: User },
                {
                  href: "/profil/pengaturan",
                  label: CONSTANT.settings,
                  icon: Settings,
                },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-[10px] font-bold text-foreground/70 border-[2px] border-transparent hover:border-border hover:bg-card hover:shadow-[2px_2px_0px_hsl(var(--border))] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100"
                  style={{ fontSize }}
                >
                  <Icon
                    size={iconSize - 2}
                    strokeWidth={2.5}
                    className="shrink-0"
                  />
                  <span className="flex-1">{label}</span>
                  <ChevronRight
                    size={iconSize - 4}
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
                className="w-full flex items-center gap-3 px-3 py-[10px] font-bold border-[2px] border-transparent text-foreground/55 hover:border-border hover:bg-card hover:shadow-[2px_2px_0px_hsl(var(--border))] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100"
                style={{ fontSize }}
              >
                <LogOut
                  size={iconSize - 2}
                  strokeWidth={2.5}
                  className="shrink-0"
                />
                <span>{CONSTANT.logout}</span>
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
                className="font-black uppercase tracking-widest"
                style={{ fontSize, color: "var(--accent-fg)" }}
              >
                {CONSTANT.appearance}
              </span>
              <button
                onClick={() => setDrawer(null)}
                className="p-1 border-[2px] border-border flex items-center justify-center"
                style={{
                  background: "var(--accent-fg)",
                  color: "var(--accent-bg)",
                }}
                aria-label={CONSTANT.close}
              >
                <X size={iconSize - 4} strokeWidth={3} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
              {/* Warna Aksen */}
              <div>
                <p
                  className="font-black uppercase tracking-[0.18em] text-foreground/40 mb-3"
                  style={{ fontSize: `calc(${fontSize} - 3px)` }}
                >
                  {CONSTANT.accentColor}
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
                        <span
                          className="font-black text-foreground/60 uppercase tracking-wide"
                          style={{ fontSize: `calc(${fontSize} - 4px)` }}
                        >
                          {color.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ukuran */}
              <div>
                <p
                  className="font-black uppercase tracking-[0.18em] text-foreground/40 mb-3"
                  style={{ fontSize: `calc(${fontSize} - 3px)` }}
                >
                  {CONSTANT.size}
                </p>
                <div className="flex gap-2">
                  {sizes.map(([key, s]) => {
                    const isActive = config.size === key;
                    return (
                      <button
                        key={key}
                        onClick={() => update({ size: key })}
                        className={[
                          "flex-1 py-2 font-black border-[2px] transition-all duration-100",
                          isActive
                            ? "border-border shadow-brutal -translate-x-0.5 -translate-y-0.5"
                            : "border-border/40 text-foreground/50 hover:border-border hover:text-foreground",
                        ].join(" ")}
                        style={{
                          fontSize: `calc(${fontSize} - 2px)`,
                          ...(isActive
                            ? {
                                background: "var(--accent-bg)",
                                color: "var(--accent-fg)",
                              }
                            : {}),
                        }}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
                <p
                  className="font-bold text-foreground/35 mt-2"
                  style={{ fontSize: `calc(${fontSize} - 3px)` }}
                >
                  {CONSTANT.sizeDescription}
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
