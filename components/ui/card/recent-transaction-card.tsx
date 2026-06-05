"use client";

import Link from "next/link";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import formatIDR from "@/lib/helper/currency-format";
import { ArrowRight } from "lucide-react";

export interface RecentTransaction {
  id: string;
  date: string; // ISO string
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
};

// Emoji fallback sama seperti CategorySpendCard
const ICON_FALLBACK_MAP: [string[], string][] = [
  [["makan", "food", "resto", "kuliner"], "🍔"],
  [["transport", "bensin", "ojek", "grab", "gojek"], "🚗"],
  [["belanja", "shop", "fashion", "pakaian"], "🛍️"],
  [["listrik", "air", "tagihan", "utility", "pulsa", "internet"], "💡"],
  [["kesehatan", "obat", "dokter", "medis"], "💊"],
  [["hiburan", "nonton", "game", "streaming"], "🎮"],
  [["pendidikan", "kursus", "buku", "sekolah"], "📚"],
  [["investasi", "tabungan", "nabung"], "💰"],
  [["rumah", "kos", "sewa", "kontrakan"], "🏠"],
  [["gaji", "salary", "pendapatan"], "💼"],
  [["lainnya", "other"], "📦"],
];

function resolveIcon(icon: string | null, name: string | null): string {
  if (icon && icon.trim().length > 0) return icon;
  if (!name) return "📦";
  const lower = name.toLowerCase();
  for (const [keys, emoji] of ICON_FALLBACK_MAP) {
    if (keys.some((k) => lower.includes(k))) return emoji;
  }
  return "📦";
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

// Skeleton row
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

const RecentTransactionsCard = ({
  transactions,
  loading = false,
  limit = 5,
}: Props) => {
  const items = transactions.slice(0, limit);

  return (
    <div
      className="border-[2.5px] border-[#1a1a1a] bg-white p-3.5"
      style={{ fontFamily: DASHBOARD_FONT }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-black tracking-[0.3px] text-[#1a1a1a] uppercase">
          Transaksi Terkini
        </span>
        <Link
          href="/transaksi"
          className="flex items-center gap-1 text-[9px] font-black text-[#555] hover:text-black uppercase tracking-widest transition-colors group"
        >
          Lihat Semua
          <ArrowRight
            size={10}
            strokeWidth={3}
            className="group-hover:translate-x-[2px] transition-transform duration-100"
          />
        </Link>
      </div>

      {/* Divider */}
      <div className="border-t-[1.5px] border-dashed border-[#e5e5e5] mb-1" />

      {/* Rows */}
      <div className="flex flex-col">
        {loading ? (
          Array.from({ length: limit }).map((_, i) => <SkeletonRow key={i} />)
        ) : items.length === 0 ? (
          <div className="py-8 text-center">
            <span className="text-2xl block mb-2" aria-hidden="true">
              📭
            </span>
            <span className="text-[10px] font-black text-[#bbb] tracking-widest uppercase">
              Belum ada transaksi
            </span>
          </div>
        ) : (
          items.map((txn, idx) => {
            const icon = resolveIcon(txn.category_icon, txn.category_name);
            const isIncome = txn.type === "income";
            const bgColor = txn.category_color
              ? `${txn.category_color}22`
              : isIncome
                ? "#bbf7d033"
                : "#fca5a533";
            const borderColor =
              txn.category_color ?? (isIncome ? "#bbf7d0" : "#fca5a5");

            return (
              <div key={txn.id}>
                {idx > 0 && <div className="border-t-[1px] border-[#f0f0f0]" />}
                <div className="flex items-center gap-3 py-2.5">
                  {/* Icon */}
                  <div
                    className="w-9 h-9 shrink-0 border-[2px] border-[#1a1a1a] flex items-center justify-center text-[15px] select-none shadow-[2px_2px_0px_#1a1a1a]"
                    style={{ background: bgColor, borderColor }}
                    aria-hidden="true"
                  >
                    {icon}
                  </div>

                  {/* Info */}
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

                  {/* Amount */}
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
          })
        )}
      </div>

      {/* Footer total jika ada data */}
      {!loading && items.length > 0 && (
        <>
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
        </>
      )}
    </div>
  );
};

export default RecentTransactionsCard;
