"use client";

import { useEffect, useState } from "react";
import { get, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import { ArrowDown } from "lucide-react";
import { useCurrency } from "@/lib/helper/currency-format";
import { useTranslate } from "@/lib/i18n/use-translate";

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
  format,
}: {
  wallet: WalletItem;
  selected: boolean;
  onClick: () => void;
  dimmed?: boolean;
  format: (value: number) => string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={dimmed}
    className={[
      "flex flex-col items-start justify-center gap-0.5 px-3 py-2.5 border-2 transition-all duration-75 min-w-[100px]",
      selected
        ? "border-border bg-foreground text-background shadow-none translate-x-[2px] translate-y-[2px]"
        : dimmed
          ? "border-border/20 bg-card/50 text-foreground/30 cursor-not-allowed"
          : "border-border bg-card text-foreground shadow-[3px_3px_0px_0px_hsl(var(--border))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
    ].join(" ")}
  >
    <span className="text-[12px] font-black">{wallet.name}</span>
    <span
      className={[
        "text-[9px] font-bold font-mono",
        selected
          ? "text-background/60"
          : dimmed
            ? "text-foreground/20"
            : "text-foreground/40",
      ].join(" ")}
    >
      {format(wallet.balance)}
    </span>
  </button>
);

const SkeletonWallet = () => (
  <div className="flex gap-2 flex-wrap">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="w-24 h-14 bg-foreground/10 border-2 border-border/20 animate-pulse"
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
  const CONSTANT = useTranslate();
  const { format } = useCurrency();
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
        toast.error(CONSTANT.failedLoadProfile, getApiError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchWallets();
  }, [CONSTANT]);

  const fromWallet = wallets.find((w) => w.id === fromId);
  const toWallet = wallets.find((w) => w.id === toId);

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black tracking-[0.15em] text-foreground/40 uppercase">
          {CONSTANT.fromWallet ?? "DARI DOMPET"}
        </label>
        {loading ? (
          <SkeletonWallet />
        ) : wallets.length === 0 ? (
          <p className="text-[11px] text-foreground/40 font-bold">
            {CONSTANT.walletEmpty}
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
                format={format}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-0.5 bg-foreground/10" />
        <div className="flex items-center justify-center w-7 h-7 border-2 border-border bg-card">
          <ArrowDown size={14} strokeWidth={3} />
        </div>
        <div className="flex-1 h-0.5 bg-foreground/10" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black tracking-[0.15em] text-foreground/40 uppercase">
          {CONSTANT.toWallet ?? "KE DOMPET"}
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
                format={format}
              />
            ))}
          </div>
        )}
      </div>

      {fromWallet && toWallet && (
        <div
          className="border-2 border-border bg-card px-4 py-3 flex flex-col gap-1"
          style={{ background: "var(--sidebar-bg)" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black">{fromWallet.name}</span>
            <span className="text-[10px] text-foreground/40 font-bold">→</span>
            <span className="text-[11px] font-black">{toWallet.name}</span>
          </div>
          <p className="text-[10px] text-foreground/50 font-medium">
            {CONSTANT.totalBalance} {fromWallet.name}:{" "}
            {format(fromWallet.balance)}
          </p>
        </div>
      )}
    </div>
  );
};

export default TransferPanel;