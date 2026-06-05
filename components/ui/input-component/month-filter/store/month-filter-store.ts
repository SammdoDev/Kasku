import { create } from "zustand";

const pad = (n: number) => String(n).padStart(2, "0");
const now = new Date();

interface MonthFilterStore {
  month: string;
  monthLabel: string;
  setMonth: (m: string) => void;
  prevMonth: () => void;
  nextMonth: () => void;
}

const LABELS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const makeLabel = (m: string) => {
  const [y, mo] = m.split("-").map(Number);
  return `${LABELS[mo - 1]} ${y}`;
};

const initial = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

export const useMonthFilter = create<MonthFilterStore>((set, get) => ({
  month: initial,
  monthLabel: makeLabel(initial),

  setMonth: (month) => set({ month, monthLabel: makeLabel(month) }),

  prevMonth: () => {
    const [y, m] = get().month.split("-").map(Number);
    const d = new Date(y, m - 2, 1);
    const newMonth = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    set({ month: newMonth, monthLabel: makeLabel(newMonth) });
  },

  nextMonth: () => {
    const [y, m] = get().month.split("-").map(Number);
    const d = new Date(y, m, 1);
    const newMonth = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    set({ month: newMonth, monthLabel: makeLabel(newMonth) });
  },
}));
