"use client";

import React, { useCallback, useEffect, useState } from "react";
import { get, del, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import formatIDR from "@/lib/helper/currency-format";
import {
  useTransaksiStore,
  type Transaction,
  type TransactionListResponse,
} from "./store/transaksi-store";
import { useMonthFilter } from "@/components/ui/input-component/month-filter/store/month-filter-store";
import TabelTransaksi from "./components/table-transaksi";
import FilterTransaksi from "./components/filter-transaksi";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import ChildModalWrapper from "@/components/layout/for-pages/child-modal-wrapper";
import ModalTambahTransaksi from "./components/modal-tambah-transaksi";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";

// ─── helpers ─────────────────────────────────────────────────────
function buildQuery(
  filter: ReturnType<typeof useTransaksiStore.getState>["filter"],
) {
  const p = new URLSearchParams();
  p.set("month", filter.month);
  p.set("page", String(filter.page));
  if (filter.type !== "all") p.set("type", filter.type);
  if (filter.category_id) p.set("category_id", filter.category_id);
  if (filter.tag_id) p.set("tag_id", filter.tag_id);
  if (filter.search) p.set("search", filter.search);
  return p.toString();
}

// ─── SummaryBadge ─────────────────────────────────────────────────
function SummaryBadge({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: "income" | "expense" | "net";
}) {
  const cfg = {
    income: {
      icon: <TrendingUp size={10} />,
      cls: "border-emerald-600 text-emerald-700 bg-emerald-50",
    },
    expense: {
      icon: <TrendingDown size={10} />,
      cls: "border-red-500 text-red-600 bg-red-50",
    },
    net: {
      icon: <Minus size={10} />,
      cls:
        value >= 0
          ? "border-[#1a1a1a] text-[#1a1a1a] bg-white"
          : "border-red-500 text-red-600 bg-red-50",
    },
  }[variant];
  return (
    <div
      className={`inline-flex items-center gap-2 border-2 px-3 py-1.5 font-mono ${cfg.cls}`}
    >
      {cfg.icon}
      <span className="text-[9px] font-black tracking-widest">{label}</span>
      <span className="text-[11px] font-black">{formatIDR(value)}</span>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────
function Pagination({
  meta,
  onPageChange,
}: {
  meta: { page: number; last_page: number; total: number };
  onPageChange: (p: number) => void;
}) {
  const pages = Array.from({ length: meta.last_page }, (_, i) => i + 1)
    .filter(
      (p) => p === 1 || p === meta.last_page || Math.abs(p - meta.page) <= 1,
    )
    .reduce<(number | "…")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
      acc.push(p);
      return acc;
    }, []);

  const base =
    "min-w-[32px] h-[32px] flex items-center justify-center text-[10px] font-black font-mono border-t-2 border-b-2 border-l-2 border-[#1a1a1a] transition-colors duration-100";

  return (
    <div className="flex flex-col gap-2 mt-4 pt-3 border-t-2 border-dashed border-[#e0e0e0] sm:flex-row sm:items-center sm:justify-between">
      <span className="text-[9px] font-bold tracking-widest text-[#999] font-mono">
        HAL {meta.page} / {meta.last_page} · {meta.total} DATA
      </span>
      {/* Pagination buttons — scrollable on very small screens */}
      <div className="overflow-x-auto">
        <div className="inline-flex">
          <button
            disabled={meta.page <= 1}
            onClick={() => onPageChange(meta.page - 1)}
            className={`${base} disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1a1a1a] hover:text-white`}
          >
            ←
          </button>
          {pages.map((p, i) =>
            p === "…" ? (
              <span
                key={`e${i}`}
                className={`${base} cursor-default text-[#aaa]`}
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                className={`${base} ${
                  meta.page === p
                    ? "bg-[#1a1a1a] text-white"
                    : "bg-white text-[#1a1a1a] hover:bg-[#f0f0f0]"
                }`}
              >
                {p}
              </button>
            ),
          )}
          <button
            disabled={meta.page >= meta.last_page}
            onClick={() => onPageChange(meta.page + 1)}
            className={`${base} border-r-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1a1a1a] hover:text-white`}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AppTransaksi ─────────────────────────────────────────────────
const AppTransaksi = () => {
  const filter = useTransaksiStore((s) => s.filter);
  const meta = useTransaksiStore((s) => s.meta);
  const summary = useTransaksiStore((s) => s.summary);
  const loading = useTransaksiStore((s) => s.loading);
  const setList = useTransaksiStore((s) => s.setList);
  const setLoading = useTransaksiStore((s) => s.setLoading);
  const setError = useTransaksiStore((s) => s.setError);
  const setFilter = useTransaksiStore((s) => s.setFilter);
  const openEdit = useTransaksiStore((s) => s.openEdit);
  const removeTransaction = useTransaksiStore((s) => s.removeTransaction);

  const { monthLabel } = useMonthFilter();
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await get<TransactionListResponse>(
        `/transactions?${buildQuery(filter)}`,
      );
      setList(res);
    } catch (err) {
      setError(true);
      toast.error("Gagal memuat transaksi", getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [filter, setList, setLoading, setError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (t: Transaction) => {
    if (!confirm(`Hapus transaksi "${t.description}"?`)) return;
    try {
      await del(`/transactions/${t.id}`);
      toast.success("Transaksi dihapus");
      removeTransaction(t.id);
    } catch (err) {
      toast.error("Gagal menghapus", getApiError(err));
    }
  };

  return (
    <div
      className="card w-full px-4 py-4 sm:px-6 sm:py-6 font-mono h-full"
      style={{ fontFamily: DASHBOARD_FONT }}
    >
      {/* ── Header ── */}
      <div className="flex flex-col gap-2 mb-5 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-3">
        <div>
          <h1 className="text-xl font-black tracking-[0.12em] leading-none text-[#1a1a1a]">
            TRANSAKSI
          </h1>
          <p className="mt-1.5 text-[9px] tracking-[0.2em] text-[#999] font-mono">
            {loading
              ? "MEMUAT DATA..."
              : `${meta?.total ?? 0} TRANSAKSI · ${monthLabel.toUpperCase()}`}
          </p>
        </div>

        {/* Summary badges — scroll horizontal kalau terlalu sempit */}
        {!loading && summary && (
          <div className="flex flex-wrap gap-1.5">
            <SummaryBadge
              label="MASUK"
              value={summary.total_income}
              variant="income"
            />
            <SummaryBadge
              label="KELUAR"
              value={summary.total_expense}
              variant="expense"
            />
            <SummaryBadge label="NET" value={summary.net} variant="net" />
          </div>
        )}
      </div>

      <div className="mb-4 h-0.5 bg-[#1a1a1a]" />

      <div className="mb-5">
        <FilterTransaksi onOpenCreate={() => setModalOpen(true)} />
      </div>

      <TabelTransaksi onEdit={openEdit} onDelete={handleDelete} />

      {!loading && meta && meta.last_page > 1 && (
        <Pagination meta={meta} onPageChange={(page) => setFilter({ page })} />
      )}

      <ChildModalWrapper
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="TAMBAH TRANSAKSI"
        subtitle="ISI DETAIL TRANSAKSI BARU"
        width="md"
      >
        <ModalTambahTransaksi
          onClose={() => setModalOpen(false)}
          onSuccess={fetchData}
        />
      </ChildModalWrapper>
    </div>
  );
};

export default AppTransaksi;
