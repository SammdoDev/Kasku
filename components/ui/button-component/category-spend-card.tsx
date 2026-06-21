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
    <div className="w-8 h-8 shrink-0 bg-foreground/10 border-[2px] border-border" />
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1.5">
        <div className="h-2.5 w-24 bg-foreground/10" />
        <div className="h-2 w-16 bg-foreground/[0.07]" />
      </div>
      <div className="h-[5px] w-full bg-foreground/10 border-[1.5px] border-border" />
    </div>
  </div>
);

const CategorySpendCard = ({
  categories,
  monthLabel,
  loading = false,
  onEdit,
}: Props) => {
  const top5 = categories.slice(0, 5);

  return (
    <div
      className="border-[2.5px] border-border bg-card p-3.5 shadow-brutal-lg"
      style={{ fontFamily: DASHBOARD_FONT }}
    >
      <div className="mb-3.5 flex items-center justify-between">
        <span className="text-[10px] font-black tracking-[0.3px] text-foreground">
          PENGELUARAN PER KATEGORI
        </span>
        <span className="text-[8px] font-bold text-foreground/40">
          {monthLabel.toUpperCase()}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
        ) : top5.length === 0 ? (
          <div className="py-6 text-center text-[10px] font-bold text-foreground/30 tracking-widest">
            BELUM ADA DATA
          </div>
        ) : (
          top5.map((c) => {
            const hexcode = resolveHexcode(c.icon);
            const barColor = c.color ?? "#888";

            return (
              <div key={c.id} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 shrink-0 border-[2px] border-border flex items-center justify-center select-none shadow-[2px_2px_0px_hsl(var(--border))]"
                  style={{ background: `${barColor}22` }}
                  aria-hidden="true"
                >
                  <OpenmojiImg hexcode={hexcode} size={20} alt={c.name} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex items-center justify-between gap-1 flex-wrap">
                    <span className="text-[10px] font-extrabold text-foreground truncate max-w-[110px]">
                      {c.name}
                    </span>
                    <span className="text-[9px] text-foreground/60 font-bold shrink-0">
                      {formatIDR(c.total)}
                      <span className="ml-1 text-foreground/30">
                        · {c.percent}%
                      </span>
                    </span>
                  </div>

                  <div className="h-[5px] overflow-hidden border-[1.5px] border-border bg-foreground/[0.06]">
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
        <div className="mt-3.5 pt-2.5 border-t-[1.5px] border-dashed border-border/50 flex items-center justify-between">
          <span className="text-[8px] font-black text-foreground/30 tracking-widest">
            TOTAL {top5.length} KATEGORI TERATAS
          </span>
          <span className="text-[10px] font-black text-foreground">
            {formatIDR(top5.reduce((s, c) => s + c.total, 0))}
          </span>
        </div>
      )}
    </div>
  );
};

export default CategorySpendCard;
