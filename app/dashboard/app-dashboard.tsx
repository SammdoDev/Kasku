"use client";

import { useEffect, useCallback, useState } from "react";
import { get, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import { X } from "lucide-react";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import { useMonthFilter } from "@/components/ui/input-component/month-filter/store/month-filter-store";

import CategorySpendCard from "@/components/ui/button-component/category-spend-card";
import RecentTransactionsCard, {
  RecentTransaction,
} from "@/components/ui/card/recent-transaction-card";
import {
  SummaryCardsDesktop,
  SummaryHeaderMobile,
} from "@/components/ui/card/summary-header";
import QuickAccessGrid from "@/components/ui/button-component/quick-access-grid";
import BudgetSummaryCard from "@/components/ui/card/budget-summary-card";

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
  recent_transactions: RecentTransaction[];
}

// ── Error banner ──────────────────────────────────────────────────
const ErrorBanner = ({
  onRetry,
  mobile,
}: {
  onRetry: () => void;
  mobile?: boolean;
}) => (
  <div
    className={`flex items-center justify-between gap-3 ${
      mobile
        ? "border-[2px] border-red-400 bg-red-50 rounded-2xl px-3.5 py-2.5"
        : "border-[2.5px] border-red-500 bg-red-100 px-3.5 py-2.5 mb-4"
    }`}
    style={{ fontFamily: DASHBOARD_FONT }}
  >
    <span
      className={`flex items-center gap-1.5 font-black ${mobile ? "text-[10px] text-red-700" : "text-[10px] text-red-900"}`}
    >
      <X size={mobile ? 11 : 12} strokeWidth={3} /> Gagal memuat data
    </span>
    <button
      onClick={onRetry}
      className={`font-black text-white ${
        mobile
          ? "border border-red-600 bg-red-600 px-2.5 py-0.5 text-[9px] rounded-lg"
          : "border-2 border-red-900 bg-red-900 px-2.5 py-0.5 text-[9px] hover:bg-red-800"
      }`}
    >
      RETRY
    </button>
  </div>
);

// ── Dashboard ─────────────────────────────────────────────────────
const AppDashboard = () => {
  const { month, monthLabel, prevMonth, nextMonth } = useMonthFilter();
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

  // ── Derived values ──────────────────────────────────────────────
  const summary = data?.summary;
  const hasCategory = (data?.spending_by_category.length ?? 0) > 0;
  const hasBudget = (data?.budget_summary.length ?? 0) > 0;

  // sparkline data for summary cards
  const sparkIncome = data?.daily_trend.map((d) => d.income) ?? [];
  const sparkExpense = data?.daily_trend.map((d) => d.expense) ?? [];
  const sparkBalance = data?.daily_trend.map((d) => d.net) ?? [];

  const monthNavProps = {
    monthLabel,
    summary,
    loading,
    onPrev: prevMonth,
    onNext: nextMonth,
    sparkIncome,
    sparkExpense,
    sparkBalance,
  };

  return (
    <div
      className="card w-full min-h-full"
      style={{ fontFamily: DASHBOARD_FONT, background: "transparent" }}
    >
      {/* ── MOBILE ─────────────────────────────────────────────── */}
      <div className="lg:hidden px-4 pt-4 pb-6 flex flex-col gap-4">
        {error && !loading && (
          <ErrorBanner onRetry={() => fetchDashboard(month)} mobile />
        )}

        <SummaryHeaderMobile {...monthNavProps} />

        <QuickAccessGrid loading={loading} />

        <RecentTransactionsCard
          transactions={data?.recent_transactions ?? []}
          loading={loading}
          limit={5}
        />

        {(loading || hasCategory) && (
          <CategorySpendCard
            categories={data?.spending_by_category ?? []}
            monthLabel={monthLabel}
            loading={loading}
          />
        )}

        {!loading && hasBudget && (
          <BudgetSummaryCard budgets={data!.budget_summary} variant="mobile" />
        )}
      </div>

      {/* ── DESKTOP ────────────────────────────────────────────── */}
      <div className="hidden lg:block px-6 py-6">
        <SummaryCardsDesktop {...monthNavProps} />

        {error && !loading && (
          <ErrorBanner onRetry={() => fetchDashboard(month)} />
        )}

        {/* Quick access */}
        <div className="mt-4 mb-4">
          <QuickAccessGrid loading={loading} />
        </div>

        {/* 3-col grid */}
        <div className="grid grid-cols-3 gap-3 items-start">
          {/* Left 2 cols */}
          <div className="col-span-2 flex flex-col gap-3">
            <RecentTransactionsCard
              transactions={data?.recent_transactions ?? []}
              loading={loading}
              limit={5}
            />
          </div>

          {/* Right 1 col */}
          <div className="col-span-1 flex flex-col gap-3 sticky top-[79px]">
            {(loading || hasCategory) && (
              <CategorySpendCard
                categories={data?.spending_by_category ?? []}
                monthLabel={monthLabel}
                loading={loading}
              />
            )}
            {!loading && hasBudget && (
              <BudgetSummaryCard
                budgets={data!.budget_summary}
                variant="desktop"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppDashboard;
