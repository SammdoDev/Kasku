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
    href: "/transaksi",
    label: "Buku Besar",
    icon: "/best-seller.svg",
    bgColor: "#F9C74F",
  },
  {
    href: "/transaksi?filter=berulang",
    label: "Berulang",
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
    href: "/summary",
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
    {/* mobile: aspect-square, desktop: fixed compact size */}
    <div className="w-full aspect-square lg:aspect-auto lg:h-10 rounded-2xl lg:rounded-xl border-[2px] border-[#e5e5e5] bg-gray-100" />
    <div className="h-2.5 w-10 bg-gray-200 rounded" />
  </div>
);

const QuickAccessGrid = ({ items = DEFAULT_ITEMS, loading = false }: Props) => {
  return (
    <div
      className="bg-white rounded-2xl border-[2.5px] border-black shadow-[3px_3px_0px_#000] px-4 py-4 lg:px-3 lg:py-3"
      style={{ fontFamily: DASHBOARD_FONT }}
    >
      <div
        className="grid gap-2 lg:gap-1.5"
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
                className="flex flex-col items-center gap-1.5 lg:gap-1 group focus-visible:outline-none"
              >
                {/* Icon box — full square on mobile, compact on desktop */}
                <div
                  className={[
                    // mobile: big square
                    "relative w-full aspect-square",
                    // desktop: fixed compact height, not square
                    "lg:aspect-auto lg:h-10",
                    "rounded-2xl lg:rounded-lg",
                    "border-[2.5px] lg:border-2 border-black overflow-hidden",
                    "flex items-center justify-center",
                    "shadow-[2px_2px_0px_#000] lg:shadow-[1.5px_1.5px_0px_#000]",
                    "group-hover:shadow-[1px_1px_0px_#000]",
                    "group-hover:translate-x-[1px] group-hover:translate-y-[1px]",
                    "group-active:shadow-none",
                    "group-active:translate-x-[2px] group-active:translate-y-[2px]",
                    "transition-all duration-100",
                  ].join(" ")}
                  style={{ background: item.bgColor }}
                >
                  <Image
                    src={item.icon}
                    alt=""
                    width={48}
                    height={48}
                    className="w-[58%] h-[58%] lg:w-5 lg:h-5 object-contain rotate-12 drop-shadow-sm select-none"
                    draggable={false}
                  />

                  {/* Badge */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-[5px] -right-[5px] min-w-[15px] h-[15px] px-[3px] border-[2px] border-black bg-black text-white text-[7px] font-black flex items-center justify-center leading-none rounded-sm">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>

                {/* Label — bigger on mobile, smaller on desktop */}
                <span className="text-xs lg:text-[9px] font-bold text-black/70 text-center leading-tight">
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
