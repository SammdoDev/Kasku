"use client";

import { useEffect, useCallback, useState } from "react";
import { get, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/toast";
import SummaryCard, {
  type DeltaDir,
} from "@/components/ui/summary-card/summary-card";
import SummaryCardSkeleton from "@/components/ui/summary-card/summary-card-skeleton";
import ChartCard from "@/components/ui/chart-card/chart-card";
import ChartCardSkeleton from "@/components/ui/chart-card/chart-card-skeleton";
import formatIDR from "@/lib/helper/currency-format";
import { useDashboardFilter } from "./store/dashboard-filter";
import MonthFilter from "./components/month-filter";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import { X } from "lucide-react";

interface CategorySpend {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  total: number;
  percent: number;
}
interface DailyPoint {
  date: string;
  income: number;
  expense: number;
  net: number;
}
interface MonthlyPoint {
  month: string;
  income: number;
  expense: number;
  net: number;
}
interface BudgetItem {
  id: string;
  name: string;
  amount: number;
  spent: number;
  remaining: number;
  percent_used: number;
  over_budget: boolean;
}
interface DashboardResponse {
  period: { year: number; month: number; date_from: string; date_to: string };
  summary: {
    balance: number;
    total_income: number;
    total_expense: number;
    net: number;
  };
  spending_by_category: CategorySpend[];
  daily_trend: DailyPoint[];
  monthly_trend: MonthlyPoint[];
  budget_summary: BudgetItem[];
  recent_transactions: unknown[];
}

const AppDashboard = () => {
  const { month, monthLabel } = useDashboardFilter();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDashboard = useCallback(async (m: string) => {
    setLoading(true);
    setError(false);
    try {
      const res = await get<DashboardResponse>(`/dashboard?month=${m}`);
      setData(res);
    } catch (err) {
      setError(true);
      toast.error("Gagal memuat dashboard", getApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(month);
  }, [month, fetchDashboard]);

  const summary = data?.summary;
  const budgetCount = data?.budget_summary.length ?? 0;
  const overCount =
    data?.budget_summary.filter((b) => b.over_budget).length ?? 0;
  const expPct =
    summary && summary.total_income > 0
      ? Math.min(
          100,
          Math.round((summary.total_expense / summary.total_income) * 100),
        )
      : undefined;
  const netDir: DeltaDir =
    (summary?.net ?? 0) > 0
      ? "up"
      : (summary?.net ?? 0) < 0
        ? "down"
        : "neutral";

  const CARDS = [
    {
      badge: "SALDO",
      value: summary ? formatIDR(summary.balance) : "—",
      label: "Total saldo",
      delta: "Akumulasi semua waktu",
      dir: ((summary?.balance ?? 0) >= 0 ? "up" : "down") as DeltaDir,
      accentColor: "#22c55e",
      progress: undefined,
    },
    {
      badge: "PEMASUKAN",
      value: summary ? formatIDR(summary.total_income) : "—",
      label: "Pemasukan bulan ini",
      delta: "Total masuk bulan ini",
      dir: "up" as DeltaDir,
      accentColor: "#3b82f6",
      progress: undefined,
    },
    {
      badge: "PENGELUARAN",
      value: summary ? formatIDR(summary.total_expense) : "—",
      label: "Pengeluaran bulan ini",
      delta: expPct !== undefined ? `${expPct}% dari pemasukan` : "—",
      dir: "down" as DeltaDir,
      accentColor: "#ef4444",
      progress: expPct,
    },
    {
      badge: "NET",
      value: summary ? formatIDR(summary.net) : "—",
      label: "Selisih bulan ini",
      delta:
        overCount > 0
          ? `${overCount} anggaran over`
          : budgetCount > 0
            ? `${budgetCount} anggaran aktif`
            : "Belum ada anggaran",
      dir: netDir,
      accentColor: "#f59e0b",
      progress: undefined,
    },
  ];

  const dailyLabels =
    data?.daily_trend.map((d) =>
      new Date(d.date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      }),
    ) ?? [];
  const dailyIncome = data?.daily_trend.map((d) => d.income) ?? [];
  const dailyExpense = data?.daily_trend.map((d) => d.expense) ?? [];

  const hasCategory = (data?.spending_by_category.length ?? 0) > 0;
  const hasBudget = (data?.budget_summary.length ?? 0) > 0;

  return (
    <div
      className="card w-full px-4 py-4 sm:px-6 sm:py-5"
      style={{ fontFamily: DASHBOARD_FONT }}
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 sm:mb-5">
        <div>
          <h1 className="m-0 text-lg font-black leading-none tracking-tight text-[#1a1a1a] sm:text-xl">
            DASHBOARD
          </h1>
          <p className="mt-1 text-[9px] tracking-wide text-[#999]">
            {loading ? "MEMUAT DATA..." : `${monthLabel.toUpperCase()} · KASKU`}
          </p>
        </div>
        <MonthFilter size="sm" />
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <SummaryCardSkeleton key={i} />
            ))
          : CARDS.map((c) => (
              <SummaryCard
                key={c.badge}
                badge={c.badge}
                value={c.value}
                label={c.label}
                delta={c.delta}
                dir={c.dir}
                accentColor={c.accentColor}
                progress={c.progress}
              />
            ))}
      </div>

      {error && !loading && (
        <div className="mb-3 flex items-center justify-between gap-3 border-[2.5px] border-red-500 bg-red-100 px-3.5 py-2.5">
          <span className="text-[10px] font-black text-red-900">
            <X /> GAGAL MEMUAT DATA
          </span>
          <button
            onClick={() => fetchDashboard(month)}
            className="cursor-pointer rounded-none border-2 border-red-900 bg-red-900 px-2.5 py-0.5 text-[9px] font-black text-white hover:bg-red-800 active:translate-x-px active:translate-y-px"
          >
            RETRY
          </button>
        </div>
      )}

      <div className="mb-3 grid grid-cols-1 gap-2.5 md:grid-cols-2">
        {loading ? (
          <>
            <ChartCardSkeleton height={200} />
            <ChartCardSkeleton height={200} />
          </>
        ) : (
          <>
            <ChartCard
              title="PEMASUKAN VS PENGELUARAN"
              subtitle={`HARIAN · ${monthLabel.toUpperCase()}`}
              labels={dailyLabels}
              datasets={[
                { label: "Pemasukan", data: dailyIncome, color: "#22c55e" },
                {
                  label: "Pengeluaran",
                  data: dailyExpense,
                  color: "#ef4444",
                  borderDash: [5, 3],
                },
              ]}
              chartType="bar"
              height={200}
            />
            <ChartCard
              title="TREN 6 BULAN"
              subtitle="PEMASUKAN VS PENGELUARAN"
              labels={data?.monthly_trend.map((m) => m.month) ?? []}
              datasets={[
                {
                  label: "Pemasukan",
                  data: data?.monthly_trend.map((m) => m.income) ?? [],
                  color: "#3b82f6",
                },
                {
                  label: "Pengeluaran",
                  data: data?.monthly_trend.map((m) => m.expense) ?? [],
                  color: "#f97316",
                  borderDash: [5, 3],
                },
              ]}
              chartType="line"
              height={200}
            />
          </>
        )}
      </div>

      {!loading && (
        <div
          className={`grid grid-cols-1 gap-2.5 ${
            hasCategory && hasBudget ? "md:grid-cols-2" : ""
          }`}
        >
          {hasCategory && (
            <div className="border-[2.5px] border-[#1a1a1a] bg-white p-3.5">
              <div className="mb-3.5 flex items-center justify-between">
                <span className="text-[10px] font-black tracking-[0.3px]">
                  PENGELUARAN PER KATEGORI
                </span>
                <span className="text-[8px] font-bold text-[#999]">
                  {monthLabel.toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                {data?.spending_by_category.slice(0, 5).map((c) => (
                  <div key={c.id}>
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-0.5">
                      <span className="text-[10px] font-extrabold">
                        {c.name}
                      </span>
                      <span className="text-[9px] text-[#666]">
                        {formatIDR(c.total)} · {c.percent}%
                      </span>
                    </div>
                    <div className="h-[5px] overflow-hidden border-[1.5px] border-[#1a1a1a] bg-gray-200">
                      <div
                        className="h-full transition-[width] duration-500"
                        style={{
                          width: `${c.percent}%`,
                          background: c.color ?? "#888",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasBudget && (
            <div className="border-[2.5px] border-[#1a1a1a] bg-white p-3.5">
              <div className="mb-3.5 flex items-center justify-between">
                <span className="text-[10px] font-black tracking-[0.3px]">
                  RINGKASAN ANGGARAN
                </span>
                {overCount > 0 && (
                  <span className="border-[1.5px] border-red-500 bg-red-100 px-1.5 py-0.5 text-[8px] font-black tracking-widest text-red-500">
                    {overCount} OVER
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2.5">
                {data?.budget_summary.map((b) => (
                  <div key={b.id}>
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
                      <span className="text-[10px] font-extrabold">
                        {b.name}
                      </span>
                      <span
                        className={`flex items-center gap-1.5 text-[9px] font-bold ${
                          b.over_budget ? "text-red-500" : "text-[#555]"
                        }`}
                      >
                        {formatIDR(b.spent)} / {formatIDR(b.amount)}
                        {b.over_budget && (
                          <span className="border-[1.5px] border-red-500 bg-red-100 px-1 py-px text-[7px] font-black text-red-500">
                            OVER
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden border-[1.5px] border-[#1a1a1a] bg-gray-200">
                      <div
                        className="h-full transition-[width] duration-500"
                        style={{
                          width: `${Math.min(100, b.percent_used)}%`,
                          background: b.over_budget
                            ? "#ef4444"
                            : b.percent_used > 80
                              ? "#f97316"
                              : "#22c55e",
                        }}
                      />
                    </div>
                    <div className="mt-0.5 text-[8px] text-[#aaa]">
                      {b.percent_used}% TERPAKAI · SISA{" "}
                      {formatIDR(Math.max(0, b.remaining))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppDashboard;
