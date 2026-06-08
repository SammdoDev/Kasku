"use client";

import formatIDR from "@/lib/helper/currency-format";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";

export interface BudgetItem {
  id: string;
  name: string;
  amount: number;
  spent: number;
  remaining: number;
  percent_used: number;
  over_budget: boolean;
}

type Props = {
  budgets: BudgetItem[];
  /** Mobile uses + slightly bigger shadow, desktop uses sharp corners */
  variant?: "mobile" | "desktop";
};

/* ── Single budget row ───────────────────────────────────────────── */
export const BudgetRow = ({ b }: { b: BudgetItem }) => {
  const barColor = b.over_budget
    ? "#ef4444"
    : b.percent_used > 80
      ? "#f97316"
      : "#22c55e";

  return (
    <div style={{ fontFamily: DASHBOARD_FONT }}>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
        <span className="text-[10px] font-extrabold text-[#1a1a1a]">
          {b.name}
        </span>
        <span
          className={`flex items-center gap-1.5 text-[9px] font-bold ${b.over_budget ? "text-red-500" : "text-[#555]"}`}
        >
          {formatIDR(b.spent)} / {formatIDR(b.amount)}
          {b.over_budget && (
            <span className="border border-red-400 bg-red-100 px-1 py-px text-[7px] font-black text-red-500 rounded">
              OVER
            </span>
          )}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full transition-[width] duration-500 rounded-full"
          style={{
            width: `${Math.min(100, b.percent_used)}%`,
            background: barColor,
          }}
        />
      </div>

      <p className="mt-0.5 text-[8px] text-[#aaa]">
        {b.percent_used}% terpakai · Sisa {formatIDR(Math.max(0, b.remaining))}
      </p>
    </div>
  );
};

const BudgetSummaryCard = ({ budgets, variant = "mobile" }: Props) => {
  const overCount = budgets.filter((b) => b.over_budget).length;

  const cardClass =
    variant === "mobile"
      ? "bg-white border-[2.5px] border-black shadow-brutal-lg p-4"
      : "border-[2.5px] border-black bg-white p-4 shadow-brutal-lg";

  return (
    <div className={cardClass} style={{ fontFamily: DASHBOARD_FONT }}>
      <div className="flex items-center justify-between mb-3">
        <span
          className={`font-black uppercase tracking-tight ${variant === "mobile" ? "text-[11px]" : "text-[10px]"}`}
        >
          Ringkasan Anggaran
        </span>
        {overCount > 0 && (
          <span
            className={`border border-red-400 bg-red-100 text-red-500 font-black px-2 py-0.5 text-[8px] ${variant === "mobile" ? "rounded-full" : ""}`}
          >
            {overCount} OVER
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {budgets.map((b) => (
          <BudgetRow key={b.id} b={b} />
        ))}
      </div>
    </div>
  );
};

export default BudgetSummaryCard;
