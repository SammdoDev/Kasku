"use client";

import Link from "next/link";
import { useRef, useCallback, useState } from "react";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import formatIDR from "@/lib/helper/currency-format";
import { ChevronRight, ChevronDown, SlidersHorizontal } from "lucide-react";
import { OpenmojiImg } from "@/app/kategori/components/emoji-picker";
import { confirm } from "@/components/layout/for-pages/confirm-dialog";
import { formatRelativeDate } from "@/lib/helper/date-format";
import TabFilter from "@/components/ui/input-component/tab-filter.tsx/tab-filter";

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
  transfer_pair_id?: string | null; // ✅ tambah field ini
}

type Props = {
  transactions: RecentTransaction[];
  loading?: boolean;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  onDelete?: (id: string) => Promise<void> | void;
};

const LIMIT_OPTIONS = [5, 10, 20, 50];

const TYPE_FILTER_OPTIONS = [
  { label: "PEMASUKAN", value: "income" },
  { label: "PENGELUARAN", value: "expense" },
  { label: "TRANSFER", value: "transfer" },
];

function resolveHexcode(icon: string | null): string {
  if (icon && icon.trim().length > 0) return icon;
  return "1F4AC";
}

const SkeletonRow = () => (
  <div className="flex items-center gap-3 py-2.5 animate-pulse">
    <div className="w-9 h-9 shrink-0 bg-gray-100 border-[2px] border-[#e5e5e5]" />
    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
      <div className="h-2.5 w-32 bg-gray-200" />
      <div className="h-2 w-20 bg-gray-100" />
    </div>
    <div className="h-3 w-16 bg-gray-200 shrink-0" />
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
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startPress = useCallback(() => {
    if (!onDelete) return;
    timer.current = setTimeout(async () => {
      const ok = await confirm.show({
        title: "Hapus Transaksi?",
        message: `"${txn.description}" akan dihapus permanen.`,
        confirmLabel: "HAPUS",
        cancelLabel: "BATAL",
        variant: "danger",
      });
      if (ok) await onDelete(txn.id);
    }, 500);
  }, [txn, onDelete]);

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
      {idx > 0 && <div className="border-t border-[#f0f0f0]" />}
      <div className="flex items-center gap-3 py-2.5">
        <div
          className="w-9 h-9 shrink-0 border-2 flex items-center justify-center select-none shadow-[2px_2px_0px_#1a1a1a]"
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
          <p className="text-[11px] font-extrabold text-[#1a1a1a] truncate leading-tight">
            {txn.description}
          </p>
          <p className="text-[9px] text-[#999] font-bold mt-0.5 flex items-center gap-1 flex-wrap leading-tight">
            <span className="truncate max-w-[80px]">
              {txn.category_name ?? "—"}
            </span>
            <span className="text-[#ddd]">·</span>
            <span>{formatRelativeDate(txn.date)}</span>
            {txn.payment_method_name && (
              <>
                <span className="text-[#ddd]">·</span>
                <span className="truncate max-w-[60px] text-[#aaa]">
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
              ? "text-[#4338ca]"
              : isIncome
                ? "text-[#166534]"
                : "text-[#991b1b]",
          ].join(" ")}
        >
          {isTransfer ? "⇄" : isIncome ? "+" : "-"}
          {formatIDR(txn.amount)}
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
  const [filterOpen, setFilterOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");

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
      className="border-[2.5px] h-full border-[#1a1a1a] bg-white shadow-brutal-lg flex flex-col"
      style={{ fontFamily: DASHBOARD_FONT }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 pt-3.5 pb-2">
        <span className="text-[10px] font-black tracking-[0.3px] text-[#1a1a1a] uppercase">
          Transaksi Terkini
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            className={[
              "flex items-center gap-1 text-[9px] font-black uppercase tracking-widest transition-colors px-1.5 py-0.5 border",
              filterOpen
                ? "border-black bg-black text-white"
                : "border-black/20 text-[#555] hover:border-black hover:text-black",
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
            className="flex items-center gap-1 text-[9px] font-black text-[#555] hover:text-black uppercase tracking-widest transition-colors group"
          >
            Semua
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
          allLabel="SEMUA"
          showAll={true}
        />
      </div>

      {/* Accordion limit */}
      {filterOpen && (
        <div className="px-3.5 pb-2.5 border-b-2 border-dashed border-[#e5e5e5]">
          <p className="text-[8px] font-black tracking-widest text-[#bbb] uppercase mb-1.5">
            Tampilkan
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
                    ? "border-black bg-[#1a1a1a] text-white shadow-none translate-x-[1px] translate-y-[1px]"
                    : "border-black bg-white text-black shadow-[2px_2px_0px_#1a1a1a] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none",
                ].join(" ")}
              >
                {opt}
              </button>
            ))}
            <span className="text-[8px] font-bold text-[#bbb] ml-1">
              transaksi
            </span>
          </div>
        </div>
      )}

      <div className="border-t-[1.5px] border-dashed border-[#e5e5e5]" />

      {/* List */}
      <div className="max-h-[350px] overflow-y-auto px-3.5">
        {loading ? (
          Array.from({ length: limit }).map((_, i) => <SkeletonRow key={i} />)
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center">
            <span className="text-[10px] font-black text-[#bbb] tracking-widest uppercase">
              Belum ada transaksi
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
        <div className="shrink-0 border-t-[1.5px] border-dashed border-[#e5e5e5] mx-3.5 mt-1 mb-3.5 pt-2.5 flex items-center justify-between">
          <span className="text-[8px] font-black text-[#bbb] tracking-widest uppercase">
            {filtered.length} transaksi ditampilkan
          </span>
        </div>
      )}
    </div>
  );
};

export default RecentTransactionsCard;
