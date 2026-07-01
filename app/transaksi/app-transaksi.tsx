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
import { useTranslate } from "@/lib/i18n/use-translate";

interface DashboardSummary {
  balance: number;
  total_income: number;
  total_expense: number;
  net: number;
}

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

const AppTransaksi = () => {
  const CONSTANT = useTranslate();
  const filter = useTransaksiStore((s) => s.filter);
  const loading = useTransaksiStore((s) => s.loading);
  const setList = useTransaksiStore((s) => s.setList);
  const setLoading = useTransaksiStore((s) => s.setLoading);
  const setError = useTransaksiStore((s) => s.setError);
  const setFilter = useTransaksiStore((s) => s.setFilter);
  const openEdit = useTransaksiStore((s) => s.openEdit);
  const openCreate = useTransaksiStore((s) => s.openCreate);
  const closeModal = useTransaksiStore((s) => s.closeModal);
  const modalOpen = useTransaksiStore((s) => s.modalOpen);
  const editingTransaction = useTransaksiStore((s) => s.editingTransaction);
  const removeTransaction = useTransaksiStore((s) => s.removeTransaction);
  const { month, cycleStart } = useMonthFilter();

  const [dashSummary, setDashSummary] = useState<DashboardSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const TYPE_FILTER_OPTIONS = [
    { label: CONSTANT.expense.toUpperCase(), value: "expense" },
    { label: CONSTANT.income.toUpperCase(), value: "income" },
  ];

  const fetchSummary = useCallback(async (m: string) => {
    setSummaryLoading(true);
    try {
      const res = await get<{ summary: DashboardSummary }>(
        `/dashboard?month=${m}`,
      );
      setDashSummary(res.summary);
    } catch {
      // silent — list tetap jalan
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await get<TransactionListResponse>(
        `/transactions?${buildQuery(filter)}`,
      );
      setList(res);
    } catch (err) {
      setError(true);
      toast.error(CONSTANT.failedLoadSummary, getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [filter, setList, setLoading, setError, CONSTANT]);

  useEffect(() => {
    fetchSummary(month);
  }, [month, cycleStart]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setFilter({ month, page: 1 });
  }, [month, cycleStart]);

  const handleDelete = async (t: Transaction) => {
    const ok = await confirm.show({
      title: `${CONSTANT.delete} ${CONSTANT.transaction}?`,
      message: `"${t.description}" ${CONSTANT.deleteConfirmSuffix ?? "akan dihapus permanen."}`,
      confirmLabel: CONSTANT.delete,
      cancelLabel: CONSTANT.cancel,
      variant: "danger",
    });
    if (!ok) return;
    try {
      await del(`/transactions/${t.id}`);
      toast.success(CONSTANT.success);
      removeTransaction(t.id);
      fetchSummary(month);
    } catch (err) {
      toast.error(CONSTANT.failedUpdate, getApiError(err));
    }
  };

  const headerProps = {
    summary: dashSummary,
    loading: loading || summaryLoading,
  };

  return (
    <div
      className="card md:m-4 p-4 md:p-6"
      style={{ fontFamily: DASHBOARD_FONT, background: "transparent" }}
    >
      <div className="px-4 pt-4 flex flex-col gap-4">
        <div className="lg:hidden mb-4">
          <SummaryHeaderMobile {...headerProps} />
        </div>
        <div className="hidden lg:block mb-4">
          <SummaryCardsDesktop {...headerProps} />
        </div>

        <div className="mb-4 h-0.5 bg-border" />

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
              allLabel={CONSTANT.all.toUpperCase()}
            />
          }
          rightComponent={
            <Button
              size="sm"
              leftIcon={<Plus size={12} />}
              onClick={() => openCreate()}
              label={`${CONSTANT.add} ${CONSTANT.transaction}`.toUpperCase()}
              className="w-full sm:w-auto"
            />
          }
        />

        <TabelTransaksi onEdit={openEdit} onDelete={handleDelete} />

        <ChildModalWrapper
          open={modalOpen}
          onClose={closeModal}
          title={
            editingTransaction
              ? `${CONSTANT.edit} ${CONSTANT.transaction}`.toUpperCase()
              : `${CONSTANT.add} ${CONSTANT.transaction}`.toUpperCase()
          }
          subtitle={
            editingTransaction
              ? "EDIT DETAIL TRANSAKSI"
              : (CONSTANT.transactionAddSubtitle ?? "ISI DETAIL TRANSAKSI BARU")
          }
          width="full"
        >
          <ModalTambahTransaksi onClose={closeModal} onSuccess={fetchData} />
        </ChildModalWrapper>
      </div>
    </div>
  );
};

export default AppTransaksi;
