"use client";

import { useEffect, useState, useCallback } from "react";
import { get, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import { useMonthFilter } from "@/components/ui/input-component/month-filter/store/month-filter-store";
import { useTranslate } from "@/lib/i18n/use-translate";
import formatIDR from "@/lib/helper/currency-format";

interface DashboardSummary {
  balance: number;
  total_income: number;
  total_expense: number;
  net: number;
}

interface DashboardResponse {
  summary: DashboardSummary;
}

type Stat = {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
  statusColor?: boolean;
};

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`rounded bg-foreground/10 animate-pulse ${className}`} />
);

const AccountStatStrip = () => {
  const { month } = useMonthFilter();
  const CONSTANT = useTranslate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(
    async (m: string) => {
      setLoading(true);
      try {
        const res = await get<DashboardResponse>(`/dashboard?month=${m}`);
        setSummary(res.summary);
      } catch (err) {
        toast.error(CONSTANT.failedLoadSummary, getApiError(err));
      } finally {
        setLoading(false);
      }
    },
    [CONSTANT],
  );

  useEffect(() => {
    fetchSummary(month);
  }, [month, fetchSummary]);

  const stats: Stat[] = [
    {
      label: CONSTANT.totalBalance,
      value: summary ? formatIDR(summary.balance) : "-",
      sub: summary
        ? summary.balance >= 0
          ? CONSTANT.positive
          : CONSTANT.negative
        : "-",
      highlight: true,
    },
    {
      label: CONSTANT.income,
      value: summary ? formatIDR(summary.total_income) : "-",
      sub: CONSTANT.thisMonth,
    },
    {
      label: CONSTANT.expense,
      value: summary ? formatIDR(summary.total_expense) : "-",
      sub: CONSTANT.thisMonth,
    },
    {
      label: CONSTANT.net,
      value: summary ? formatIDR(summary.net) : "-",
      sub: summary
        ? `● ${summary.net >= 0 ? CONSTANT.surplus : CONSTANT.deficit}`
        : "-",
      statusColor: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 border-[3px] border-border shadow-[6px_6px_0_hsl(var(--border))] overflow-hidden">
      {stats.map((stat, i) => {
        const isLastRow = i >= stats.length - 2;
        const isLastCol2 = i % 2 === 1;
        const isLastCol4 = i === stats.length - 1;

        return (
          <div
            key={stat.label}
            className={[
              "px-4 py-4",
              !isLastCol2 ? "border-r-[3px] border-border" : "",
              "md:border-r-[3px] md:border-border",
              isLastCol4 ? "md:border-r-0" : "",
              !isLastRow ? "border-b-[3px] border-border" : "",
              "md:border-b-0",
            ]
              .filter(Boolean)
              .join(" ")}
            style={
              stat.highlight
                ? { background: "var(--accent-bg)" }
                : { background: "var(--stat-card-bg, var(--card))" }
            }
          >
            <p
              className="text-[9px] font-black uppercase tracking-[0.15em] mb-1.5"
              style={{
                color: stat.highlight
                  ? "var(--accent-fg-muted)"
                  : "var(--foreground)",
                opacity: stat.highlight ? 1 : 0.45,
              }}
            >
              {stat.label}
            </p>
            {loading ? (
              <>
                <Skeleton className="h-7 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </>
            ) : (
              <>
                <p
                  className="text-lg md:text-xl font-black tracking-tight leading-none"
                  style={{
                    color: stat.highlight
                      ? "var(--accent-fg)"
                      : "var(--foreground)",
                  }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-[10px] font-bold mt-1"
                  style={
                    stat.statusColor
                      ? {
                          color:
                            summary && summary.net >= 0
                              ? "var(--color-success)"
                              : "var(--color-danger)",
                        }
                      : {
                          color: stat.highlight
                            ? "var(--accent-fg)"
                            : "var(--foreground)",
                          opacity: 0.45,
                        }
                  }
                >
                  {stat.sub}
                </p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AccountStatStrip;
