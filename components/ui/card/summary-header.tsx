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
  <div className={`rounded-lg bg-black/10 animate-pulse ${className}`} />
);

export const SummaryHeaderMobile = ({
  monthLabel,
  summary,
  loading,
}: Props) => {
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
              className="text-red-400"
            />
            <span className="text-[10px] font-bold text-black/50">
              {month} · Pengeluaran
            </span>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <p className="text-[22px] font-black text-black leading-none tracking-tight">
              {formatIDR(summary?.total_expense ?? 0)}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp
              size={11}
              strokeWidth={2.5}
              className="text-green-500"
            />
            <span className="text-[10px] font-bold text-black/50">
              {month} · Pendapatan
            </span>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <p className="text-[22px] font-black text-black leading-none tracking-tight">
              {formatIDR(summary?.total_income ?? 0)}
            </p>
          )}
        </div>
      </div>

      {!loading && summary && (
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-[11px] font-black text-black/40">
            {formatIDR(summary.balance)}
          </span>
          <span className="text-[9px] text-black/30 font-bold">
            saldo total
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
}: Props) => (
  <div style={{ fontFamily: DASHBOARD_FONT }}>
    <div className="flex items-center justify-between mb-5">
      <div>
        <h1 className="text-xl font-black leading-none tracking-tight text-[#1a1a1a] uppercase">
          Dashboard
        </h1>
        <p className="mt-1 text-[9px] tracking-wide text-[#999] uppercase">
          {loading ? "Memuat data..." : `${monthLabel} · Cashora`}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          className="w-8 h-8 border-[2.5px] border-black bg-white flex items-center justify-center shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft size={14} strokeWidth={3} />
        </button>
        <div className="h-8 px-4 border-[2.5px] border-black bg-white flex items-center justify-center shadow-[2px_2px_0px_#000]">
          <span className="text-[11px] font-black uppercase tracking-widest">
            {monthLabel}
          </span>
        </div>
        <button
          onClick={onNext}
          className="w-8 h-8 border-[2.5px] border-black bg-white flex items-center justify-center shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          aria-label="Bulan berikutnya"
        >
          <ChevronRight size={14} strokeWidth={3} />
        </button>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-3">
      <StatCard
        label="Saldo Total"
        value={summary?.balance ?? 0}
        loading={loading}
        colorClass={
          (summary?.balance ?? 0) >= 0 ? "text-[#166534]" : "text-[#991b1b]"
        }
      />
      <StatCard
        label="Pemasukan"
        value={summary?.total_income ?? 0}
        loading={loading}
        colorClass="text-[#166534]"
      />
      <StatCard
        label="Pengeluaran"
        value={summary?.total_expense ?? 0}
        loading={loading}
        colorClass="text-[#991b1b]"
      />
    </div>
  </div>
);

const StatCard = ({
  label,
  value,
  loading,
  colorClass,
}: {
  label: string;
  value: number;
  loading?: boolean;
  colorClass: string;
}) => (
  <div
    className="border-[2.5px] border-black bg-white p-4 shadow-[3px_3px_0px_#000]"
    style={{ fontFamily: DASHBOARD_FONT }}
  >
    <p className="text-[9px] font-black tracking-widest text-[#999] uppercase mb-1">
      {label}
    </p>
    {loading ? (
      <div className="h-7 w-32 bg-gray-100 animate-pulse" />
    ) : (
      <p className={`text-2xl font-black tracking-tight ${colorClass}`}>
        {formatIDR(value)}
      </p>
    )}
  </div>
);
