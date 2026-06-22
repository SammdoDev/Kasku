"use client";

import { useEffect, useCallback, useState } from "react";
import { del, get, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import { X } from "lucide-react";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import { makeMonthLabel, useMonthFilter } from "@/components/ui/input-component/month-filter/store/month-filter-store";
import { useTranslate } from "@/lib/i18n/use-translate";

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
  transfer_pair_id: string | null;
  category: {
    id: string;
    icon: string | null;
    name: string;
    color: string | null;
  } | null;
  payment_method: { id: string; name: string } | null;
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
}) => {
  const CONSTANT = useTranslate();
  return (
    <div
      className={`flex items-center justify-between gap-3 ${
        mobile
          ? "border-2 border-destructive bg-destructive/10 rounded-2xl px-3.5 py-2.5"
          : "border-[2.5px] border-destructive bg-destructive/10 px-3.5 py-2.5 mb-4"
      }`}
      style={{ fontFamily: DASHBOARD_FONT }}
    >
      <span className="flex items-center gap-1.5 font-black text-[10px] text-destructive">
        <X size={mobile ? 11 : 12} strokeWidth={3} />
        {CONSTANT.failedLoadSummary}
      </span>
      <button
        onClick={onRetry}
        className="font-black text-[9px] border-2 border-destructive bg-destructive text-destructive-foreground px-2.5 py-0.5 hover:opacity-90"
      >
        RETRY
      </button>
    </div>
  );
};

const AppDashboard = () => {
  const { month, prevMonth, nextMonth } = useMonthFilter();
  const CONSTANT = useTranslate();
  const monthLabel = makeMonthLabel(month, CONSTANT);
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [txLimit, setTxLimit] = useState(5);
  const [transactions, setTransactions] = useState<RawTransaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);

  const fetchTransactions = useCallback(
    async (m: string, lim: number) => {
      setTxLoading(true);
      try {
        const res = await get<{ transactions: RawTransaction[] }>(
          `/transactions?month=${m}&limit=${lim}&page=1`,
        );
        setTransactions(res.transactions);
      } catch (err) {
        toast.error(CONSTANT.failedLoadSummary, getApiError(err));
      } finally {
        setTxLoading(false);
      }
    },
    [CONSTANT],
  );

  const fetchDashboard = useCallback(
    async (m: string) => {
      setLoading(true);
      setError(false);
      try {
        const res = await get<DashboardResponse>(`/dashboard?month=${m}`);
        setData(res);
      } catch (err) {
        setError(true);
        toast.error(CONSTANT.failedLoadSummary, getApiError(err));
      } finally {
        setLoading(false);
      }
    },
    [CONSTANT],
  );

  useEffect(() => {
    fetchDashboard(month);
    fetchTransactions(month, txLimit);
  }, [month]);

  useEffect(() => {
    fetchTransactions(month, txLimit);
  }, [txLimit]);

  useEffect(() => {
    const handler = () => {
      fetchDashboard(month);
      fetchTransactions(month, txLimit);
    };
    window.addEventListener("transaksi:added", handler);
    return () => window.removeEventListener("transaksi:added", handler);
  }, [month, txLimit]);

  const summary = data?.summary;
  const monthNavProps = {
    monthLabel,
    summary,
    loading,
    onPrev: prevMonth,
    onNext: nextMonth,
  };

  const recentTransactions: RecentTransaction[] = transactions.map((t) => ({
    id: t.id,
    date: t.date,
    description: t.note ?? t.category?.name ?? CONSTANT.transaction,
    category_name: t.category?.name ?? null,
    category_icon: t.category?.icon ?? null,
    category_color: t.category?.color ?? null,
    amount: t.amount,
    type: t.type,
    payment_method_name: t.payment_method?.name ?? null,
    transfer_pair_id: t.transfer_pair_id ?? null,
  }));

  const txCard = (
    <RecentTransactionsCard
      transactions={recentTransactions}
      loading={txLoading}
      limit={txLimit}
      onLimitChange={(lim) => setTxLimit(lim)}
      onDelete={async (id) => {
        await del(`/transactions/${id}`);
        toast.success(CONSTANT.success);
        fetchDashboard(month);
        fetchTransactions(month, txLimit);
      }}
    />
  );

  return (
    <div
      className="card md:m-4 p-4 md:p-6"
      style={{ fontFamily: DASHBOARD_FONT, background: "transparent" }}
    >
      <div className="lg:hidden px-4 pt-4 flex flex-col gap-4">
        {error && !loading && (
          <ErrorBanner onRetry={() => fetchDashboard(month)} mobile />
        )}
        <SummaryHeaderMobile {...monthNavProps} />
        <QuickAccessGrid loading={loading} />
        {txCard}
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
          <div className="col-span-2 flex flex-col gap-3">{txCard}</div>
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
