import { create } from "zustand";
import { getCurrentCycleMonth } from "@/lib/helper/cycle-date";

const pad = (n: number) => String(n).padStart(2, "0");
const now = new Date();

interface MonthFilterStore {
  month: string;
  cycleStart: number;
  isDefault: boolean;
  setMonth: (m: string) => void;
  prevMonth: () => void;
  nextMonth: () => void;
  syncCycleStart: (cycleStart: number) => void;
  setCycleStart: (cycleStart: number) => void;
}

const initial = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

export const useMonthFilter = create<MonthFilterStore>((set, get) => ({
  month: initial,
  cycleStart: 1,
  isDefault: true,

  setMonth: (month) => set({ month, isDefault: false }),

  prevMonth: () => {
    const [y, m] = get().month.split("-").map(Number);
    const d = new Date(y, m - 2, 1);
    set({
      month: `${d.getFullYear()}-${pad(d.getMonth() + 1)}`,
      isDefault: false,
    });
  },

  nextMonth: () => {
    const [y, m] = get().month.split("-").map(Number);
    const d = new Date(y, m, 1);
    set({
      month: `${d.getFullYear()}-${pad(d.getMonth() + 1)}`,
      isDefault: false,
    });
  },

  syncCycleStart: (cycleStart) => {
    set((state) => ({
      cycleStart,
      month: state.isDefault ? getCurrentCycleMonth(cycleStart) : state.month,
    }));
  },

  setCycleStart: (cycleStart) => {
    set({ cycleStart });
  },
}));

// helper — dipakai di komponen yang punya C dari useTranslate
export function makeMonthLabel(
  month: string,
  CONSTANT: {
    january: string;
    february: string;
    march: string;
    april: string;
    may: string;
    june: string;
    july: string;
    august: string;
    september: string;
    october: string;
    november: string;
    december: string;
  },
): string {
  const [y, mo] = month.split("-").map(Number);
  const MONTHS = [
    CONSTANT.january,
    CONSTANT.february,
    CONSTANT.march,
    CONSTANT.april,
    CONSTANT.may,
    CONSTANT.june,
    CONSTANT.july,
    CONSTANT.august,
    CONSTANT.september,
    CONSTANT.october,
    CONSTANT.november,
    CONSTANT.december,
  ];
  return `${MONTHS[mo - 1]} ${y}`;
}
