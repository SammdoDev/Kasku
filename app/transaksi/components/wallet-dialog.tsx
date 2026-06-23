"use client";

import { useEffect, useState } from "react";
import { get, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import ChildModalWrapper from "@/components/layout/for-pages/child-modal-wrapper";
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
            "w-full flex items-center justify-between px-3 py-2.5 border-2 transition-all duration-75 text-left",
            draft === ""
              ? "border-border bg-foreground text-background"
              : "border-border/20 bg-card text-foreground/40 hover:border-border hover:text-foreground",
          ].join(" ")}
        >
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
          wallets.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => handleSelect(w)}
              className={[
                "w-full flex items-center justify-between px-3 py-2.5 border-2 transition-all duration-75 text-left",
                draft === w.id
                  ? "border-border bg-foreground text-background shadow-none translate-x-[2px] translate-y-[2px]"
                  : "border-border bg-card text-foreground shadow-[3px_3px_0px_0px_hsl(var(--border))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
              ].join(" ")}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[12px] font-black">{w.name}</span>
                {w.type && (
                  <span
                    className={`text-[9px] font-bold tracking-widest uppercase ${draft === w.id ? "text-background/50" : "text-foreground/40"}`}
                  >
                    {w.type}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] font-black font-mono ${draft === w.id ? "text-background/70" : "text-foreground/50"}`}
              >
                {format(Number(w.balance ?? 0))}
              </span>
            </button>
          ))
        )}
      </div>
    </ChildModalWrapper>
  );
};

export default WalletDialog;
