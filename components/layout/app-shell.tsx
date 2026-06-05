// src/components/layout/app-shell.tsx (atau sesuai path project)
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSession, clearSession } from "@/lib/helper/session";
import SidebarMenu from "@/components/layout/sidebar/sidebar-menu";
import NavbarMenu from "@/components/layout/navbar/navbar-menu";
import { SIDEBAR_CONFIG } from "@/components/layout/sidebar/sidebar-menu-constant";
import { ToastProvider } from "./for-pages/toast";
import { ConfirmDialogProvider } from "./for-pages/confirm-dialog";
import BottomNavbar from "./bottom-navbar/bottom-navbar";

const PUBLIC_PATHS = ["/auth/login", "/auth/sign-up", "/auth/callback"];

function isTokenExpired(token: string): boolean {
  try {
    const [, b64] = token.split(".");
    const payload = JSON.parse(atob(b64.replace(/-/g, "+").replace(/_/g, "/")));
    return payload.exp ? Date.now() / 1000 > payload.exp : false;
  } catch {
    return true;
  }
}

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isPublicPage = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (isPublicPage) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
      return;
    }
    const session = getSession();
    if (!session?.token || isTokenExpired(session.token)) {
      clearSession();
      router.replace("/auth/login");
      return;
    }
    setMounted(true);
  }, [isPublicPage, router]);

  // Cek expiry setiap 60 detik
  useEffect(() => {
    if (isPublicPage) return;
    const interval = setInterval(() => {
      const session = getSession();
      if (!session?.token || isTokenExpired(session.token)) {
        clearSession();
        router.replace("/auth/login");
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [isPublicPage, router]);

  // Tutup sidebar saat navigasi
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSidebarOpen(false);
  }, [pathname]);

  // Tutup sidebar dengan Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{ background: SIDEBAR_CONFIG.bgColor }}
        className="min-h-screen"
      />
    );
  }

  if (isPublicPage) {
    return (
      <>
        {children}
        <ToastProvider />
        <ConfirmDialogProvider />
      </>
    );
  }

  return (
    <div
      style={{ background: SIDEBAR_CONFIG.bgColor }}
      className="flex h-screen overflow-hidden"
    >
      <SidebarMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <NavbarMenu
          onMenuToggle={() => setSidebarOpen((v) => !v)}
          isSidebarOpen={sidebarOpen}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-[84px] lg:pb-6">
          {" "}
          <div className="h-full">{children}</div>
        </main>
      </div>
      <BottomNavbar />
      <ToastProvider />
      <ConfirmDialogProvider />
    </div>
  );
};

export default AppShell;
