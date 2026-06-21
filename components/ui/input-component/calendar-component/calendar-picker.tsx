"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const MONTHS_ID = [
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

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const offset = (firstDay + 6) % 7;
  const cells: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  return cells;
}

const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

interface CalendarPickerProps {
  value: string;
  onChange: (date: string) => void;
}

const CalendarPicker = ({ value, onChange }: CalendarPickerProps) => {
  const parsed = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(parsed.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed.getMonth());

  const cells = getCalendarDays(viewYear, viewMonth);

  const makeDate = (day: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  return (
    <div className="w-full border-2 border-border bg-card p-3">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center border-2 border-border font-black text-lg hover:bg-[#f5f0e8] active:brightness-90 transition-colors"
        >
          ‹
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-black tracking-wider">
            {MONTHS_ID[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            onClick={() => onChange(todayStr)}
            className="text-[9px] font-black tracking-widest text-[#713f12] bg-[#fef9c3] border-2 border-[#713f12]/30 px-2 py-0.5 hover:bg-[#fef08a] active:brightness-90 transition-colors"
          >
            HARI INI
          </button>
        </div>
        <button
          type="button"
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center border-2 border-border font-black text-lg hover:bg-[#f5f0e8] active:brightness-90 transition-colors"
        >
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[9px] font-black text-black/40 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const ds = makeDate(day);
          const isSelected = ds === value;
          const isToday = ds === todayStr;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(ds)}
              className={cn(
                "text-[12px] font-black py-2 transition-colors duration-75 active:brightness-90",
                isSelected
                  ? "bg-[#1a1a1a] text-white"
                  : isToday
                    ? "bg-[#fef9c3] text-[#713f12] hover:bg-[#fef08a]"
                    : "hover:bg-[#f5f0e8] text-[#1a1a1a]",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarPicker;
