"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Landmark,
  Smartphone,
  Banknote,
  CreditCard,
  Wallet as WalletIcon,
  TrendingUp,
  TrendingDown,
  Scale,
  type LucideIcon,
} from "lucide-react";
import { get, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import { useCurrency } from "@/lib/helper/currency-format";
import { useTranslate } from "@/lib/i18n/use-translate";
import TabFilter from "@/components/ui/input-component/tab-filter.tsx/tab-filter";
import ChartCard, { ChartDataset } from "@/components/ui/chart-card/chart-card";

interface CategoryRef {
  id: string;
  name: string;
  color?: string | null;
  icon?: string | null;
}

interface PaymentMethodRef {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  type: "income" | "expense" | "transfer";
  amount: number;
  date: string;
  note?: string | null;
  category?: CategoryRef | null;
  payment_method?: PaymentMethodRef | null;
}

interface WalletItem {
  id: string;
  name: string;
  type: string | null;
  balance: number;
}

const WALLET_TYPE_META: Record<
  string,
  { icon: LucideIcon; color: string; label: string }
> = {
  bank: { icon: Landmark, color: "#3b82f6", label: "BANK" },
  ewallet: { icon: Smartphone, color: "#8b5cf6", label: "E-WALLET" },
  cash: { icon: Banknote, color: "#10b981", label: "CASH" },
  credit: { icon: CreditCard, color: "#f97316", label: "KREDIT" },
  other: { icon: WalletIcon, color: "#64748b", label: "LAINNYA" },
};

const getWalletMeta = (type: string | null) =>
  WALLET_TYPE_META[type ?? "other"] ?? WALLET_TYPE_META.other;

const MONTH_LABELS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MEI",
  "JUN",
  "JUL",
  "AGU",
  "SEP",
  "OKT",
  "NOV",
  "DES",
];

function lastNMonths(n: number) {
  const now = new Date();
  const result: { key: string; label: string; year: number; month: number }[] =
    [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: MONTH_LABELS[d.getMonth()],
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return result;
}

const CATEGORY_FALLBACK_COLOR = "#64748b";

const AppRingkasan = () => {
  const CONSTANT = useTranslate();
  const { format } = useCurrency();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [breakdownType, setBreakdownType] = useState<"expense" | "income">(
    "expense",
  );

  const BREAKDOWN_OPTIONS = [
    { label: CONSTANT.expense.toUpperCase(), value: "expense" },
    { label: CONSTANT.income.toUpperCase(), value: "income" },
  ];

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [txRes, walletRes] = await Promise.all([
          get<{ transactions: Transaction[] }>("/transactions"),
          get<{ payment_methods: WalletItem[] }>("/payment-methods"),
        ]);
        setTransactions(txRes.transactions ?? []);
        setWallets(walletRes.payment_methods ?? []);
      } catch (err) {
        toast.error(CONSTANT.failedLoadSummary, getApiError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [CONSTANT]);

  // ── Trend 6 bulan terakhir ──────────────────────────────────
  const monthBuckets = useMemo(() => lastNMonths(6), []);

  const trendDatasets = useMemo<ChartDataset[]>(() => {
    const incomeByKey = new Map<string, number>();
    const expenseByKey = new Map<string, number>();

    for (const tx of transactions) {
      if (tx.type === "transfer") continue;
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const map = tx.type === "income" ? incomeByKey : expenseByKey;
      map.set(key, (map.get(key) ?? 0) + Number(tx.amount));
    }

    return [
      {
        label: CONSTANT.income.toUpperCase(),
        data: monthBuckets.map((b) => incomeByKey.get(b.key) ?? 0),
        color: "#10b981",
        fill: true,
      },
      {
        label: CONSTANT.expense.toUpperCase(),
        data: monthBuckets.map((b) => expenseByKey.get(b.key) ?? 0),
        color: "#ef4444",
        fill: true,
      },
    ];
  }, [transactions, monthBuckets, CONSTANT]);

  // ── Ringkasan bulan ini ─────────────────────────────────────
  const { totalIncome, totalExpense } = useMemo(() => {
    const now = new Date();
    let income = 0;
    let expense = 0;
    for (const tx of transactions) {
      const d = new Date(tx.date);
      if (
        d.getFullYear() !== now.getFullYear() ||
        d.getMonth() !== now.getMonth()
      )
        continue;
      if (tx.type === "income") income += Number(tx.amount);
      if (tx.type === "expense") expense += Number(tx.amount);
    }
    return { totalIncome: income, totalExpense: expense };
  }, [transactions]);

  const netBalance = totalIncome - totalExpense;

  // ── Breakdown per kategori (bulan ini) ─────────────────────
  const categoryBreakdown = useMemo<ChartDataset[]>(() => {
    const now = new Date();
    const totals = new Map<
      string,
      { name: string; color: string; total: number }
    >();

    for (const tx of transactions) {
      if (tx.type !== breakdownType) continue;
      const d = new Date(tx.date);
      if (
        d.getFullYear() !== now.getFullYear() ||
        d.getMonth() !== now.getMonth()
      )
        continue;
      const id = tx.category?.id ?? "uncategorized";
      const name = tx.category?.name ?? CONSTANT.uncategorized;
      const color = tx.category?.color ?? CATEGORY_FALLBACK_COLOR;
      const existing = totals.get(id);
      if (existing) existing.total += Number(tx.amount);
      else totals.set(id, { name, color, total: Number(tx.amount) });
    }

    const sorted = Array.from(totals.values()).sort(
      (a, b) => b.total - a.total,
    );
    const top = sorted.slice(0, 6);

    return top.map((c) => ({
      label: c.name.toUpperCase(),
      data: [c.total],
      color: c.color,
    }));
  }, [transactions, breakdownType, CONSTANT]);

  return (
    <div className="flex flex-col gap-5 p-4 font-mono">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[16px] font-black tracking-wide uppercase">
          {CONSTANT.summary}
        </h1>
        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
          {CONSTANT.thisMonth}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-3 border-2 border-border bg-card p-3 shadow-[3px_3px_0px_0px_hsl(var(--border))]">
          <div className="w-9 h-9 shrink-0 border-2 border-border flex items-center justify-center bg-[#10b98122]">
            <TrendingUp size={16} strokeWidth={2.5} color="#10b981" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-black tracking-widest text-foreground/40 uppercase">
              {CONSTANT.income.toUpperCase()}
            </span>
            <span className="text-[13px] font-black font-mono truncate">
              {loading ? "..." : format(totalIncome)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-2 border-border bg-card p-3 shadow-[3px_3px_0px_0px_hsl(var(--border))]">
          <div className="w-9 h-9 shrink-0 border-2 border-border flex items-center justify-center bg-[#ef444422]">
            <TrendingDown size={16} strokeWidth={2.5} color="#ef4444" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-black tracking-widest text-foreground/40 uppercase">
              {CONSTANT.expense.toUpperCase()}
            </span>
            <span className="text-[13px] font-black font-mono truncate">
              {loading ? "..." : format(totalExpense)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-2 border-border bg-card p-3 shadow-[3px_3px_0px_0px_hsl(var(--border))]">
          <div
            className="w-9 h-9 shrink-0 border-2 border-border flex items-center justify-center"
            style={{
              background: (netBalance >= 0 ? "#3b82f6" : "#ef4444") + "22",
            }}
          >
            <Scale
              size={16}
              strokeWidth={2.5}
              color={netBalance >= 0 ? "#3b82f6" : "#ef4444"}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-black tracking-widest text-foreground/40 uppercase">
              {CONSTANT.netBalance}
            </span>
            <span
              className="text-[13px] font-black font-mono truncate"
              style={{ color: netBalance >= 0 ? "#3b82f6" : "#ef4444" }}
            >
              {loading ? "..." : format(netBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* Saldo per wallet */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-black tracking-[0.15em] text-foreground/40 uppercase">
          {CONSTANT.walletBalance}
        </span>
        {loading ? (
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="w-36 h-16 bg-foreground/10 border-2 border-border/20 animate-pulse"
              />
            ))}
          </div>
        ) : wallets.length === 0 ? (
          <p className="text-[11px] text-foreground/40 font-bold">
            {CONSTANT.walletEmpty}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {wallets.map((w) => {
              const meta = getWalletMeta(w.type);
              const Icon = meta.icon;
              return (
                <div
                  key={w.id}
                  className="relative flex items-center gap-2.5 px-3 py-2.5 border-2 border-border bg-card shadow-[3px_3px_0px_0px_hsl(var(--border))] min-w-[150px]"
                >
                  <div
                    className="w-9 h-9 shrink-0 border-2 flex items-center justify-center"
                    style={{
                      background: meta.color + "22",
                      borderColor: meta.color,
                    }}
                  >
                    <Icon
                      size={16}
                      strokeWidth={2.5}
                      style={{ color: meta.color }}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[11px] font-black truncate">
                      {w.name}
                    </span>
                    <span className="text-[10px] font-bold font-mono text-foreground/50">
                      {format(w.balance)}
                    </span>
                  </div>
                  <span
                    className="absolute -top-1.5 -right-1.5 text-[7px] font-black px-1 py-0.5 border-2 border-border tracking-wider"
                    style={{ background: meta.color, color: "#fff" }}
                  >
                    {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trend income vs expense */}
      <ChartCard
        title={CONSTANT.incomeExpenseTrend}
        subtitle={CONSTANT.last6Months}
        labels={monthBuckets.map((b) => b.label)}
        datasets={trendDatasets}
        chartType="line"
        accentColor="#3b82f6"
      />

      {/* Breakdown kategori */}
      <div className="flex flex-col gap-2.5 bg-card border-[3px] border-border shadow-[5px_5px_0_hsl(var(--border))] p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-[11px] font-bold tracking-[1px] uppercase">
              {CONSTANT.categoryBreakdown}
            </div>
            <div className="text-[9px] text-foreground/40 mt-0.5 tracking-[0.5px] uppercase">
              {CONSTANT.thisMonth}
            </div>
          </div>
          <TabFilter
            value={breakdownType}
            onChange={(v) =>
              setBreakdownType((v || "expense") as "expense" | "income")
            }
            options={BREAKDOWN_OPTIONS}
            showAll={false}
          />
        </div>

        {categoryBreakdown.length === 0 ? (
          <div className="w-full h-[140px] flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-foreground/15">
            <span className="text-[10px] font-bold tracking-[2px] uppercase text-foreground/30">
              {CONSTANT.noData}
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {categoryBreakdown.map((c, i) => {
              const total = categoryBreakdown.reduce(
                (sum, d) => sum + d.data[0],
                0,
              );
              const pct = total > 0 ? (c.data[0] / total) * 100 : 0;
              return (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 border-2 border-border shrink-0"
                        style={{ background: c.color }}
                      />
                      <span className="text-[10px] font-black tracking-wide">
                        {c.label}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold font-mono text-foreground/60">
                      {format(c.data[0])}
                    </span>
                  </div>
                  <div className="h-2 w-full border-2 border-border bg-foreground/5">
                    <div
                      className="h-full"
                      style={{ width: `${pct}%`, background: c.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppRingkasan;
