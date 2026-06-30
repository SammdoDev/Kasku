"use client";

import { useEffect, useState } from "react";
import { get, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import {
  ArrowDown,
  Landmark,
  Smartphone,
  Banknote,
  CreditCard,
  Wallet as WalletIcon,
  type LucideIcon,
} from "lucide-react";
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

const TYPE_META: Record<
  string,
  { icon: LucideIcon; color: string; label: string }
> = {
  bank: { icon: Landmark, color: "#3b82f6", label: "BANK" },
  ewallet: { icon: Smartphone, color: "#8b5cf6", label: "E-WALLET" },
  cash: { icon: Banknote, color: "#10b981", label: "CASH" },
  credit: { icon: CreditCard, color: "#f97316", label: "KREDIT" },
  other: { icon: WalletIcon, color: "#64748b", label: "LAINNYA" },
};

const getTypeMeta = (type: string | null) =>
  TYPE_META[type ?? "other"] ?? TYPE_META.other;

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
}) => {
  const meta = getTypeMeta(wallet.type);
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={dimmed}
      className={[
        "relative flex items-center gap-2 px-2.5 py-2.5 border-2 transition-all duration-75 w-full sm:w-auto sm:min-w-[130px] text-left",
        selected
          ? "border-border bg-foreground text-background shadow-none translate-x-[2px] translate-y-[2px]"
          : dimmed
            ? "border-border/20 bg-card/50 text-foreground/30 cursor-not-allowed"
            : "border-border bg-card text-foreground shadow-[3px_3px_0px_0px_hsl(var(--border))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
      ].join(" ")}
    >
      <div
        className="w-8 h-8 shrink-0 border-2 flex items-center justify-center"
        style={{
          background: selected ? "transparent" : meta.color + "22",
          borderColor: selected ? "currentColor" : meta.color,
        }}
      >
        <Icon
          size={15}
          strokeWidth={2.5}
          style={{ color: selected ? "currentColor" : meta.color }}
        />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[11px] font-black truncate">{wallet.name}</span>
        <span
          className={[
            "text-[9px] font-bold font-mono truncate",
            selected
              ? "text-background/60"
              : dimmed
                ? "text-foreground/20"
                : "text-foreground/40",
          ].join(" ")}
        >
          {format(wallet.balance)}
        </span>
      </div>
      {!selected && !dimmed && (
        <span
          className="absolute -top-1.5 -right-1.5 text-[6px] sm:text-[7px] font-black px-1 py-0.5 border-2 border-border tracking-wider"
          style={{ background: meta.color, color: "#fff" }}
        >
          {meta.label}
        </span>
      )}
    </button>
  );
};

const SkeletonWallet = () => (
  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="w-full sm:w-32 h-14 bg-foreground/10 border-2 border-border/20 animate-pulse"
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
  const fromMeta = fromWallet ? getTypeMeta(fromWallet.type) : null;
  const toMeta = toWallet ? getTypeMeta(toWallet.type) : null;

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
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
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
        <div
          className="flex items-center justify-center w-8 h-8 border-2 border-border bg-card shadow-[2px_2px_0px_0px_hsl(var(--border))]"
          style={{
            background:
              fromMeta && toMeta
                ? `linear-gradient(135deg, ${fromMeta.color}33, ${toMeta.color}33)`
                : undefined,
          }}
        >
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
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
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

      {fromWallet && toWallet && fromMeta && toMeta && (
        <div
          className="border-2 border-border bg-card px-4 py-3 flex flex-col gap-2 shadow-[3px_3px_0px_0px_hsl(var(--border))]"
          style={{
            background: `linear-gradient(135deg, ${fromMeta.color}14, ${toMeta.color}14)`,
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 border border-border shrink-0"
              style={{ background: fromMeta.color }}
            />
            <span className="text-[11px] font-black">{fromWallet.name}</span>
            <span className="text-[10px] text-foreground/40 font-bold">→</span>
            <span
              className="w-2 h-2 border border-border shrink-0"
              style={{ background: toMeta.color }}
            />
            <span className="text-[11px] font-black">{toWallet.name}</span>
          </div>
          <p className="text-[10px] text-foreground/50 font-medium">
            {CONSTANT.totalBalance} {fromWallet.name}:{" "}
            <span className="font-mono font-bold text-foreground/70">
              {format(fromWallet.balance)}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default TransferPanel;
