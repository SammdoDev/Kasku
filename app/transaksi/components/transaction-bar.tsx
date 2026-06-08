// transaction-bar.tsx
"use client";

interface TransactionBarProps {
  amount: string; // raw digit string
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
  return (
    <div className="grid grid-cols-2 border-b-2 border-t-2 border-black">
      <div className="px-3.5 py-2.5 border-r-2 border-black">
        <p className="text-[8px] font-black tracking-[0.15em] text-[#999] uppercase mb-0.5">
          Jumlah
        </p>
        <p
          className={[
            "text-[17px] font-black tracking-tight font-mono leading-none",
            amount ? "text-[#1a1a1a]" : "text-black/20",
          ].join(" ")}
        >
          {amount ? formatRupiah(amount) : "0"}
        </p>
      </div>

      {/* Komentar */}
      <button
        type="button"
        onClick={onNoteClick}
        className="px-3.5 py-2.5 text-left hover:bg-[#f5f0e8] transition-colors duration-75"
      >
        <p className="text-[8px] font-black tracking-[0.15em] text-[#999] uppercase mb-0.5">
          Komentar
        </p>
        <p
          className={[
            "text-[12px] font-bold font-mono leading-none truncate",
            note ? "text-[#1a1a1a]" : "text-black/20",
          ].join(" ")}
        >
          {note || "Tambah catatan..."}
        </p>
      </button>
    </div>
  );
};

export default TransactionBar;
