"use client";

import { useEffect, useState } from "react";
import { get, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import ChildModalWrapper from "@/components/layout/for-pages/child-modal-wrapper";
import {
  Landmark,
  Smartphone,
  Banknote,
  CreditCard,
  Wallet as WalletIcon,
  Ban,
  type LucideIcon,
} from "lucide-react";
import { useCurrency } from "@/lib/helper/currency-format";
import { useTranslate } from "@/lib/i18n/use-translate";

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

const WalletDialog = ({
  open,
  selectedId,
  onConfirm,
  onClose,
}: WalletDialogProps) => {
  const CONSTANT = useTranslate();
  const { format } = useCurrency();
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
        toast.error(CONSTANT.failedLoadProfile, getApiError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchWallets();
  }, [open, selectedId, CONSTANT]);

  const handleSelect = (wallet: WalletItem) => {
    onConfirm(wallet.id, wallet.name);
    onClose();
  };

  return (
    <ChildModalWrapper
      open={open}
      onClose={onClose}
      title={`${CONSTANT.choose} ${CONSTANT.wallet}`.toUpperCase()}
      subtitle={CONSTANT.selectSourceWallet.toUpperCase()}
      width="sm"
    >
      <div className="flex flex-col gap-2 pt-3">
        <button
          type="button"
          onClick={() => {
            onConfirm("", "");
            onClose();
          }}
          className={[
            "w-full flex items-center gap-3 px-3 py-2.5 border-2 transition-all duration-75 text-left",
            draft === ""
              ? "border-border bg-foreground text-background"
              : "border-border/20 bg-card text-foreground/40 hover:border-border hover:text-foreground",
          ].join(" ")}
        >
          <div
            className="w-8 h-8 shrink-0 border-2 flex items-center justify-center"
            style={{
              borderColor: "currentColor",
              opacity: draft === "" ? 1 : 0.4,
            }}
          >
            <Ban size={14} strokeWidth={2.5} />
          </div>
          <span className="text-[11px] font-black tracking-wider">
            {CONSTANT.noWallet}
          </span>
        </button>

        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-14 bg-foreground/10 border-2 border-border/20 animate-pulse"
              />
            ))}
          </div>
        ) : wallets.length === 0 ? (
          <p className="text-[11px] text-foreground/40 font-bold py-4 text-center">
            {CONSTANT.walletEmpty}
          </p>
        ) : (
          wallets.map((w) => {
            const meta = getTypeMeta(w.type);
            const Icon = meta.icon;
            const isSelected = draft === w.id;

            return (
              <button
                key={w.id}
                type="button"
                onClick={() => handleSelect(w)}
                className={[
                  "relative w-full flex items-center gap-3 px-3 py-2.5 border-2 transition-all duration-75 text-left overflow-hidden",
                  isSelected
                    ? "border-border bg-foreground text-background shadow-none translate-x-[2px] translate-y-[2px]"
                    : "border-border bg-card text-foreground shadow-[3px_3px_0px_0px_hsl(var(--border))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
                ].join(" ")}
              >
                <span
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ background: meta.color }}
                />
                <div
                  className="w-9 h-9 shrink-0 border-2 flex items-center justify-center ml-1"
                  style={{
                    background: isSelected ? "transparent" : meta.color + "22",
                    borderColor: isSelected ? "currentColor" : meta.color,
                  }}
                >
                  <Icon
                    size={16}
                    strokeWidth={2.5}
                    style={{ color: isSelected ? "currentColor" : meta.color }}
                  />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span className="text-[12px] font-black truncate">
                    {w.name}
                  </span>
                  <span
                    className="text-[8px] font-black tracking-widest uppercase"
                    style={{
                      color: isSelected ? undefined : meta.color,
                      opacity: isSelected ? 0.6 : 1,
                    }}
                  >
                    {meta.label}
                  </span>
                </div>
                <span
                  className={`text-[11px] font-black font-mono shrink-0 ${isSelected ? "text-background/70" : "text-foreground/50"}`}
                >
                  {format(Number(w.balance ?? 0))}
                </span>
              </button>
            );
          })
        )}
      </div>
    </ChildModalWrapper>
  );
};

export default WalletDialog;
