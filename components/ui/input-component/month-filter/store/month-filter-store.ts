import { create } from "zustand";

const pad = (n: number) => String(n).padStart(2, "0");
const now = new Date();

interface MonthFilterStore {
  month: string;       // "YYYY-MM"
  monthLabel: string;  // "Januari 2025"
  setMonth: (m: string) => void;
}

const LABELS = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

const makeLabel = (m: string) => {
  const [y, mo] = m.split("-").map(Number);
  return `${LABELS[mo - 1]} ${y}`;
};

const initial = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

export const useMonthFilter = create<MonthFilterStore>((set) => ({
  month: initial,
  monthLabel: makeLabel(initial),
  setMonth: (month) => set({ month, monthLabel: makeLabel(month) }),
}));