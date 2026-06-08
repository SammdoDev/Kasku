"use client";

import Link from "next/link";
import Image from "next/image";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";

export interface QuickAccessItem {
  href: string;
  label: string;
  icon: string;
  bgColor: string;
  badge?: number;
}

const DEFAULT_ITEMS: QuickAccessItem[] = [
  {
    href: "/metode-pembayaran",
    label: "Metode Pembayaran",
    icon: "/best-seller.svg",
    bgColor: "#F9C74F",
  },
  {
    href: "/tag-transaksi",
    label: "Tag Transaksi",
    icon: "/calendar.svg",
    bgColor: "#90E0EF",
  },
  {
    href: "/kategori",
    label: "Kategori",
    icon: "/hamburger.svg",
    bgColor: "#F4A261",
  },
  {
    href: "/anggaran",
    label: "Anggaran",
    icon: "/cash-flow.svg",
    bgColor: "#B7E4C7",
  },
  {
    href: "/ringkasan",
    label: "Ringkasan",
    icon: "/bar-graph.svg",
    bgColor: "#C77DFF",
  },
];

type Props = {
  items?: QuickAccessItem[];
  loading?: boolean;
};

const SkeletonItem = () => (
  <div className="animate-pulse flex flex-col items-center gap-2">
    <div className="w-full aspect-square lg:aspect-auto lg:h-10 border-[2px] border-[#e5e5e5] bg-gray-100" />
    <div className="h-2.5 w-10 bg-gray-200" />
  </div>
);

const QuickAccessGrid = ({ items = DEFAULT_ITEMS, loading = false }: Props) => {
  return (
    <div
      className="bg-white border-[2.5px] border-black shadow-brutal-lg px-4 py-4 lg:px-3 lg:py-3"
      style={{ fontFamily: DASHBOARD_FONT }}
    >
      <div
        className="grid gap-3 lg:gap-1.5"
        style={{
          gridTemplateColumns: `repeat(${Math.min(items.length, 5)}, minmax(0, 1fr))`,
        }}
      >
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} />)
          : items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-2 lg:gap-1 group focus-visible:outline-none"
              >
                <div className="box" style={{ background: item.bgColor }}>
                  <Image
                    src={item.icon}
                    alt=""
                    width={48}
                    height={48}
                    className="w-[88%] h-[88%] lg:w-5 lg:h-5 object-contain rotate-350 relative left-2 top-2 drop-shadow-sm select-none"
                    draggable={false}
                  />

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-[5px] -right-[5px] min-w-[15px] h-[15px] px-[3px] border-[2px] border-black bg-black text-white text-[7px] font-black flex items-center justify-center leading-none">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>

                <span className="text-[11px] lg:text-[9px] font-bold text-black/70 text-center leading-[1.15] min-h-[26px]">
                  {item.label}
                </span>
              </Link>
            ))}
      </div>
    </div>
  );
};

export default QuickAccessGrid;
export { DEFAULT_ITEMS };
