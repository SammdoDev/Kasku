// src/app/(pages)/kategori/app-kategori.tsx
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

const TYPE_FILTER_OPTIONS = [
  { label: "KELUAR", value: "expense" },
  { label: "MASUK", value: "income" },
];

const AppKategori = () => {
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterType !== "all" ? `?type=${filterType}` : "";
      const res = await get<{ categories: Category[] }>(`/categories${params}`);
      setList(res.categories);
    } catch (err) {
      setError(true);
      toast.error("Gagal memuat kategori", getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [filterType, setList, setLoading, setError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (cat: Category) => {
    openEdit(cat);
    setModalOpen(true);
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Hapus kategori "${cat.name}"?`)) return;
    try {
      await del(`/categories/${cat.id}`);
      toast.success("Kategori dihapus");
      removeCategory(cat.id);
    } catch (err) {
      toast.error("Gagal menghapus", getApiError(err));
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
      <div className="flex flex-col gap-2 mb-5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div>
          <h1 className="text-xl font-black tracking-[0.12em] leading-none text-[#1a1a1a]">
            KATEGORI
          </h1>
          <p className="mt-1.5 text-[9px] tracking-[0.2em] text-[#999] font-mono">
            {loading
              ? "MEMUAT DATA..."
              : `${list.length} KATEGORI · ${incomeCount} MASUK · ${expenseCount} KELUAR`}
          </p>
        </div>

        {!loading && (
          <div className="flex flex-wrap gap-1.5">
            <div className="inline-flex items-center gap-2 border-2 border-emerald-600 text-emerald-700 bg-emerald-50 px-3 py-1.5">
              <span className="text-[9px] font-black tracking-widest">
                MASUK
              </span>
              <span className="text-[13px] font-black">{incomeCount}</span>
            </div>
            <div className="inline-flex items-center gap-2 border-2 border-red-500 text-red-600 bg-red-50 px-3 py-1.5">
              <span className="text-[9px] font-black tracking-widest">
                KELUAR
              </span>
              <span className="text-[13px] font-black">{expenseCount}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mb-4 h-0.5 bg-[#1a1a1a]" />

      <PageLeftRightWrapper
        leftComponent={
          <TabFilter
            value={filterType === "all" ? "" : filterType}
            onChange={(v) =>
              setFilterType((v || "all") as "all" | "income" | "expense")
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
            label="TAMBAH KATEGORI"
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
            ? "EDIT KATEGORI"
            : "TAMBAH KATEGORI"
        }
        subtitle="ISI DETAIL KATEGORI"
        width="md"
      >
        <ModalKategori onClose={handleClose} onSuccess={fetchData} />
      </ChildModalWrapper>
    </div>
  );
};

export default AppKategori;
