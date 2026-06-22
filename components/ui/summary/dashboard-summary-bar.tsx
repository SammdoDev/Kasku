"use client";

import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import formatIDR from "@/lib/helper/currency-format";
import MonthFilter from "@/components/ui/input-component/month-filter/month-filter";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useTranslate } from "@/lib/i18n/use-translate";

type Props = {
  income: number;
  expense: number;
  monthLabel: string;
  loading?: boolean;
};

const DashboardSummaryBar = ({
  income,
  expense,
  monthLabel,
  loading = false,
}: Props) => {
  const C = useTranslate();
  const net = income - expense;
  const expPct =
    income > 0 ? Math.min(100, Math.round((expense / income) * 100)) : null;

  return (
    <div
      className="border-[2.5px] border-border bg-card p-4"
      style={{ fontFamily: DASHBOARD_FONT }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <p className="text-[9px] font-black tracking-[0.25em] text-foreground/40 uppercase">
            {C.summary}
          </p>
          <p className="text-[11px] font-black text-foreground uppercase tracking-tight leading-tight">
            {monthLabel}
          </p>
        </div>
        <MonthFilter size="sm" />
      </div>

      <div className="border-t-[1.5px] border-dashed border-border/30 mb-3" />

      {/* Income / Expense */}
      <div className="grid grid-cols-2 gap-3">
        {/* Pemasukan */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <div
              className="w-5 h-5 border-[2px] border-border flex items-center justify-center shrink-0"
              style={{ background: "#bbf7d0" }}
            >
              <TrendingUp size={10} strokeWidth={3} style={{ color: "var(--color-success)" }} />
            </div>
            <span className="text-[9px] font-black tracking-widest text-foreground/40 uppercase">
              {C.income}
            </span>
          </div>
          {loading ? (
            <div className="h-6 w-24 bg-foreground/10 animate-pulse" />
          ) : (
            <span className="text-[17px] font-black text-foreground leading-none tracking-tight">
              {formatIDR(income)}
            </span>
          )}
        </div>

        {/* Pengeluaran */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <div
              className="w-5 h-5 border-[2px] border-border flex items-center justify-center shrink-0"
              style={{ background: "#fca5a5" }}
            >
              <TrendingDown size={10} strokeWidth={3} style={{ color: "var(--color-danger)" }} />
            </div>
            <span className="text-[9px] font-black tracking-widest text-foreground/40 uppercase">
              {C.expense}
            </span>
          </div>
          {loading ? (
            <div className="h-6 w-24 bg-foreground/10 animate-pulse" />
          ) : (
            <span className="text-[17px] font-black text-foreground leading-none tracking-tight">
              {formatIDR(expense)}
            </span>
          )}
        </div>
      </div>

      {/* Net + progress bar */}
      {!loading && (
        <>
          <div className="border-t-[1.5px] border-dashed border-border/30 mt-3 mb-2.5" />
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-black text-foreground/40 tracking-widest uppercase">
              {C.net}
            </span>
            <span
              className="text-[11px] font-black tracking-tight"
              style={{
                color:
                  net > 0
                    ? "var(--color-success)"
                    : net < 0
                      ? "var(--color-danger)"
                      : "var(--color-muted-foreground)",
              }}
            >
              {net >= 0 ? "+" : ""}
              {formatIDR(net)}
            </span>
          </div>

          {expPct !== null && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-[5px] border-[1.5px] border-border bg-foreground/5 overflow-hidden">
                <div
                  className="h-full transition-[width] duration-500"
                  style={{
                    width: `${expPct}%`,
                    background:
                      expPct > 90
                        ? "var(--color-danger)"
                        : expPct > 70
                          ? "var(--color-warning)"
                          : "var(--accent-bg)",
                  }}
                />
              </div>
              <span className="text-[8px] font-black text-foreground/30 shrink-0 w-[32px] text-right">
                {expPct}%
              </span>
            </div>
          )}
          {expPct !== null && (
            <p className="text-[8px] text-foreground/25 mt-1 font-bold">
              {expPct}% {C.thisMonth} terpakai
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardSummaryBar;