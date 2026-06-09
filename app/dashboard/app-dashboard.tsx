"use client";

import { useEffect, useCallback, useState } from "react";
import { del, get, getApiError } from "@/lib/helper/apiService";
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

interface RawTransaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  note: string | null;
  date: string;
  category: {
    id: string;
    icon: string | null;
    name: string;
    color: string | null;
  } | null;
  payment_method: unknown;
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
  recent_transactions: RawTransaction[];
}

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
        ? "border-2 border-red-400 bg-red-50 rounded-2xl px-3.5 py-2.5"
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

  const summary = data?.summary;

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

  const recentTransactions: RecentTransaction[] = (
    data?.recent_transactions ?? []
  ).map((t) => ({
    id: t.id,
    date: t.date,
    description: t.note ?? t.category?.name ?? "Transaksi",
    category_name: t.category?.name ?? null,
    category_icon: t.category?.icon ?? null,
    category_color: t.category?.color ?? null,
    amount: t.amount,
    type: t.type,
  }));

  return (
    <div
      className="card md:m-4 p-4 md:p-6"
      style={{ fontFamily: DASHBOARD_FONT, background: "transparent" }}
    >
      <div className="lg:hidden px-4 pt-4 pb-[84px] flex flex-col gap-4">
        {error && !loading && (
          <ErrorBanner onRetry={() => fetchDashboard(month)} mobile />
        )}
        <SummaryHeaderMobile {...monthNavProps} />
        <QuickAccessGrid loading={loading} />
        <RecentTransactionsCard
          transactions={recentTransactions}
          loading={loading}
          limit={5}
          onDelete={async (id) => {
            await del(`/transactions/${id}`);
            toast.success("Transaksi dihapus");
            fetchDashboard(month);
          }}
        />
        <CategorySpendCard
          categories={data?.spending_by_category ?? []}
          monthLabel={monthLabel}
          loading={loading}
        />
        <BudgetSummaryCard
          budgets={data?.budget_summary ?? []}
          variant="mobile"
        />
      </div>

      <div className="hidden lg:block px-6 py-6">
        <SummaryCardsDesktop {...monthNavProps} />
        {error && !loading && (
          <ErrorBanner onRetry={() => fetchDashboard(month)} />
        )}
        <div className="grid grid-cols-3 gap-3 items-stretch mt-4">
          <div className="col-span-2 flex flex-col gap-3">
            <RecentTransactionsCard
              transactions={recentTransactions}
              loading={loading}
              limit={5}
              onDelete={async (id) => {
                await del(`/transactions/${id}`);
                toast.success("Transaksi dihapus");
                fetchDashboard(month);
              }}
            />
          </div>
          <div className="col-span-1 flex flex-col gap-3 sticky top-19.75">
            <CategorySpendCard
              categories={data?.spending_by_category ?? []}
              monthLabel={monthLabel}
              loading={loading}
            />
            <BudgetSummaryCard
              budgets={data?.budget_summary ?? []}
              variant="desktop"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppDashboard;
