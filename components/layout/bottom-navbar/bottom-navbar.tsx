"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ArrowLeftRight, PieChart, Wallet, Plus, X } from "lucide-react";
import { useState } from "react";
import { SIDEBAR_CONFIG } from "../sidebar/sidebar-menu-constant";
import ModalTambahTransaksi from "@/app/transaksi/components/modal-tambah-transaksi";
import ChildModalWrapper from "../for-pages/child-modal-wrapper";

const NAV_ITEMS = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/transaksi", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/anggaran", label: "Anggaran", icon: Wallet },
  { href: "/saya", label: "Saya", icon: PieChart },
];

const BottomNavbar = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="Navigasi bawah"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-[68px] bg-white border-t-[3px] border-black flex items-center"
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
              className="flex-1 flex flex-col items-center justify-center gap-[3px] h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-inset"
            >
              <div
                className={[
                  "flex items-center justify-center w-9 h-9 border-[2.5px] transition-all duration-100",
                  isActive
                    ? "border-black shadow-[2px_2px_0px_#000] -translate-x-[1px] -translate-y-[1px]"
                    : "border-transparent",
                ].join(" ")}
                style={
                  isActive ? { background: SIDEBAR_CONFIG.accentColor } : {}
                }
              >
                <Icon
                  size={18}
                  strokeWidth={2.5}
                  className={isActive ? "text-black" : "text-black/40"}
                />
              </div>
              <span
                className={[
                  "text-[10px] font-black uppercase tracking-tight leading-none",
                  isActive ? "text-black" : "text-black/35",
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
              "flex items-center justify-center w-14 h-14 border-[3px] border-black",
              "shadow-[3px_3px_0px_#ffde59] hover:shadow-[1px_1px_0px_#ffde59]",
              "hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black",
              open ? "bg-white" : "bg-black",
            ].join(" ")}
          >
            {open ? (
              <X size={24} strokeWidth={3} className="text-black" />
            ) : (
              <Plus size={24} strokeWidth={3} className="text-white" />
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
              className="flex-1 flex flex-col items-center justify-center gap-[3px] h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-inset"
            >
              <div
                className={[
                  "flex items-center justify-center w-9 h-9 border-[2.5px] transition-all duration-100",
                  isActive
                    ? "border-black shadow-[2px_2px_0px_#000] -translate-x-[1px] -translate-y-[1px]"
                    : "border-transparent",
                ].join(" ")}
                style={
                  isActive ? { background: SIDEBAR_CONFIG.accentColor } : {}
                }
              >
                <Icon
                  size={18}
                  strokeWidth={2.5}
                  className={isActive ? "text-black" : "text-black/40"}
                />
              </div>
              <span
                className={[
                  "text-[10px] font-black uppercase tracking-tight leading-none",
                  isActive ? "text-black" : "text-black/35",
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
