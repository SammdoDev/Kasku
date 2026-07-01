"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMonthFilter } from "./store/month-filter-store";
import {
  calculateCycleDateRange,
  formatCycleLabel,
} from "@/lib/helper/cycle-date";

interface MonthFilterProps {
  size?: "sm" | "md";
}

const MonthFilter = ({ size = "md" }: MonthFilterProps) => {
  const { month, cycleStart, setMonth } = useMonthFilter();

  // Tampilin rentang tanggal cycle aktual (mis. "25 JUN - 24 JUL 2026"),
  // bukan nama bulan kalender polos — biar gak ambigu sama isi datanya.
  const range = calculateCycleDateRange(month, cycleStart);
  const label = formatCycleLabel(range).toUpperCase();

  const navigate = (delta: number) => {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const sm = size === "sm";
  const h = sm ? "h-9" : "h-10";
  const textSize = sm ? "text-[12px]" : "text-[14px]";
  const px = sm ? "px-3" : "px-4";
  const iconSize = sm ? 14 : 16;

  const navCls = [
    "inline-flex items-center justify-center font-black border-2 border-border",
    "bg-card text-foreground transition-all",
    "shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px]",
    "active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
    h,
    sm ? "w-9" : "w-10",
  ].join(" ");

  return (
    <div className="inline-flex items-stretch gap-1">
      <button
        onClick={() => navigate(-1)}
        aria-label="Bulan sebelumnya"
        className={navCls}
      >
        <ChevronLeft size={iconSize} />
      </button>
      <div
        className={[
          "inline-flex items-center justify-center whitespace-nowrap",
          "font-black tracking-wide font-mono border-2 border-border bg-card",
          "shadow-brutal",
          h,
          px,
          textSize,
        ].join(" ")}
      >
        {label}
      </div>
      <button
        onClick={() => navigate(1)}
        aria-label="Bulan berikutnya"
        className={navCls}
      >
        <ChevronRight size={iconSize} />
      </button>
    </div>
  );
};

export default MonthFilter;
