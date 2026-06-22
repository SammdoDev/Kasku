"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMonthFilter } from "./store/month-filter-store";
import { useTranslate } from "@/lib/i18n/use-translate";

interface MonthFilterProps {
  size?: "sm" | "md";
}

const pad = (n: number) => String(n).padStart(2, "0");

const MonthFilter = ({ size = "md" }: MonthFilterProps) => {
  const { month, setMonth } = useMonthFilter();
  const CONSTANT = useTranslate();

  const MONTHS = [
    CONSTANT.january ?? "JAN",
    CONSTANT.february ?? "FEB",
    CONSTANT.march ?? "MAR",
    CONSTANT.april ?? "APR",
    CONSTANT.may ?? "MEI",
    CONSTANT.june ?? "JUN",
    CONSTANT.july ?? "JUL",
    CONSTANT.august ?? "AGU",
    CONSTANT.september ?? "SEP",
    CONSTANT.october ?? "OKT",
    CONSTANT.november ?? "NOV",
    CONSTANT.december ?? "DES",
  ];

  const [yearStr, monthStr] = month.split("-");
  const year = parseInt(yearStr, 10);
  const mIdx = parseInt(monthStr, 10) - 1;
  const label = `${MONTHS[mIdx]} ${year}`;

  const navigate = (delta: number) => {
    const d = new Date(year, mIdx + delta, 1);
    setMonth(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`);
  };

  const sm = size === "sm";
  const h = sm ? "h-9" : "h-10";
  const textSize = sm ? "text-[15px]" : "text-[18px]";
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
