"use client";

import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import { SIDEBAR_CONFIG } from "@/components/layout/sidebar/sidebar-menu-constant";
import formatIDR from "@/lib/helper/currency-format";
import MonthFilter from "@/components/ui/input-component/month-filter/month-filter";
import { TrendingUp, TrendingDown } from "lucide-react";

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
  const net = income - expense;
  const expPct =
    income > 0 ? Math.min(100, Math.round((expense / income) * 100)) : null;

  return (
    <div
      className="border-[2.5px] border-[#1a1a1a] bg-card p-4"
      style={{ fontFamily: DASHBOARD_FONT }}
    >
      {/* Top row: bulan + filter */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <p className="text-[9px] font-black tracking-[0.25em] text-[#999] uppercase">
            Ringkasan
          </p>
          <p className="text-[11px] font-black text-[#1a1a1a] uppercase tracking-tight leading-tight">
            {monthLabel}
          </p>
        </div>
        <MonthFilter size="sm" />
      </div>

      {/* Divider */}
      <div className="border-t-[1.5px] border-dashed border-[#e5e5e5] mb-3" />

      {/* Income / Expense row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Pemasukan */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <div
              className="w-5 h-5 border-[2px] border-[#1a1a1a] flex items-center justify-center shrink-0"
              style={{ background: "#bbf7d0" }}
            >
              <TrendingUp
                size={10}
                strokeWidth={3}
                className="text-[#166534]"
              />
            </div>
            <span className="text-[9px] font-black tracking-widest text-[#999] uppercase">
              Pemasukan
            </span>
          </div>
          {loading ? (
            <div className="h-6 w-24 bg-gray-100 animate-pulse" />
          ) : (
            <span className="text-[17px] font-black text-[#1a1a1a] leading-none tracking-tight">
              {formatIDR(income)}
            </span>
          )}
        </div>

        {/* Pengeluaran */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <div
              className="w-5 h-5 border-[2px] border-[#1a1a1a] flex items-center justify-center shrink-0"
              style={{ background: "#fca5a5" }}
            >
              <TrendingDown
                size={10}
                strokeWidth={3}
                className="text-[#991b1b]"
              />
            </div>
            <span className="text-[9px] font-black tracking-widest text-[#999] uppercase">
              Pengeluaran
            </span>
          </div>
          {loading ? (
            <div className="h-6 w-24 bg-gray-100 animate-pulse" />
          ) : (
            <span className="text-[17px] font-black text-[#1a1a1a] leading-none tracking-tight">
              {formatIDR(expense)}
            </span>
          )}
        </div>
      </div>

      {/* Net + progress bar */}
      {!loading && (
        <>
          <div className="border-t-[1.5px] border-dashed border-[#e5e5e5] mt-3 mb-2.5" />
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-black text-[#999] tracking-widest uppercase">
              Selisih
            </span>
            <span
              className={[
                "text-[11px] font-black tracking-tight",
                net > 0
                  ? "text-[#166534]"
                  : net < 0
                    ? "text-[#991b1b]"
                    : "text-[#555]",
              ].join(" ")}
            >
              {net >= 0 ? "+" : ""}
              {formatIDR(net)}
            </span>
          </div>

          {/* Expense ratio bar */}
          {expPct !== null && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-[5px] border-[1.5px] border-[#1a1a1a] bg-gray-100 overflow-hidden">
                <div
                  className="h-full transition-[width] duration-500"
                  style={{
                    width: `${expPct}%`,
                    background:
                      expPct > 90
                        ? "#ef4444"
                        : expPct > 70
                          ? "#f97316"
                          : SIDEBAR_CONFIG.accentColor,
                  }}
                />
              </div>
              <span className="text-[8px] font-black text-[#aaa] shrink-0 w-[32px] text-right">
                {expPct}%
              </span>
            </div>
          )}
          {expPct !== null && (
            <p className="text-[8px] text-[#bbb] mt-1 font-bold">
              {expPct}% dari pemasukan terpakai
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardSummaryBar;
