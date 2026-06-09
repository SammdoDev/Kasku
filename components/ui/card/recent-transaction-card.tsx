"use client";

import Link from "next/link";
import { useRef, useCallback } from "react";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import formatIDR from "@/lib/helper/currency-format";
import { ChevronRight } from "lucide-react";
import { OpenmojiImg } from "@/app/kategori/components/emoji-picker";
import { confirm } from "@/components/layout/for-pages/confirm-dialog";

export interface RecentTransaction {
  id: string;
  date: string;
  description: string;
  category_name: string | null;
  category_icon: string | null;
  category_color: string | null;
  amount: number;
  type: "income" | "expense";
}

type Props = {
  transactions: RecentTransaction[];
  loading?: boolean;
  limit?: number;
  onDelete?: (id: string) => Promise<void> | void;
};

function resolveHexcode(icon: string | null): string {
  if (icon && icon.trim().length > 0) return icon;
  return "1F4AC";
}

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) return "Hari ini";
  if (sameDay(date, yesterday)) return "Kemarin";
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
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

// ─── TransactionRow ───────────────────────────────────────────────
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

  const hexcode = resolveHexcode(txn.category_icon);
  const isIncome = txn.type === "income";
  const bgColor = txn.category_color
    ? `${txn.category_color}22`
    : isIncome
      ? "#bbf7d033"
      : "#fca5a533";
  const borderColor = txn.category_color ?? (isIncome ? "#bbf7d0" : "#fca5a5");

  return (
    <div
      key={txn.id}
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
          <p className="text-[9px] text-[#999] font-bold mt-0.5">
            {txn.category_name ?? "—"}
            <span className="mx-1 text-[#ddd]">·</span>
            {formatRelativeDate(txn.date)}
          </p>
        </div>

        <span
          className={[
            "text-[12px] font-black shrink-0 tabular-nums",
            isIncome ? "text-[#166534]" : "text-[#991b1b]",
          ].join(" ")}
        >
          {isIncome ? "+" : "-"}
          {formatIDR(txn.amount)}
        </span>
      </div>
    </div>
  );
}

// ─── RecentTransactionsCard ───────────────────────────────────────
const RecentTransactionsCard = ({
  transactions,
  loading = false,
  limit = 5,
  onDelete,
}: Props) => {
  const items = transactions.slice(0, limit);

  return (
    <div
      className="border-[2.5px] h-full border-[#1a1a1a] bg-white p-3.5 shadow-brutal-lg"
      style={{ fontFamily: DASHBOARD_FONT }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-black tracking-[0.3px] text-[#1a1a1a] uppercase">
          Transaksi Terkini
        </span>
        <Link
          href="/transaksi"
          className="flex items-center gap-1 text-[9px] font-black text-[#555] hover:text-black uppercase tracking-widest transition-colors group"
        >
          Lihat Semua
          <ChevronRight
            size={13}
            strokeWidth={3}
            className="group-hover:translate-x-0.5 transition-transform duration-100"
          />
        </Link>
      </div>

      <div className="border-t-[1.5px] border-dashed border-[#e5e5e5] mb-1" />

      <div className="flex flex-col">
        {loading ? (
          Array.from({ length: limit }).map((_, i) => <SkeletonRow key={i} />)
        ) : items.length === 0 ? (
          <div className="py-8 text-center">
            <span className="text-[10px] font-black text-[#bbb] tracking-widest uppercase">
              Belum ada transaksi
            </span>
          </div>
        ) : (
          items.map((txn, idx) => (
            <TransactionRow
              key={txn.id}
              txn={txn}
              idx={idx}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      {!loading && items.length > 0 && (
        <div className="border-t-[1.5px] border-dashed border-[#e5e5e5] mt-1 pt-2.5 flex items-center justify-between">
          <span className="text-[8px] font-black text-[#bbb] tracking-widest uppercase">
            {items.length} transaksi ditampilkan
          </span>
          <Link
            href="/transaksi"
            className="text-[8px] font-black text-[#555] hover:text-black uppercase tracking-widest underline underline-offset-2 decoration-[#ddd] hover:decoration-black transition-colors"
          >
            Semua Transaksi →
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentTransactionsCard;
