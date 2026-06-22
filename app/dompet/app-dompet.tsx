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
import { useDompetStore, type PaymentMethod } from "./store/dompet-store";
import ModalTambahDompet from "./components/modal-tambah-dompet";
import TabelDompet from "./components/table-dompet";
import { useTranslate } from "@/lib/i18n/use-translate";

const AppDompet = () => {
  const CONSTANT = useTranslate();
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
  } = useDompetStore();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await get<{ payment_methods: PaymentMethod[] }>(
        "/payment-methods",
      );
      setList(res.payment_methods);
    } catch (err) {
      setError(true);
      toast.error(CONSTANT.failedLoadProfile, getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [setList, setLoading, setError, CONSTANT]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (item: PaymentMethod) => {
    const ok = await confirm.show({
      title: `${CONSTANT.delete} ${CONSTANT.wallet}?`,
      message: `"${item.name}" ${CONSTANT.deleteConfirmSuffix ?? "akan dihapus permanen."}`,
      confirmLabel: CONSTANT.delete,
      cancelLabel: CONSTANT.cancel,
      variant: "danger",
    });
    if (!ok) return;
    try {
      await del(`/payment-methods/${item.id}`);
      toast.success(CONSTANT.walletDeleted ?? "Dompet dihapus");
      remove(item.id);
    } catch (err) {
      toast.error(CONSTANT.failedUpdate, getApiError(err));
    }
  };

  return (
    <div
      className="card md:m-4 p-4 md:p-6"
      style={{ fontFamily: DASHBOARD_FONT }}
    >
      <PageLeftRightWrapper
        className="mb-5"
        leftComponent={
          <div>
            <h1 className="text-lg font-black tracking-tight">
              {CONSTANT.wallet.toUpperCase()}
            </h1>
            <p className="text-[11px] text-foreground/50 font-medium">
              {CONSTANT.walletSubtitle ?? "Kelola metode pembayaran kamu"}
            </p>
          </div>
        }
        rightComponent={
          <Button
            size="sm"
            leftIcon={<Plus size={12} />}
            onClick={openCreate}
            label={`${CONSTANT.add} ${CONSTANT.wallet}`.toUpperCase()}
          />
        }
      />

      <div className="mb-4 h-0.5 bg-border" />

      <TabelDompet onEdit={openEdit} onDelete={handleDelete} />

      <ChildModalWrapper
        open={modalOpen}
        onClose={closeModal}
        title={
          editTarget
            ? `${CONSTANT.edit} ${CONSTANT.wallet}`.toUpperCase()
            : `${CONSTANT.add} ${CONSTANT.wallet}`.toUpperCase()
        }
        subtitle={
          editTarget
            ? (CONSTANT.walletEditSubtitle ?? "UBAH DETAIL DOMPET")
            : (CONSTANT.walletAddSubtitle ?? "ISI DETAIL DOMPET BARU")
        }
        width="sm"
      >
        <ModalTambahDompet
          onClose={closeModal}
          onSuccess={fetchData}
          editTarget={editTarget}
        />
      </ChildModalWrapper>
    </div>
  );
};

export default AppDompet;
