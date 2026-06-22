"use client";

import {
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import formatIDR from "@/lib/helper/currency-format";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import MonthFilter from "../input-component/month-filter/month-filter";
import { useTranslate } from "@/lib/i18n/use-translate";

interface SummaryData {
  balance: number;
  total_income: number;
  total_expense: number;
  net: number;
}

type Props = {
  monthLabel: string;
  summary?: SummaryData | null;
  loading?: boolean;
  onPrev: () => void;
  onNext: () => void;
};

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`rounded-lg bg-foreground/10 animate-pulse ${className}`} />
);

export const SummaryHeaderMobile = ({
  monthLabel,
  summary,
  loading,
}: Props) => {
  const C = useTranslate();
  const month = monthLabel.split(" ")[0];

  return (
    <div style={{ fontFamily: DASHBOARD_FONT }}>
      <div className="flex items-center gap-2 mb-4 justify-end">
        <MonthFilter size="sm" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown
              size={11}
              strokeWidth={2.5}
              style={{ color: "var(--color-danger)" }}
            />
            <span className="text-[10px] font-bold text-foreground/50">
              {month} · {C.expense}
            </span>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <p className="text-[22px] font-black text-foreground leading-none tracking-tight">
              {formatIDR(summary?.total_expense ?? 0)}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp
              size={11}
              strokeWidth={2.5}
              style={{ color: "var(--color-success)" }}
            />
            <span className="text-[10px] font-bold text-foreground/50">
              {month} · {C.income}
            </span>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <p className="text-[22px] font-black text-foreground leading-none tracking-tight">
              {formatIDR(summary?.total_income ?? 0)}
            </p>
          )}
        </div>
      </div>

      {!loading && summary && (
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-[11px] font-black text-foreground/40">
            {formatIDR(summary.balance)}
          </span>
          <span className="text-[9px] text-foreground/30 font-bold">
            {C.totalBalance.toLowerCase()}
          </span>
        </div>
      )}
    </div>
  );
};

export const SummaryCardsDesktop = ({
  monthLabel,
  summary,
  loading,
  onPrev,
  onNext,
}: Props) => {
  const C = useTranslate();

  return (
    <div style={{ fontFamily: DASHBOARD_FONT }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-black leading-none tracking-tight text-foreground uppercase">
            {C.dashboard}
          </h1>
          <p className="mt-1 text-[9px] tracking-wide text-foreground/40 uppercase">
            {loading ? C.loading : `${monthLabel} · Cashora`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            className="w-8 h-8 border-[2.5px] border-border bg-card text-foreground flex items-center justify-center shadow-[2px_2px_0px_hsl(var(--border))] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft size={14} strokeWidth={3} />
          </button>
          <div className="h-8 px-4 border-[2.5px] border-border bg-card flex items-center justify-center shadow-[2px_2px_0px_hsl(var(--border))]">
            <span className="text-[11px] font-black uppercase tracking-widest text-foreground">
              {monthLabel}
            </span>
          </div>
          <button
            onClick={onNext}
            className="w-8 h-8 border-[2.5px] border-border bg-card text-foreground flex items-center justify-center shadow-[2px_2px_0px_hsl(var(--border))] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            aria-label="Bulan berikutnya"
          >
            <ChevronRight size={14} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label={C.totalBalance}
          value={summary?.balance ?? 0}
          loading={loading}
          positive={(summary?.balance ?? 0) >= 0}
        />
        <StatCard
          label={C.income}
          value={summary?.total_income ?? 0}
          loading={loading}
          positive={true}
        />
        <StatCard
          label={C.expense}
          value={summary?.total_expense ?? 0}
          loading={loading}
          positive={false}
        />
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  loading,
  positive,
}: {
  label: string;
  value: number;
  loading?: boolean;
  positive: boolean;
}) => (
  <div
    className="border-[2.5px] border-border bg-card p-4 shadow-[3px_3px_0px_hsl(var(--border))]"
    style={{ fontFamily: DASHBOARD_FONT }}
  >
    <p className="text-[9px] font-black tracking-widest text-foreground/40 uppercase mb-1">
      {label}
    </p>
    {loading ? (
      <div className="h-7 w-32 bg-foreground/10 animate-pulse rounded" />
    ) : (
      <p
        className="text-2xl font-black tracking-tight"
        style={{
          color: positive ? "var(--color-success)" : "var(--color-danger)",
        }}
      >
        {formatIDR(value)}
      </p>
    )}
  </div>
);
