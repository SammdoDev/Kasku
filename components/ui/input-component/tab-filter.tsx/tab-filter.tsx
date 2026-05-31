"use client";

interface TabOption {
  label: string;
  value: string;
}

interface TabFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: TabOption[];
  allLabel?: string; // label tombol "semua", set null untuk hilangkan
  showAll?: boolean;
}

const TabFilter = ({
  value,
  onChange,
  options,
  allLabel = "SEMUA",
  showAll = true,
}: TabFilterProps) => {
  const all = showAll ? [{ label: allLabel, value: "" }, ...options] : options;

  return (
    <div>
      {all.map((opt, i) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={[
            "inline-flex items-center justify-center whitespace-nowrap",
            "text-sm font-bold uppercase tracking-wide",
            "transition-all border-2 border-black",
            "active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
            "h-10 px-5",
            value === opt.value
              ? "bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              : "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]",
          ].join(" ")}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default TabFilter;

// ─── Preset options ───────────────────────────────────────────────
export const TIPE_OPTIONS: TabOption[] = [
  { label: "PEMASUKAN", value: "income" },
  { label: "PENGELUARAN", value: "expense" },
];

export const STATUS_OPTIONS: TabOption[] = [
  { label: "AKTIF", value: "active" },
  { label: "SELESAI", value: "done" },
  { label: "BATAL", value: "cancelled" },
];
