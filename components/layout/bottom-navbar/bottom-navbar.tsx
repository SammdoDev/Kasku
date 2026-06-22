"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ArrowLeftRight, PieChart, Wallet, Plus, X } from "lucide-react";
import { useState } from "react";
import ModalTambahTransaksi from "@/app/transaksi/components/modal-tambah-transaksi";
import ChildModalWrapper from "../for-pages/child-modal-wrapper";
import { useTranslate } from "@/lib/i18n/use-translate";

const BottomNavbar = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const C = useTranslate();

  const NAV_ITEMS = [
    { href: "/", label: C.dashboard, icon: Home },
    { href: "/transaksi", label: C.transaction, icon: ArrowLeftRight },
    { href: "/anggaran", label: C.budget, icon: Wallet },
    { href: "/saya", label: C.profile, icon: PieChart },
  ];

  return (
    <>
      <nav
        aria-label="Navigasi bawah"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-[68px] bg-card border-t-[3px] border-border flex items-center"
      >
        {NAV_ITEMS.slice(0, 2).map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className="flex-1 flex flex-col items-center justify-center gap-[3px] h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-inset"
            >
              <div
                className={[
                  "flex items-center justify-center w-9 h-9 border-[2.5px] transition-all duration-100",
                  isActive
                    ? "border-border shadow-[2px_2px_0px_hsl(var(--border))] -translate-x-[1px] -translate-y-[1px]"
                    : "border-transparent",
                ].join(" ")}
                style={isActive ? { background: "var(--accent-bg)" } : {}}
              >
                <Icon
                  size={18}
                  strokeWidth={2.5}
                  style={isActive ? { color: "var(--accent-fg)" } : undefined}
                  className={isActive ? "" : "text-foreground/40"}
                />
              </div>
              <span
                className={[
                  "text-[10px] font-black uppercase tracking-tight leading-none",
                  isActive ? "text-foreground" : "text-foreground/35",
                ].join(" ")}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* FAB Tengah */}
        <div className="flex flex-col items-center justify-center px-2 -mt-5">
          <button
            onClick={() => setOpen(true)}
            aria-label="Tambah transaksi baru"
            className={[
              "flex items-center justify-center w-14 h-14 border-[3px] border-border",
              "hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground",
              open ? "bg-card" : "bg-foreground",
            ].join(" ")}
            style={{
              boxShadow: open ? "none" : "3px 3px 0px var(--accent-bg)",
            }}
          >
            {open ? (
              <X size={24} strokeWidth={3} className="text-foreground" />
            ) : (
              <Plus size={24} strokeWidth={3} className="text-background" />
            )}
          </button>
        </div>

        {NAV_ITEMS.slice(2).map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className="flex-1 flex flex-col items-center justify-center gap-[3px] h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-inset"
            >
              <div
                className={[
                  "flex items-center justify-center w-9 h-9 border-[2.5px] transition-all duration-100",
                  isActive
                    ? "border-border shadow-[2px_2px_0px_hsl(var(--border))] -translate-x-[1px] -translate-y-[1px]"
                    : "border-transparent",
                ].join(" ")}
                style={isActive ? { background: "var(--accent-bg)" } : {}}
              >
                <Icon
                  size={18}
                  strokeWidth={2.5}
                  style={isActive ? { color: "var(--accent-fg)" } : undefined}
                  className={isActive ? "" : "text-foreground/40"}
                />
              </div>
              <span
                className={[
                  "text-[10px] font-black uppercase tracking-tight leading-none",
                  isActive ? "text-foreground" : "text-foreground/35",
                ].join(" ")}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <ChildModalWrapper
        open={open}
        onClose={() => setOpen(false)}
        title="TAMBAH TRANSAKSI"
        subtitle="Catat pemasukan atau pengeluaran baru"
        width="full"
      >
        <ModalTambahTransaksi
          onSuccess={() => {
            setOpen(false);
            window.dispatchEvent(new CustomEvent("transaksi:added"));
          }}
          onClose={() => setOpen(false)}
        />
      </ChildModalWrapper>
    </>
  );
};

export default BottomNavbar;
