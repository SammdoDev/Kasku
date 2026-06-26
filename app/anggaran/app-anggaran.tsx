"use client";

import { useCallback, useEffect } from "react";
import { get, del, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import { confirm } from "@/components/layout/for-pages/confirm-dialog";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button-component/button";
import PageLeftRightWrapper from "@/components/layout/for-pages/page-left-right-wrapper";
import ChildModalWrapper from "@/components/layout/for-pages/child-modal-wrapper";
import { useAnggaranStore, type Anggaran } from "./store/anggaran-store";
import ModalTambahAnggaran from "./components/modal-tambah-anggaran";
import TabelAnggaran from "./components/table-anggaran";

const AppAnggaran = () => {
  const {
    editTarget,
    modalOpen,
    openCreate,
    openEdit,
    closeModal,
    setList,
    setLoading,
    setError,
    remove,
  } = useAnggaranStore();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await get<{ budgets: Anggaran[] }>("/budgets");
      setList(res.budgets);
    } catch (err) {
      setError(true);
      toast.error("Gagal memuat anggaran", getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [setList, setLoading, setError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (item: Anggaran) => {
    const ok = await confirm.show({
      title: "Hapus Anggaran?",
      message: `"${item.name}" akan dihapus permanen.`,
      confirmLabel: "HAPUS",
      cancelLabel: "BATAL",
      variant: "danger",
    });
    if (!ok) return;
    try {
      await del(`/budgets/${item.id}`);
      toast.success("Anggaran dihapus");
      remove(item.id);
    } catch (err) {
      toast.error("Gagal menghapus", getApiError(err));
    }
  };

  return (
    <div
      className="card md:m-4 p-4 md:p-6"
      style={{ fontFamily: DASHBOARD_FONT, background: "transparent" }}
    >
      <div className="px-4 pt-4 flex flex-col gap-4">
        <PageLeftRightWrapper
          className="mb-5"
          leftComponent={
            <div>
              <h1 className="text-lg font-black tracking-tight">ANGGARAN</h1>
              <p className="text-[11px] text-foreground/40 font-medium">
                Kelola batas pengeluaran kamu per kategori
              </p>
            </div>
          }
          rightComponent={
            <Button
              size="sm"
              leftIcon={<Plus size={12} />}
              onClick={openCreate}
              label="TAMBAH ANGGARAN"
            />
          }
        />

        <TabelAnggaran onEdit={openEdit} onDelete={handleDelete} />

        <ChildModalWrapper
          open={modalOpen}
          onClose={closeModal}
          title={editTarget ? "EDIT ANGGARAN" : "TAMBAH ANGGARAN"}
          subtitle={
            editTarget ? "UBAH DETAIL ANGGARAN" : "ISI DETAIL ANGGARAN BARU"
          }
          width="sm"
        >
          <ModalTambahAnggaran
            onClose={closeModal}
            onSuccess={fetchData}
            editTarget={editTarget}
          />
        </ChildModalWrapper>
      </div>
    </div>
  );
};

export default AppAnggaran;
