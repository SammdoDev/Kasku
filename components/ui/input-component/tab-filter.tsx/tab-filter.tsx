"use client";

import { useTranslate } from "@/lib/i18n/use-translate";

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

const TabFilter = ({ value, onChange, options, allLabel, showAll = true }: TabFilterProps) => {
  const C = useTranslate();
  const resolvedAllLabel = allLabel ?? C.active.toUpperCase().replace("AKTIF", "SEMUA");
  const all = showAll ? [{ label: resolvedAllLabel, value: "" }, ...options] : options;

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex border-2 border-border min-w-max">
        {all.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={[
              "px-4 py-2 text-[11px] font-black tracking-[0.15em] uppercase transition-all duration-75 whitespace-nowrap",
              "border-r-2 border-border last:border-r-0",
              value === opt.value
                ? "bg-foreground text-background"
                : "bg-card text-foreground/50 hover:bg-[var(--sidebar-bg)] hover:text-foreground",
            ].join(" ")}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabFilter;

export const useTipeOptions = (): TabOption[] => {
  const CONSTANT = useTranslate();
  return [
    { label: CONSTANT.income.toUpperCase(), value: "income" },
    { label: CONSTANT.expense.toUpperCase(), value: "expense" },
  ];
};

export const useStatusOptions = (): TabOption[] => {
  const CONSTANT = useTranslate();
  return [
    { label: CONSTANT.active.toUpperCase(), value: "active" },
    { label: "SELESAI", value: "done" },
    { label: CONSTANT.cancel?.toUpperCase() ?? "BATAL", value: "cancelled" },
  ];
};