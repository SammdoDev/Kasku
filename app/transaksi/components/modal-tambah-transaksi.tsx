"use client";

import { useEffect, useState } from "react";
import { get, post, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import TabFilter from "@/components/ui/input-component/tab-filter.tsx/tab-filter";
import CategoryGrid, { CategoryItem } from "./category-grid";
import TransactionBar from "./transaction-bar";
import NumPad from "./num-pad";
import NoteDialog from "./note-dialog";
import WalletDialog from "./wallet-dialog";
import ModalKategori from "@/app/kategori/components/modal-kategori";
import { useKategoriStore } from "@/app/kategori/store/kategori-store";
import ChildModalWrapper from "@/components/layout/for-pages/child-modal-wrapper";
import TransferPanel from "./transfer-panel";
import TagChips from "./tag-chips";
import CalendarDialog from "./calendar-dialog";

const TIPE_OPTIONS = [
  { label: "PENGELUARAN", value: "expense" },
  { label: "PEMASUKAN", value: "income" },
  { label: "TRANSFER", value: "transfer" },
];

interface ModalTambahTransaksiProps {
  onSuccess?: () => void;
  onClose: () => void;
}

const ModalTambahTransaksi = ({
  onSuccess,
  onClose,
}: ModalTambahTransaksiProps) => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"income" | "expense" | "transfer">(
    "expense",
  );
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [paymentMethodName, setPaymentMethodName] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [showModalKategori, setShowModalKategori] = useState(false);

  const [transferFromId, setTransferFromId] = useState<string | null>(null);
  const [transferToId, setTransferToId] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);

  const setEditTarget = useKategoriStore((s) => s.setEditTarget);

  const fetchCats = async () => {
    if (type === "transfer") return;
    setLoadingCats(true);
    setCategoryId(null);
    try {
      const res = await get<{ categories: CategoryItem[] }>(
        `/categories?type=${type}`,
      );
      setCategories(res.categories);
    } catch (err) {
      toast.error("Gagal memuat kategori", getApiError(err));
    } finally {
      setLoadingCats(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, [type]);

  const handleNumPress = (key: string) => {
    if (key === "day") return;
    if (key === "acc") {
      setWalletDialogOpen(true);
      return;
    }
    if (key === "bank") return;
    if (key === "." && amount.includes(".")) return;
    if (amount === "0" && key !== ".") {
      setAmount(key);
    } else {
      setAmount((prev) => prev + key);
    }
  };

  const handleBackspace = () => setAmount((prev) => prev.slice(0, -1));

  const reset = () => {
    setType("expense");
    setAmount("");
    setNote("");
    setDate(new Date().toISOString().split("T")[0]);
    setCategoryId(null);
    setPaymentMethodId("");
    setPaymentMethodName("");
    setTagIds([]);
    setTransferFromId(null);
    setTransferToId(null);
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Jumlah harus diisi dan lebih dari 0");
      return;
    }

    if (type === "transfer") {
      if (!transferFromId) {
        toast.error("Pilih dompet asal");
        return;
      }
      if (!transferToId) {
        toast.error("Pilih dompet tujuan");
        return;
      }
      setLoading(true);
      try {
        await post("/transactions/transfer", {
          amount: Number(amount),
          from_payment_method_id: transferFromId,
          to_payment_method_id: transferToId,
          note: note || undefined,
          date,
        });
        toast.success("Transfer berhasil dicatat");
        reset();
        onSuccess?.();
        onClose();
      } catch (err) {
        toast.error("Gagal menyimpan transfer", getApiError(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!categoryId) {
      toast.error("Pilih kategori terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      await post("/transactions", {
        type,
        amount: Number(amount),
        note: note || undefined,
        date,
        category_id: categoryId,
        payment_method_id: paymentMethodId || undefined,
        tag_ids: tagIds.length > 0 ? tagIds : undefined,
      });
      toast.success("Transaksi ditambahkan");
      reset();
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error("Gagal menyimpan", getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddKategori = () => {
    setEditTarget(null);
    setShowModalKategori(true);
  };

  const handleOpenEditKategori = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    setEditTarget({
      id: cat.id,
      name: cat.name,
      icon: cat.icon ?? null,
      color: cat.color ?? null,
      type: cat.type ?? "expense",
      created_at: "",
      updated_at: "",
    });
    setShowModalKategori(true);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="pt-5 pb-3 mb-2">
        <TabFilter
          value={type}
          onChange={(val) => setType(val as "income" | "expense" | "transfer")}
          options={TIPE_OPTIONS}
          showAll={false}
        />
      </div>

      <NoteDialog
        open={noteDialogOpen}
        value={note}
        onConfirm={(val) => setNote(val)}
        onClose={() => setNoteDialogOpen(false)}
      />

      <WalletDialog
        open={walletDialogOpen}
        selectedId={paymentMethodId}
        onConfirm={(id, name) => {
          setPaymentMethodId(id);
          setPaymentMethodName(name);
        }}
        onClose={() => setWalletDialogOpen(false)}
      />

      <ChildModalWrapper
        open={showModalKategori}
        onClose={() => setShowModalKategori(false)}
        title="TAMBAH KATEGORI"
        width="full"
      >
        <ModalKategori
          onClose={() => setShowModalKategori(false)}
          onSuccess={() => {
            setShowModalKategori(false);
            fetchCats();
          }}
        />
      </ChildModalWrapper>

      <div className="flex-1 overflow-y-auto">
        {type === "transfer" ? (
          <TransferPanel
            fromId={transferFromId}
            toId={transferToId}
            onFromChange={setTransferFromId}
            onToChange={setTransferToId}
          />
        ) : (
          <CategoryGrid
            categories={categories}
            selected={categoryId}
            onSelect={setCategoryId}
            loading={loadingCats}
            onAddCategory={handleOpenAddKategori}
            onEditCategory={handleOpenEditKategori}
          />
        )}

        {type !== "transfer" && (
          <TagChips selected={tagIds} onChange={setTagIds} />
        )}

        <div className="h-[220px]" />
      </div>

      <CalendarDialog
        open={calendarDialogOpen}
        date={date}
        onConfirm={(d) => setDate(d)}
        onClose={() => setCalendarDialogOpen(false)}
      />

      <div className="sticky bottom-0 left-0 right-0 z-50 border-t-2 border-border">
        <TransactionBar
          amount={amount}
          note={note}
          onNoteClick={() => setNoteDialogOpen(true)}
        />

        <NumPad
          onPress={handleNumPress}
          onBackspace={handleBackspace}
          onSubmit={handleSubmit}
          loading={loading}
          walletName={paymentMethodName}
          date={date}
          onDateClick={() => setCalendarDialogOpen(true)}
          onWalletClick={() => setWalletDialogOpen(true)}
        />
      </div>
    </div>
  );
};

export default ModalTambahTransaksi;
