"use client";

import { useTranslate } from "@/lib/i18n/use-translate";

interface TransactionBarProps {
  amount: string;
  note: string;
  onNoteClick?: () => void;
}

function formatRupiah(raw: string): string {
  if (!raw) return "";
  const num = parseInt(raw, 10);
  if (isNaN(num)) return raw;
  return "Rp " + num.toLocaleString("id-ID");
}

const TransactionBar = ({ amount, note, onNoteClick }: TransactionBarProps) => {
  const CONSTANT = useTranslate();

  return (
    <div className="grid grid-cols-2 border-b-2 border-t-2 border-border bg-card">
      {/* Jumlah */}
      <div className="px-3 py-2.5 border-r-2 border-border">
        <p className="text-[8px] font-black tracking-[0.15em] text-foreground/40 uppercase mb-0.5">
          {CONSTANT.amount}
        </p>
        <p
          className={[
            "text-[15px] font-black tracking-tight font-mono leading-none",
            amount ? "text-foreground" : "text-foreground/20",
          ].join(" ")}
        >
          {amount ? formatRupiah(amount) : "0"}
        </p>
      </div>

      {/* Catatan */}
      <button
        type="button"
        onClick={onNoteClick}
        className="px-3 py-2.5 text-left hover:bg-foreground/5 active:brightness-90 transition-colors duration-75"
      >
        <p className="text-[8px] font-black tracking-[0.15em] text-foreground/40 uppercase mb-0.5">
          {CONSTANT.note}
        </p>
        <p
          className={[
            "text-[11px] font-bold font-mono leading-none truncate",
            note ? "text-foreground" : "text-foreground/20",
          ].join(" ")}
        >
          {note || CONSTANT.addEllipsis}
        </p>
      </button>
    </div>
  );
};

export default TransactionBar;
