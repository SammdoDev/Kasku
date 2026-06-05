// src/components/ui/summary-card/category-spend-card.tsx
"use client";

import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import formatIDR from "@/lib/helper/currency-format";

export interface CategorySpend {
  id: string;
  name: string;
  icon: string | null; // nama icon emoji dari library, e.g. "🍔" atau lucide name
  color: string | null;
  total: number;
  percent: number;
}

type Props = {
  categories: CategorySpend[];
  monthLabel: string;
  loading?: boolean;
};

// Fallback emoji map berdasarkan nama kategori (case-insensitive partial match)
const ICON_FALLBACK_MAP: [string[], string][] = [
  [["makan", "food", "resto", "kuliner"], "🍔"],
  [["transport", "bensin", "ojek", "grab", "gojek"], "🚗"],
  [["belanja", "shop", "fashion", "pakaian"], "🛍️"],
  [["listrik", "air", "tagihan", "utility", "pulsa", "internet"], "💡"],
  [["kesehatan", "obat", "dokter", "medis"], "💊"],
  [["hiburan", "nonton", "game", "streaming"], "🎮"],
  [["pendidikan", "kursus", "buku", "sekolah"], "📚"],
  [["investasi", "tabungan", "nabung"], "💰"],
  [["rumah", "kos", "sewa", "kontrakan"], "🏠"],
  [["lainnya", "other"], "📦"],
];

function resolveIcon(icon: string | null, name: string): string {
  if (icon && icon.trim().length > 0) return icon;
  const lower = name.toLowerCase();
  for (const [keys, emoji] of ICON_FALLBACK_MAP) {
    if (keys.some((k) => lower.includes(k))) return emoji;
  }
  return "📦";
}

// Skeleton item
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
}: Props) => {
  const top5 = categories.slice(0, 5);

  return (
    <div
      className="border-[2.5px] border-[#1a1a1a] bg-white p-3.5"
      style={{ fontFamily: DASHBOARD_FONT }}
    >
      {/* Header */}
      <div className="mb-3.5 flex items-center justify-between">
        <span className="text-[10px] font-black tracking-[0.3px] text-[#1a1a1a]">
          PENGELUARAN PER KATEGORI
        </span>
        <span className="text-[8px] font-bold text-[#999]">
          {monthLabel.toUpperCase()}
        </span>
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
        ) : top5.length === 0 ? (
          <div className="py-6 text-center text-[10px] font-bold text-[#bbb] tracking-widest">
            BELUM ADA DATA
          </div>
        ) : (
          top5.map((c) => {
            const icon = resolveIcon(c.icon, c.name);
            const barColor = c.color ?? "#888";

            return (
              <div key={c.id} className="flex items-center gap-3">
                {/* Icon box */}
                <div
                  className="w-8 h-8 shrink-0 border-[2px] border-[#1a1a1a] flex items-center justify-center text-[15px] select-none shadow-[2px_2px_0px_#1a1a1a]"
                  style={{ background: `${barColor}22` }}
                  aria-hidden="true"
                >
                  {icon}
                </div>

                {/* Bar + labels */}
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

                  {/* Progress bar */}
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

      {/* Footer: total jika ada data */}
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
