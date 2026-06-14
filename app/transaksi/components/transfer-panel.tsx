"use client";

import { useEffect, useState } from "react";
import { get, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import { ArrowDown } from "lucide-react";
import formatIDR from "@/lib/helper/currency-format";

export interface WalletItem {
  id: string;
  name: string;
  type: string | null;
  icon: string | null;
  balance: number;
}

interface TransferPanelProps {
  fromId: string | null;
  toId: string | null;
  onFromChange: (id: string) => void;
  onToChange: (id: string) => void;
}

const WalletButton = ({
  wallet,
  selected,
  onClick,
  dimmed,
}: {
  wallet: WalletItem;
  selected: boolean;
  onClick: () => void;
  dimmed?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={dimmed}
    className={[
      "flex flex-col items-start justify-center gap-0.5 px-3 py-2.5 border-2 transition-all duration-75 min-w-[100px]",
      selected
        ? "border-black bg-[#1a1a1a] text-white shadow-none translate-x-[2px] translate-y-[2px]"
        : dimmed
          ? "border-black/20 bg-white/50 text-black/30 cursor-not-allowed"
          : "border-black bg-white text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
    ].join(" ")}
  >
    <span className="text-[12px] font-black">{wallet.name}</span>
    <span
      className={[
        "text-[9px] font-bold font-mono",
        selected ? "text-white/60" : dimmed ? "text-black/20" : "text-black/40",
      ].join(" ")}
    >
      {formatIDR(wallet.balance)}
    </span>
  </button>
);

const SkeletonWallet = () => (
  <div className="flex gap-2 flex-wrap">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="w-24 h-14 bg-gray-100 border-2 border-[#e5e5e5] animate-pulse"
      />
    ))}
  </div>
);

const TransferPanel = ({
  fromId,
  toId,
  onFromChange,
  onToChange,
}: TransferPanelProps) => {
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
  }, []);

  const fromWallet = wallets.find((w) => w.id === fromId);
  const toWallet = wallets.find((w) => w.id === toId);

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black tracking-[0.15em] text-[#999] uppercase">
          DARI DOMPET
        </label>
        {loading ? (
          <SkeletonWallet />
        ) : wallets.length === 0 ? (
          <p className="text-[11px] text-black/40 font-bold">
            Belum ada dompet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {wallets.map((w) => (
              <WalletButton
                key={w.id}
                wallet={w}
                selected={fromId === w.id}
                dimmed={toId === w.id}
                onClick={() => onFromChange(w.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-0.5 bg-black/10" />
        <div className="flex items-center justify-center w-7 h-7 border-2 border-black bg-[#f5f0e8]">
          <ArrowDown size={14} strokeWidth={3} />
        </div>
        <div className="flex-1 h-0.5 bg-black/10" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black tracking-[0.15em] text-[#999] uppercase">
          KE DOMPET
        </label>
        {loading ? (
          <SkeletonWallet />
        ) : wallets.length === 0 ? null : (
          <div className="flex flex-wrap gap-2">
            {wallets.map((w) => (
              <WalletButton
                key={w.id}
                wallet={w}
                selected={toId === w.id}
                dimmed={fromId === w.id}
                onClick={() => onToChange(w.id)}
              />
            ))}
          </div>
        )}
      </div>

      {fromWallet && toWallet && (
        <div className="border-2 border-black bg-[#f5f0e8] px-4 py-3 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black">{fromWallet.name}</span>
            <span className="text-[10px] text-black/40 font-bold">→</span>
            <span className="text-[11px] font-black">{toWallet.name}</span>
          </div>
          <p className="text-[10px] text-black/50 font-medium">
            Saldo {fromWallet.name}: {formatIDR(fromWallet.balance)}
          </p>
        </div>
      )}
    </div>
  );
};

export default TransferPanel;
