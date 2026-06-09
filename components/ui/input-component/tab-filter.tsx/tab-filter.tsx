"use client";

interface TabOption {
  label: string;
  value: string;
}

interface TabFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: TabOption[];
  allLabel?: string;
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
    <div className="flex w-full sm:w-auto sm:inline-flex border-2 border-black">
      {all.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={[
            "flex-1 sm:flex-none px-4 py-2 text-[11px] font-black tracking-[0.15em] uppercase transition-all duration-75",
            "border-r-2 border-black last:border-r-0",
            value === opt.value
              ? "bg-[#1a1a1a] text-white"
              : "bg-white text-black/50 hover:bg-[#f5f0e8] hover:text-black",
          ].join(" ")}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default TabFilter;

export const TIPE_OPTIONS: TabOption[] = [
  { label: "PEMASUKAN", value: "income" },
  { label: "PENGELUARAN", value: "expense" },
];

export const STATUS_OPTIONS: TabOption[] = [
  { label: "AKTIF", value: "active" },
  { label: "SELESAI", value: "done" },
  { label: "BATAL", value: "cancelled" },
];
