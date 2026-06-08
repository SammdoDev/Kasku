"use client";

import { useEffect, useState } from "react";
import { get, post, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import TabFilter from "@/components/ui/input-component/tab-filter.tsx/tab-filter";
import CategoryGrid, { CategoryItem } from "./category-grid";
import TransactionBar from "./transaction-bar";
import NumPad from "./num-pad";
import NoteDialog from "./note-dialog";
import ModalKategori from "@/app/kategori/components/modal-kategori"; // sesuaikan path
import { useKategoriStore } from "@/app/kategori/store/kategori-store"; // sesuaikan path

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
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [showModalKategori, setShowModalKategori] = useState(false);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);

  const setEditTarget = useKategoriStore((s) => s.setEditTarget);

  const fetchCats = async () => {
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
    if (key === "acc") return;
    if (key === "bank") return;
    if (key === "." && amount.includes(".")) return;
    if (amount === "0" && key !== ".") {
      setAmount(key);
    } else {
      setAmount((prev) => prev + key);
    }
  };

  const handleBackspace = () => {
    setAmount((prev) => prev.slice(0, -1));
  };

  const reset = () => {
    setType("expense");
    setAmount("");
    setNote("");
    setDate(new Date().toISOString().split("T")[0]);
    setCategoryId(null);
    setPaymentMethodId("");
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Jumlah harus diisi dan lebih dari 0");
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
    setEditTarget(null); // pastikan mode tambah, bukan edit
    setShowModalKategori(true);
  };

  return (
    <div className="flex flex-col">
      <div className="pt-5 pb-3 mb-2">
        <TabFilter
          value={type}
          onChange={(val) => setType(val as "income" | "expense")}
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

      {showModalKategori ? (
        <div className="px-4 py-3">
          <ModalKategori
            onClose={() => setShowModalKategori(false)}
            onSuccess={() => {
              setShowModalKategori(false);
              fetchCats(); // refetch setelah tambah kategori
            }}
          />
        </div>
      ) : (
        <>
          <CategoryGrid
            categories={categories}
            selected={categoryId}
            onSelect={setCategoryId}
            loading={loadingCats}
            onAddCategory={handleOpenAddKategori}
          />

          <div className="fixed bottom-0 left-0 right-0">
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
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ModalTambahTransaksi;
