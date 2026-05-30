import { create } from "zustand";

function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function buildMonthOptions(count = 6): { key: string; label: string }[] {
  const opts: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("id-ID", {
      month: "short",
      year: "numeric",
    });
    opts.push({ key, label });
  }
  return opts;
}

export const MONTH_OPTIONS = buildMonthOptions(6);

interface DashboardFilterState {
  month: string;
  setMonth: (month: string) => void;
  monthLabel: string;
}

export const useDashboardFilter = create<DashboardFilterState>((set, get) => ({
  month: currentMonthKey(),
  monthLabel:
    MONTH_OPTIONS.find((o) => o.key === currentMonthKey())?.label ?? "",
  setMonth: (month: string) => {
    const label = MONTH_OPTIONS.find((o) => o.key === month)?.label ?? month;
    set({ month, monthLabel: label });
  },
}));
