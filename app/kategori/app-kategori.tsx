"use client";

import React, { useCallback, useEffect, useState } from "react";
import { get, del, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import { useKategoriStore, type Category } from "./store/kategori-store";
import TabelKategori from "./components/table-kategori";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button-component/button";
import ChildModalWrapper from "@/components/layout/for-pages/child-modal-wrapper";
import ModalKategori from "./components/modal-kategori";
import TabFilter from "@/components/ui/input-component/tab-filter.tsx/tab-filter";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import PageLeftRightWrapper from "@/components/layout/for-pages/page-left-right-wrapper";
import { useTranslate } from "@/lib/i18n/use-translate";

const AppKategori = () => {
  const CONSTANT = useTranslate();

  const list = useKategoriStore((s) => s.list);
  const loading = useKategoriStore((s) => s.loading);
  const filterType = useKategoriStore((s) => s.filterType);
  const setList = useKategoriStore((s) => s.setList);
  const setLoading = useKategoriStore((s) => s.setLoading);
  const setError = useKategoriStore((s) => s.setError);
  const setFilterType = useKategoriStore((s) => s.setFilterType);
  const openEdit = useKategoriStore((s) => s.openEdit);
  const closeEdit = useKategoriStore((s) => s.closeEdit);
  const removeCategory = useKategoriStore((s) => s.removeCategory);

  const [modalOpen, setModalOpen] = useState(false);

  const TYPE_FILTER_OPTIONS = [
    { label: CONSTANT.expense.toUpperCase(), value: "expense" },
    { label: CONSTANT.income.toUpperCase(), value: "income" },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterType !== "all" ? `?type=${filterType}` : "";
      const res = await get<{ categories: Category[] }>(`/categories${params}`);
      setList(res.categories);
    } catch (err) {
      setError(true);
      toast.error(CONSTANT.failedLoadCategory, getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [filterType, setList, setLoading, setError, CONSTANT]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (cat: Category) => {
    openEdit(cat);
    setModalOpen(true);
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`${CONSTANT.delete} ${CONSTANT.category} "${cat.name}"?`)) return;
    try {
      await del(`/categories/${cat.id}`);
      toast.success(CONSTANT.categoryDeleted);
      removeCategory(cat.id);
    } catch (err) {
      toast.error(CONSTANT.failedDelete, getApiError(err));
    }
  };

  const handleClose = () => {
    setModalOpen(false);
    closeEdit();
  };

  const handleOpenTambah = () => {
    closeEdit();
    setModalOpen(true);
  };

  const incomeCount = list.filter((c) => c.type === "income").length;
  const expenseCount = list.filter((c) => c.type === "expense").length;

  return (
    <div
      className="card md:m-4 p-4 md:p-6"
      style={{ fontFamily: DASHBOARD_FONT, background: "transparent" }}
    >
      <div className="px-4 pt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-2 mb-5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div>
            <h1 className="text-xl font-black tracking-[0.12em] leading-none text-foreground">
              {CONSTANT.category.toUpperCase()}
            </h1>
            <p className="mt-1.5 text-[9px] tracking-[0.2em] text-foreground/40 font-mono">
              {loading
                ? CONSTANT.loading
                : `${list.length} ${CONSTANT.category.toUpperCase()} · ${incomeCount} ${CONSTANT.income.toUpperCase()} · ${expenseCount} ${CONSTANT.expense.toUpperCase()}`}
            </p>
          </div>
        </div>

        <div className="mb-4 h-0.5 bg-foreground" />

        <PageLeftRightWrapper
          leftComponent={
            <TabFilter
              value={filterType === "all" ? "" : filterType}
              onChange={(v) =>
                setFilterType((v || "all") as "all" | "income" | "expense")
              }
              options={TYPE_FILTER_OPTIONS}
              allLabel={CONSTANT.all.toUpperCase()}
            />
          }
          rightComponent={
            <Button
              size="sm"
              leftIcon={<Plus size={12} />}
              onClick={handleOpenTambah}
              label={`${CONSTANT.add.toUpperCase()} ${CONSTANT.category.toUpperCase()}`}
              className="w-full sm:w-auto"
            />
          }
        />

        <TabelKategori onEdit={handleEdit} onDelete={handleDelete} />

        <ChildModalWrapper
          open={modalOpen}
          onClose={handleClose}
          title={
            useKategoriStore.getState().editTarget
              ? `${CONSTANT.edit.toUpperCase()} ${CONSTANT.category.toUpperCase()}`
              : `${CONSTANT.add.toUpperCase()} ${CONSTANT.category.toUpperCase()}`
          }
          subtitle={CONSTANT.fillCategoryDetail.toUpperCase()}
          width="md"
        >
          <ModalKategori onClose={handleClose} onSuccess={fetchData} />
        </ChildModalWrapper>
      </div>
    </div>
  );
};

export default AppKategori;
