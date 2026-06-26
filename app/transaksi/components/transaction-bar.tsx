"use client";

import { useTranslate } from "@/lib/i18n/use-translate";
import { useCurrency } from "@/lib/helper/currency-format";

interface TransactionBarProps {
  amount: string;
  note: string;
  onNoteClick?: () => void;
}

const TransactionBar = ({ amount, note, onNoteClick }: TransactionBarProps) => {
  const CONSTANT = useTranslate();
  const { format } = useCurrency();

  return (
    <div className="grid grid-cols-2 border-b-2 border-t-2 border-border bg-card">
      <div className="px-3 py-2.5 border-r-2 border-border">
        <p className="text-[8px] font-black tracking-[0.15em] text-foreground/40 uppercase mb-0.5">
          {CONSTANT.amount}
        </p>
        <p className={["text-[15px] font-black tracking-tight font-mono leading-none",
          amount ? "text-foreground" : "text-foreground/20"].join(" ")}>
          {amount ? format(Number(amount)) : format(0)}
        </p>
      </div>

      <button type="button" onClick={onNoteClick}
        className="px-3 py-2.5 text-left hover:bg-foreground/5 active:brightness-90 transition-colors duration-75">
        <p className="text-[8px] font-black tracking-[0.15em] text-foreground/40 uppercase mb-0.5">
          {CONSTANT.note}
        </p>
        <p className={["text-[11px] font-bold font-mono leading-none truncate",
          note ? "text-foreground" : "text-foreground/20"].join(" ")}>
          {note || CONSTANT.addEllipsis}
        </p>
      </button>
    </div>
  );
};

export default TransactionBar;