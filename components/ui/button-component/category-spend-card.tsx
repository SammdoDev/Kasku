"use client";

import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import formatIDR from "@/lib/helper/currency-format";
import { OpenmojiImg } from "@/app/kategori/components/emoji-picker";

export interface CategorySpend {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  total: number;
  percent: number;
}

type Props = {
  categories: CategorySpend[];
  monthLabel: string;
  loading?: boolean;
  onEdit?: (id: string) => void;
};

function resolveHexcode(icon: string | null): string {
  if (icon && icon.trim().length > 0) return icon;
  return "1F4AC";
}

const SkeletonRow = () => (
  <div className="flex items-center gap-3 animate-pulse">
    <div className="w-8 h-8 shrink-0 bg-gray-200 border-[2px] border-[#e5e5e5]" />
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1.5">
        <div className="h-2.5 w-24 bg-gray-200 rounded-none" />
        <div className="h-2 w-16 bg-gray-100 rounded-none" />
      </div>
      <div className="h-[5px] w-full bg-gray-200 border-[1.5px] border-[#e5e5e5]" />
    </div>
  </div>
);

const CategorySpendCard = ({
  categories,
  monthLabel,
  loading = false,
  onEdit
}: Props) => {
  const top5 = categories.slice(0, 5);

  return (
    <div
      className="border-[2.5px] border-[#1a1a1a] bg-white p-3.5 shadow-brutal-lg"
      style={{ fontFamily: DASHBOARD_FONT }}
    >
      <div className="mb-3.5 flex items-center justify-between">
        <span className="text-[10px] font-black tracking-[0.3px] text-[#1a1a1a]">
          PENGELUARAN PER KATEGORI
        </span>
        <span className="text-[8px] font-bold text-[#999]">
          {monthLabel.toUpperCase()}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
        ) : top5.length === 0 ? (
          <div className="py-6 text-center text-[10px] font-bold text-[#bbb] tracking-widest">
            BELUM ADA DATA
          </div>
        ) : (
          top5.map((c) => {
            const hexcode = resolveHexcode(c.icon);
            const barColor = c.color ?? "#888";

            return (
              <div key={c.id} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 shrink-0 border-[2px] border-[#1a1a1a] flex items-center justify-center select-none shadow-[2px_2px_0px_#1a1a1a]"
                  style={{ background: `${barColor}22` }}
                  aria-hidden="true"
                >
                  <OpenmojiImg hexcode={hexcode} size={20} alt={c.name} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex items-center justify-between gap-1 flex-wrap">
                    <span className="text-[10px] font-extrabold text-[#1a1a1a] truncate max-w-[110px]">
                      {c.name}
                    </span>
                    <span className="text-[9px] text-[#666] font-bold shrink-0">
                      {formatIDR(c.total)}
                      <span className="ml-1 text-[#aaa]">· {c.percent}%</span>
                    </span>
                  </div>

                  <div className="h-[5px] overflow-hidden border-[1.5px] border-[#1a1a1a] bg-gray-100">
                    <div
                      className="h-full transition-[width] duration-500"
                      style={{ width: `${c.percent}%`, background: barColor }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!loading && top5.length > 0 && (
        <div className="mt-3.5 pt-2.5 border-t-[1.5px] border-dashed border-[#e5e5e5] flex items-center justify-between">
          <span className="text-[8px] font-black text-[#aaa] tracking-widest">
            TOTAL {top5.length} KATEGORI TERATAS
          </span>
          <span className="text-[10px] font-black text-[#1a1a1a]">
            {formatIDR(top5.reduce((s, c) => s + c.total, 0))}
          </span>
        </div>
      )}
    </div>
  );
};

export default CategorySpendCard;
