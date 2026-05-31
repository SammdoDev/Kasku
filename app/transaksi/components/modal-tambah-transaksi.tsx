// modal-tambah-transaksi.tsx — tidak ada perubahan logic, hanya style diseragamkan
"use client";

import { useState } from "react";
import { post, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/toast";
import { useTransaksiStore } from "../store/transaksi-store";
import { Button } from "@/components/ui/button-component/button";
import TabFilter from "@/components/ui/input-component/tab-filter.tsx/tab-filter";

const TIPE_OPTIONS = [
  { label: "PEMASUKAN", value: "income" },
  { label: "PENGELUARAN", value: "expense" },
];

interface ModalTambahTransaksiProps {
  onSuccess?: () => void;
  onClose: () => void;
}

const labelCls =
  "block text-[9px] font-black tracking-[0.15em] text-[#1a1a1a] mb-1";

const inputCls = [
  "h-9 w-full border-2 border-black bg-white px-3",
  "text-[11px] font-mono font-bold tracking-wide",
  "placeholder:text-black/25",
  "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
  "focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
  "focus:translate-x-[2px] focus:translate-y-[2px] transition-all duration-100",
].join(" ");

const selectCls = [
  "h-9 w-full appearance-none border-2 border-black bg-white px-3",
  "text-[11px] font-mono font-bold tracking-wide cursor-pointer",
  "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
  "hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5",
  "focus:outline-none transition-all duration-100",
].join(" ");

const ModalTambahTransaksi = ({
  onSuccess,
  onClose,
}: ModalTambahTransaksiProps) => {
  const categories = useTransaksiStore((s) => s.categories);
  const tags = useTransaksiStore((s) => s.tags);
  const paymentMethods = useTransaksiStore((s) => s.paymentMethods);

  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);

  const toggleTag = (id: string) =>
    setTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );

  const reset = () => {
    setType("expense");
    setAmount("");
    setNote("");
    setDate(new Date().toISOString().split("T")[0]);
    setCategoryId("");
    setPaymentMethodId("");
    setTagIds([]);
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Jumlah harus diisi dan lebih dari 0");
      return;
    }
    setLoading(true);
    try {
      await post("/transactions", {
        type,
        amount: Number(amount),
        note: note || undefined,
        date,
        category_id: categoryId || undefined,
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

  const filteredCategories = categories.filter(
    (c) => !c.type || c.type === type,
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Tipe */}
      <div>
        <span className={labelCls}>TIPE</span>
        <TabFilter
          value={type}
          onChange={(val) => {
            setType(val as "income" | "expense");
            setCategoryId("");
          }}
          options={TIPE_OPTIONS}
          showAll={false}
        />
      </div>

      {/* Jumlah */}
      <div>
        <label className={labelCls} htmlFor="amount">
          JUMLAH (Rp)
        </label>
        <input
          id="amount"
          type="number"
          min="1"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={inputCls}
        />
      </div>

      {/* Tanggal */}
      <div>
        <label className={labelCls} htmlFor="date">
          TANGGAL
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputCls}
        />
      </div>

      {/* Catatan */}
      <div>
        <label className={labelCls} htmlFor="note">
          CATATAN
        </label>
        <input
          id="note"
          type="text"
          placeholder="Deskripsi transaksi..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={inputCls}
        />
      </div>

      {/* Kategori + Metode */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls} htmlFor="category">
            KATEGORI
          </label>
          <div className="relative">
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={selectCls}
            >
              <option value="">— Pilih —</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name.toUpperCase()}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px]">
              ▾
            </span>
          </div>
        </div>
        <div>
          <label className={labelCls} htmlFor="method">
            METODE BAYAR
          </label>
          <div className="relative">
            <select
              id="method"
              value={paymentMethodId}
              onChange={(e) => setPaymentMethodId(e.target.value)}
              className={selectCls}
            >
              <option value="">— Pilih —</option>
              {paymentMethods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name.toUpperCase()}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px]">
              ▾
            </span>
          </div>
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <span className={labelCls}>TAGS</span>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={[
                  "h-9 inline-flex items-center gap-1 border-2 border-black px-3",
                  "text-[9px] font-black tracking-wide font-mono uppercase",
                  "transition-all duration-100",
                  tagIds.includes(tag.id)
                    ? "bg-black text-white shadow-none translate-x-0.75 translate-y-0.75"
                    : [
                        "bg-white text-black",
                        "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                        "hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                        "hover:translate-x-0.5 hover:translate-y-0.5",
                        "active:translate-x-0.75 active:translate-y-0.75 active:shadow-none",
                      ].join(" "),
                ].join(" ")}
              >
                <span className="opacity-40">#</span>
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="h-0.5 bg-[#1a1a1a]" />

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button
          label="BATAL"
          variant="outline"
          onClick={onClose}
          disabled={loading}
        />
        <Button
          label={loading ? "MENYIMPAN..." : "SIMPAN"}
          onClick={handleSubmit}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default ModalTambahTransaksi;
