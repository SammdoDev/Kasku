/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getSession } from "@/lib/helper/session";

import { ToastProvider } from "@/components/layout/toast";
import SidebarMenu from "@/components/layout/sidebar/sidebar-menu";
import NavbarMenu from "@/components/layout/navbar/navbar-menu";

import { SIDEBAR_CONFIG } from "@/components/layout/sidebar/sidebar-menu-constant";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isAuthPage =
    pathname.startsWith("/auth/login") || pathname.startsWith("/auth/sign-up");

  // auth check
  useEffect(() => {
    const session = getSession();

    if (!session?.token && !isAuthPage) {
      router.replace("/auth/login");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, [isAuthPage, router]);

  // close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // esc close sidebar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, []);

  if (!mounted) {
    return (
      <div
        style={{ background: SIDEBAR_CONFIG.bgColor }}
        className="min-h-screen"
      />
    );
  }

  // auth pages
  if (isAuthPage) {
    return (
      <>
        {children}
        <ToastProvider />
      </>
    );
  }

  // dashboard pages
  return (
    <div
      style={{ background: SIDEBAR_CONFIG.bgColor }}
      className="flex h-screen overflow-hidden"
    >
      {/* Sidebar */}
      <SidebarMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Navbar */}
        <NavbarMenu
          onMenuToggle={() => setSidebarOpen((v) => !v)}
          isSidebarOpen={sidebarOpen}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>

      {/* Toast */}
      <ToastProvider />
    </div>
  );
}
