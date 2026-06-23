"use client";

import Link from "next/link";
import { useRef, useCallback, useState } from "react";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import { ChevronRight, ChevronDown, SlidersHorizontal } from "lucide-react";
import { OpenmojiImg } from "@/app/kategori/components/emoji-picker";
import { confirm } from "@/components/layout/for-pages/confirm-dialog";
import { formatRelativeDate } from "@/lib/helper/date-format";
import TabFilter from "@/components/ui/input-component/tab-filter.tsx/tab-filter";
import { useTranslate } from "@/lib/i18n/use-translate";
import { useCurrency } from "@/lib/helper/currency-format";

export interface RecentTransaction {
  id: string;
  date: string;
  description: string;
  category_name: string | null;
  category_icon: string | null;
  category_color: string | null;
  amount: number;
  type: "income" | "expense";
  payment_method_name: string | null;
  transfer_pair_id?: string | null;
}

type Props = {
  transactions: RecentTransaction[];
  loading?: boolean;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  onDelete?: (id: string) => Promise<void> | void;
};

const LIMIT_OPTIONS = [5, 10, 20, 50];

function resolveHexcode(icon: string | null): string {
  if (icon && icon.trim().length > 0) return icon;
  return "1F4AC";
}

const SkeletonRow = () => (
  <div className="flex items-center gap-3 py-2.5 animate-pulse">
    <div className="w-9 h-9 shrink-0 bg-foreground/10 border-[2px] border-border" />
    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
      <div className="h-2.5 w-32 bg-foreground/10" />
      <div className="h-2 w-20 bg-foreground/[0.07]" />
    </div>
    <div className="h-3 w-16 bg-foreground/10 shrink-0" />
  </div>
);

function TransactionRow({
  txn,
  idx,
  onDelete,
}: {
  txn: RecentTransaction;
  idx: number;
  onDelete?: (id: string) => Promise<void> | void;
}) {
  const CONSTANT = useTranslate();
  const { format } = useCurrency();

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const startPress = useCallback(() => {
    if (!onDelete) return;
    timer.current = setTimeout(async () => {
      const ok = await confirm.show({
        title: `${CONSTANT.delete} ${CONSTANT.transaction}?`,
        message: `"${txn.description}" ${CONSTANT.deleteConfirmSuffix ?? "akan dihapus permanen."}`,
        confirmLabel: CONSTANT.delete,
        cancelLabel: CONSTANT.cancel,
        variant: "danger",
      });
      if (ok) await onDelete(txn.id);
    }, 500);
  }, [txn, onDelete, CONSTANT]);

  const cancelPress = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const isTransfer = !!txn.transfer_pair_id;
  const hexcode = resolveHexcode(txn.category_icon);
  const isIncome = txn.type === "income";

  const bgColor = isTransfer
    ? "#6366f122"
    : txn.category_color
      ? `${txn.category_color}22`
      : isIncome
        ? "#bbf7d033"
        : "#fca5a533";

  const borderColor = isTransfer
    ? "#6366f1"
    : (txn.category_color ?? (isIncome ? "#bbf7d0" : "#fca5a5"));

  return (
    <div
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      className={onDelete ? "select-none cursor-pointer" : ""}
    >
      {idx > 0 && <div className="border-t border-border/30" />}
      <div className="flex items-center gap-3 py-2.5">
        <div
          className="w-9 h-9 shrink-0 border-2 flex items-center justify-center select-none shadow-[2px_2px_0px_hsl(var(--border))]"
          style={{ background: bgColor, borderColor }}
          aria-hidden="true"
        >
          <OpenmojiImg
            hexcode={hexcode}
            size={22}
            alt={txn.category_name ?? ""}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-extrabold text-foreground truncate leading-tight">
            {txn.description}
          </p>
          <p className="text-[9px] text-foreground/50 font-bold mt-0.5 flex items-center gap-1 flex-wrap leading-tight">
            <span className="truncate max-w-[80px]">
              {txn.category_name ?? "—"}
            </span>
            <span className="text-foreground/20">·</span>
            <span>{formatRelativeDate(txn.date)}</span>
            {txn.payment_method_name && (
              <>
                <span className="text-foreground/20">·</span>
                <span className="truncate max-w-[60px] text-foreground/35">
                  {txn.payment_method_name}
                </span>
              </>
            )}
          </p>
        </div>

        <span
          className={[
            "text-[12px] font-black shrink-0 tabular-nums",
            isTransfer
              ? "text-[#4338ca] dark:text-[#818cf8]"
              : isIncome
                ? "text-[var(--color-success)]"
                : "text-[var(--color-danger)]",
          ].join(" ")}
        >
          {isTransfer ? "⇄" : isIncome ? "+" : "-"}
          {format(txn.amount)}
        </span>
      </div>
    </div>
  );
}

const RecentTransactionsCard = ({
  transactions,
  loading = false,
  limit = 5,
  onLimitChange,
  onDelete,
}: Props) => {
  const CONSTANT = useTranslate();
  const [filterOpen, setFilterOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");

  const TYPE_FILTER_OPTIONS = [
    { label: CONSTANT.income.toUpperCase(), value: "income" },
    { label: CONSTANT.expense.toUpperCase(), value: "expense" },
    { label: "TRANSFER", value: "transfer" },
  ];

  const filtered = transactions.filter((t) => {
    if (typeFilter === "") return true;
    if (typeFilter === "transfer") return !!t.transfer_pair_id;
    if (typeFilter === "income")
      return t.type === "income" && !t.transfer_pair_id;
    if (typeFilter === "expense")
      return t.type === "expense" && !t.transfer_pair_id;
    return true;
  });

  return (
    <div
      className="border-[2.5px] h-full border-border bg-card shadow-brutal-lg flex flex-col"
      style={{ fontFamily: DASHBOARD_FONT }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 pt-3.5 pb-2">
        <span className="text-[10px] font-black tracking-[0.3px] text-foreground uppercase">
          {CONSTANT.recentTransaction ?? "Transaksi Terkini"}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            className={[
              "flex items-center gap-1 text-[9px] font-black uppercase tracking-widest transition-all px-1.5 py-0.5 border",
              filterOpen
                ? "border-border bg-foreground text-background"
                : "border-border/20 text-foreground/50 hover:border-border hover:text-foreground",
            ].join(" ")}
          >
            <SlidersHorizontal size={10} strokeWidth={3} />
            {limit}
            <ChevronDown
              size={9}
              strokeWidth={3}
              className={`transition-transform duration-150 ${filterOpen ? "rotate-180" : ""}`}
            />
          </button>
          <Link
            href="/transaksi"
            className="flex items-center gap-1 text-[9px] font-black text-foreground/50 hover:text-foreground uppercase tracking-widest transition-colors group"
          >
            {CONSTANT.all}
            <ChevronRight
              size={13}
              strokeWidth={3}
              className="group-hover:translate-x-0.5 transition-transform duration-100"
            />
          </Link>
        </div>
      </div>

      <div className="px-3.5 pb-2.5">
        <TabFilter
          value={typeFilter}
          onChange={setTypeFilter}
          options={TYPE_FILTER_OPTIONS}
          allLabel={CONSTANT.all.toUpperCase()}
          showAll={true}
        />
      </div>

      {/* Accordion limit */}
      {filterOpen && (
        <div className="px-3.5 pb-2.5 border-b-2 border-dashed border-border/40">
          <p className="text-[8px] font-black tracking-widest text-foreground/30 uppercase mb-1.5">
            {CONSTANT.show ?? "Tampilkan"}
          </p>
          <div className="flex items-center gap-1.5">
            {LIMIT_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onLimitChange?.(opt);
                  setFilterOpen(false);
                }}
                className={[
                  "text-[10px] font-black px-3 py-1 border-2 transition-all duration-75 active:brightness-90",
                  limit === opt
                    ? "border-border bg-foreground text-background shadow-none translate-x-[1px] translate-y-[1px]"
                    : "border-border bg-card text-foreground shadow-[2px_2px_0px_hsl(var(--border))] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none",
                ].join(" ")}
              >
                {opt}
              </button>
            ))}
            <span className="text-[8px] font-bold text-foreground/30 ml-1">
              {CONSTANT.transaction.toLowerCase()}
            </span>
          </div>
        </div>
      )}

      <div className="border-t-[1.5px] border-dashed border-border/40" />

      {/* List */}
      <div className="max-h-[350px] overflow-y-auto px-3.5">
        {loading ? (
          Array.from({ length: limit }).map((_, i) => <SkeletonRow key={i} />)
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center">
            <span className="text-[10px] font-black text-foreground/30 tracking-widest uppercase">
              {CONSTANT.noData}
            </span>
          </div>
        ) : (
          filtered.map((txn, idx) => (
            <TransactionRow
              key={txn.id}
              txn={txn}
              idx={idx}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <div className="shrink-0 border-t-[1.5px] border-dashed border-border/40 mx-3.5 mt-1 mb-3.5 pt-2.5 flex items-center justify-between">
          <span className="text-[8px] font-black text-foreground/30 tracking-widest uppercase">
            {filtered.length} {CONSTANT.transaction.toLowerCase()}{" "}
            {CONSTANT.shown ?? "ditampilkan"}
          </span>
        </div>
      )}
    </div>
  );
};

export default RecentTransactionsCard;
