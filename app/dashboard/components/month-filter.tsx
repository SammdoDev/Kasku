"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDashboardFilter } from "../store/dashboard-filter";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

interface MonthFilterProps {
  size?: "sm" | "md";
}

const MonthFilter = ({ size = "md" }: MonthFilterProps) => {
  const { month, setMonth } = useDashboardFilter();
  const [yearStr, monthStr] = month.split("-");
  const year = parseInt(yearStr, 10);
  const mIdx = parseInt(monthStr, 10) - 1;
  const label = `${MONTHS[mIdx].toUpperCase()} ${year}`;

  const navigate = (delta: number) => {
    const d = new Date(year, mIdx + delta, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const isSmall = size === "sm";

  return (
    <div className="inline-flex items-stretch border-[2.5px] border-[#1a1a1a] bg-white font-mono shadow-[3px_3px_0_#1a1a1a]">
      {/* Prev */}
      <button
        onClick={() => navigate(-1)}
        aria-label="Bulan sebelumnya"
        className={[
          "flex items-center justify-center border-r-[2px] border-[#1a1a1a] font-black",
          "bg-white text-[#1a1a1a] transition-colors duration-100",
          "hover:bg-[#1a1a1a] hover:text-white active:translate-x-px active:translate-y-px",
          isSmall ? "px-2.5 py-1.5 text-sm" : "px-3.5 py-2 text-base",
        ].join(" ")}
      >
         <ChevronLeft size={16} />
      </button>

      {/* Label */}
      <div
        className={[
          "flex items-center justify-center whitespace-nowrap font-black tracking-[0.5px] text-[#1a1a1a]",
          isSmall
            ? "min-w-[82px] px-3 py-1.5 text-[14px]"
            : "min-w-[100px] px-4 py-2 text-[16px]",
        ].join(" ")}
      >
        {label}
      </div>

      <button
        onClick={() => navigate(1)}
        aria-label="Bulan berikutnya"
        className={[
          "flex items-center justify-center border-l-[2px] border-[#1a1a1a] font-black",
          "bg-white text-[#1a1a1a] transition-colors duration-100",
          "hover:bg-[#1a1a1a] hover:text-white active:translate-x-px active:translate-y-px",
          isSmall ? "px-2.5 py-1.5 text-sm" : "px-3.5 py-2 text-base",
        ].join(" ")}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default MonthFilter;
