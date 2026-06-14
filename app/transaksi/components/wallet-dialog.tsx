"use client";

import { useEffect, useState } from "react";
import { get, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import ChildModalWrapper from "@/components/layout/for-pages/child-modal-wrapper";
import formatIDR from "@/lib/helper/currency-format";

interface WalletItem {
  id: string;
  name: string;
  type: string | null;
  balance: number;
}

interface WalletDialogProps {
  open: boolean;
  selectedId: string;
  onConfirm: (id: string, name: string) => void;
  onClose: () => void;
}

const WalletDialog = ({
  open,
  selectedId,
  onConfirm,
  onClose,
}: WalletDialogProps) => {
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(selectedId);

  useEffect(() => {
    if (!open) return;
    setDraft(selectedId);
    const fetchWallets = async () => {
      setLoading(true);
      try {
        const res = await get<{ payment_methods: WalletItem[] }>(
          "/payment-methods",
        );
        setWallets(res.payment_methods);
      } catch (err) {
        toast.error("Gagal memuat dompet", getApiError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchWallets();
  }, [open, selectedId]);

  const handleSelect = (wallet: WalletItem) => {
    onConfirm(wallet.id, wallet.name);
    onClose();
  };

  return (
    <ChildModalWrapper
      open={open}
      onClose={onClose}
      title="PILIH DOMPET"
      subtitle="PILIH SUMBER DANA TRANSAKSI"
      width="sm"
    >
      <div className="flex flex-col gap-2 pt-3">
        {/* None option */}
        <button
          type="button"
          onClick={() => {
            onConfirm("", "");
            onClose();
          }}
          className={[
            "w-full flex items-center justify-between px-3 py-2.5 border-2 transition-all duration-75 text-left",
            draft === ""
              ? "border-black bg-[#1a1a1a] text-white"
              : "border-black/20 bg-white text-black/40 hover:border-black hover:text-black",
          ].join(" ")}
        >
          <span className="text-[11px] font-black tracking-wider">
            TANPA DOMPET
          </span>
        </button>

        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-14 bg-gray-100 border-2 border-[#e5e5e5] animate-pulse"
              />
            ))}
          </div>
        ) : wallets.length === 0 ? (
          <p className="text-[11px] text-black/40 font-bold py-4 text-center">
            Belum ada dompet. Tambah dulu di halaman Dompet.
          </p>
        ) : (
          wallets.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => handleSelect(w)}
              className={[
                "w-full flex items-center justify-between px-3 py-2.5 border-2 transition-all duration-75 text-left",
                draft === w.id
                  ? "border-black bg-[#1a1a1a] text-white shadow-none translate-x-[2px] translate-y-[2px]"
                  : "border-black bg-white text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
              ].join(" ")}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[12px] font-black">{w.name}</span>
                {w.type && (
                  <span
                    className={`text-[9px] font-bold tracking-widest uppercase ${draft === w.id ? "text-white/50" : "text-black/40"}`}
                  >
                    {w.type}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] font-black font-mono ${draft === w.id ? "text-white/70" : "text-black/50"}`}
              >
                {formatIDR(Number(w.balance ?? 0))}
              </span>
            </button>
          ))
        )}
      </div>
    </ChildModalWrapper>
  );
};

export default WalletDialog;
