"use client";

import React, { useCallback, useEffect, useState } from "react";
import { get, del, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import {
  useTransaksiStore,
  type Transaction,
  type TransactionListResponse,
} from "./store/transaksi-store";
import { useMonthFilter } from "@/components/ui/input-component/month-filter/store/month-filter-store";
import TabelTransaksi from "./components/table-transaksi";
import { Plus } from "lucide-react";
import ChildModalWrapper from "@/components/layout/for-pages/child-modal-wrapper";
import ModalTambahTransaksi from "./components/modal-tambah-transaksi";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import { confirm } from "../../components/layout/for-pages/confirm-dialog";
import TabFilter from "@/components/ui/input-component/tab-filter.tsx/tab-filter";
import PageLeftRightWrapper from "@/components/layout/for-pages/page-left-right-wrapper";
import { Button } from "@/components/ui/button-component/button";
import {
  SummaryCardsDesktop,
  SummaryHeaderMobile,
} from "@/components/ui/card/summary-header";

const TYPE_FILTER_OPTIONS = [
  { label: "KELUAR", value: "expense" },
  { label: "MASUK", value: "income" },
];

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

  const { monthLabel, prevMonth, nextMonth } = useMonthFilter();
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
    const ok = await confirm.show({
      title: "Hapus Transaksi?",
      message: `"${t.description}" akan dihapus permanen.`,
      confirmLabel: "HAPUS",
      cancelLabel: "BATAL",
      variant: "danger",
    });
    if (!ok) return;
    try {
      await del(`/transactions/${t.id}`);
      toast.success("Transaksi dihapus");
      removeTransaction(t.id);
    } catch (err) {
      toast.error("Gagal menghapus", getApiError(err));
    }
  };

  const handleOpenTambah = () => setModalOpen(true);

  const summaryForHeader = summary
    ? { ...summary, balance: summary.net }
    : null;

  const headerProps = {
    monthLabel,
    summary: summaryForHeader,
    loading,
    onPrev: prevMonth,
    onNext: nextMonth,
  };

  return (
    <div
      className="card md:m-4 p-4 md:p-6"
      style={{ fontFamily: DASHBOARD_FONT, background: "transparent" }}
    >
      <div className="lg:hidden mb-4">
        <SummaryHeaderMobile {...headerProps} />
      </div>

      <div className="hidden lg:block mb-4">
        <SummaryCardsDesktop {...headerProps} />
      </div>

      <div className="mb-4 h-0.5 bg-[#1a1a1a]" />

      <PageLeftRightWrapper
        className="mb-5"
        leftComponent={
          <TabFilter
            value={filter.type === "all" ? "" : filter.type}
            onChange={(v) =>
              setFilter({
                type: (v || "all") as "all" | "income" | "expense",
                page: 1,
              })
            }
            options={TYPE_FILTER_OPTIONS}
            allLabel="SEMUA"
          />
        }
        rightComponent={
          <Button
            size="sm"
            leftIcon={<Plus size={12} />}
            onClick={handleOpenTambah}
            label="TAMBAH TRANSAKSI"
            className="w-full sm:w-auto"
          />
        }
      />

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
