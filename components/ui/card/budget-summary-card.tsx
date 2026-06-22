"use client";

import formatIDR from "@/lib/helper/currency-format";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import { useTranslate } from "@/lib/i18n/use-translate";

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
  variant?: "mobile" | "desktop";
};

export const BudgetRow = ({ b }: { b: BudgetItem }) => {
  const C = useTranslate();
  const barColor = b.over_budget
    ? "var(--color-danger)"
    : b.percent_used > 80
      ? "var(--color-warning)"
      : "var(--color-success)";

  return (
    <div style={{ fontFamily: DASHBOARD_FONT }}>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
        <span className="text-[10px] font-extrabold text-foreground">
          {b.name}
        </span>
        <span
          className={`flex items-center gap-1.5 text-[9px] font-bold ${b.over_budget ? "text-destructive" : "text-foreground/60"}`}
        >
          {formatIDR(b.spent)} / {formatIDR(b.amount)}
          {b.over_budget && (
            <span className="border border-destructive bg-destructive/10 px-1 py-px text-[7px] font-black text-destructive rounded">
              OVER
            </span>
          )}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
        <div
          className="h-full transition-[width] duration-500 rounded-full"
          style={{
            width: `${Math.min(100, b.percent_used)}%`,
            background: barColor,
          }}
        />
      </div>

      <p className="mt-0.5 text-[8px] text-foreground/40">
        {b.percent_used}% {C.active.toLowerCase()} ·{" "}
        {C.totalBalance.split(" ")[0]} {formatIDR(Math.max(0, b.remaining))}
      </p>
    </div>
  );
};

const BudgetSummaryCard = ({ budgets, variant = "mobile" }: Props) => {
  const C = useTranslate();
  const overCount = budgets.filter((b) => b.over_budget).length;

  return (
    <div
      className="bg-card border-[2.5px] border-border shadow-brutal-lg p-4"
      style={{ fontFamily: DASHBOARD_FONT }}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className={`font-black uppercase tracking-tight text-foreground ${variant === "mobile" ? "text-[11px]" : "text-[10px]"}`}
        >
          {C.summary} {C.budget}
        </span>
        {overCount > 0 && (
          <span
            className={`border border-destructive bg-destructive/10 text-destructive font-black px-2 py-0.5 text-[8px] ${variant === "mobile" ? "rounded-full" : ""}`}
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
