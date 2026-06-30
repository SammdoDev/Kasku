"use client";

import Link from "next/link";
import Image from "next/image";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import { useTranslate } from "@/lib/i18n/use-translate";

export interface QuickAccessItem {
  href: string;
  label: string;
  icon: string;
  bgColor: string;
  badge?: number;
}

type Props = {
  items?: QuickAccessItem[];
  loading?: boolean;
};

const SkeletonItem = () => (
  <div className="animate-pulse flex flex-col items-center gap-2">
    <div className="w-full aspect-square lg:aspect-auto lg:h-10 border-[2px] border-border bg-foreground/10" />
    <div className="h-2.5 w-10 bg-foreground/10" />
  </div>
);

const QuickAccessGrid = ({ items, loading = false }: Props) => {
  const C = useTranslate();

  const DEFAULT_ITEMS: QuickAccessItem[] = [
    {
      href: "/dompet",
      label: C.wallet,
      icon: "/wallet.svg",
      bgColor: "#F9C74F",
    },
    { href: "/tag", label: C.tag, icon: "/tag.svg", bgColor: "#90E0EF" },
    {
      href: "/kategori",
      label: C.category,
      icon: "/hamburger.svg",
      bgColor: "#F4A261",
    },
    {
      href: "/anggaran",
      label: C.budget,
      icon: "/grafik.svg",
      bgColor: "#B7E4C7",
    },
    {
      href: "/ringkasan",
      label: C.summary,
      icon: "/summary.svg",
      bgColor: "#C77DFF",
    },
  ];

  const resolvedItems = items ?? DEFAULT_ITEMS;

  return (
    <div
      className="bg-card border-[2.5px] border-border shadow-brutal-lg px-4 py-4 lg:px-3 lg:py-3"
      style={{ fontFamily: DASHBOARD_FONT }}
    >
      <div
        className="grid gap-3 lg:gap-1.5"
        style={{
          gridTemplateColumns: `repeat(${Math.min(resolvedItems.length, 5)}, minmax(0, 1fr))`,
        }}
      >
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} />)
          : resolvedItems.map((item) => (
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
                    className="w-[88%] h-[88%] lg:w-5 lg:h-5 object-contain drop-shadow-sm select-none"
                    draggable={false}
                  />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-[5px] -right-[5px] min-w-[15px] h-[15px] px-[3px] border-[2px] border-border bg-foreground text-background text-[7px] font-black flex items-center justify-center leading-none">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] lg:text-[9px] font-bold text-foreground/70 text-center leading-[1.15] min-h-[26px]">
                  {item.label}
                </span>
              </Link>
            ))}
      </div>
    </div>
  );
};

export default QuickAccessGrid;
