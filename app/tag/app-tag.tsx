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
import { useTagStore, type Tag } from "./store/tag-store";
import TabelTag from "./components/table-tag";
import ModalTambahTag from "./components/modal-tambah-tag";

const AppTag = () => {
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
  } = useTagStore();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await get<{ tags: Tag[] }>("/tags");
      setList(res.tags);
    } catch (err) {
      setError(true);
      toast.error("Gagal memuat tag", getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [setList, setLoading, setError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (item: Tag) => {
    const ok = await confirm.show({
      title: "Hapus Tag?",
      message: `"#${item.name}" akan dihapus permanen.`,
      confirmLabel: "HAPUS",
      cancelLabel: "BATAL",
      variant: "danger",
    });
    if (!ok) return;
    try {
      await del(`/tags/${item.id}`);
      toast.success("Tag dihapus");
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
              <h1 className="text-lg font-black tracking-tight">TAG</h1>
              <p className="text-[11px] font-medium">
                Kelola label untuk transaksi kamu
              </p>
            </div>
          }
          rightComponent={
            <Button
              size="sm"
              leftIcon={<Plus size={12} />}
              onClick={openCreate}
              label="TAMBAH TAG"
            />
          }
        />

        <div className="mb-4 h-0.5 bg-[#1a1a1a]" />

        <TabelTag onEdit={openEdit} onDelete={handleDelete} />

        <ChildModalWrapper
          open={modalOpen}
          onClose={closeModal}
          title={editTarget ? "EDIT TAG" : "TAMBAH TAG"}
          subtitle={editTarget ? "UBAH DETAIL TAG" : "ISI DETAIL TAG BARU"}
          width="sm"
        >
          <ModalTambahTag
            onClose={closeModal}
            onSuccess={fetchData}
            editTarget={editTarget}
          />
        </ChildModalWrapper>
      </div>
    </div>
  );
};

export default AppTag;
