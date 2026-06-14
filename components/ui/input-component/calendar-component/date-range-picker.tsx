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

export interface DateRange {
  start_date: string;
  end_date: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

type SelectingMode = "start" | "end";

const DateRangePicker = ({ value, onChange }: DateRangePickerProps) => {
  const initDate = value.start_date ? new Date(value.start_date) : new Date();
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());
  const [selecting, setSelecting] = useState<SelectingMode>("start");
  const [hovered, setHovered] = useState<string | null>(null);

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

  const handleDayClick = (ds: string) => {
    if (selecting === "start") {
      const newEnd =
        value.end_date && ds > value.end_date ? "" : value.end_date;
      onChange({ start_date: ds, end_date: newEnd });
      setSelecting("end");
    } else {
      if (value.start_date && ds < value.start_date) {
        onChange({ start_date: ds, end_date: value.start_date });
      } else {
        onChange({ start_date: value.start_date, end_date: ds });
      }
      setSelecting("start");
    }
  };

  const isInRange = (ds: string) => {
    const start = value.start_date;
    const end = selecting === "end" && hovered ? hovered : value.end_date;
    if (!start || !end) return false;
    const lo = start < end ? start : end;
    const hi = start < end ? end : start;
    return ds > lo && ds < hi;
  };

  const formatDisplay = (ds: string) => {
    if (!ds) return "—";
    const [y, m, d] = ds.split("-");
    return `${d} ${MONTHS_ID[parseInt(m) - 1]} ${y}`;
  };

  return (
    <div className="w-full border-2 border-black bg-white">
      {/* Mode tabs */}
      <div className="flex border-b-2 border-black">
        <button
          type="button"
          onClick={() => setSelecting("start")}
          className={cn(
            "flex-1 px-3 py-2.5 text-left border-r-2 border-black transition-colors duration-75",
            selecting === "start"
              ? "bg-[#1a1a1a]"
              : "bg-white hover:bg-[#f5f0e8]",
          )}
        >
          <div
            className={cn(
              "text-[9px] font-black tracking-widest mb-0.5",
              selecting === "start" ? "text-white/50" : "text-black/40",
            )}
          >
            MULAI
          </div>
          <div
            className={cn(
              "text-[11px] font-black",
              selecting === "start" ? "text-white" : "text-black",
            )}
          >
            {formatDisplay(value.start_date)}
          </div>
        </button>
        <button
          type="button"
          onClick={() => setSelecting("end")}
          className={cn(
            "flex-1 px-3 py-2.5 text-left transition-colors duration-75",
            selecting === "end"
              ? "bg-[#1a1a1a]"
              : "bg-white hover:bg-[#f5f0e8]",
          )}
        >
          <div
            className={cn(
              "text-[9px] font-black tracking-widest mb-0.5",
              selecting === "end" ? "text-white/50" : "text-black/40",
            )}
          >
            BERAKHIR
            <span className="ml-1 font-medium normal-case tracking-normal opacity-60">
              (opsional)
            </span>
          </div>
          <div
            className={cn(
              "text-[11px] font-black",
              selecting === "end"
                ? "text-white"
                : value.end_date
                  ? "text-black"
                  : "text-black/30",
            )}
          >
            {formatDisplay(value.end_date)}
          </div>
        </button>
      </div>

      {/* Calendar */}
      <div className="p-3">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center border-2 border-black font-black text-lg hover:bg-[#f5f0e8] active:brightness-90 transition-colors"
          >
            ‹
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-black tracking-wider">
              {MONTHS_ID[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={() => {
                if (selecting === "start") {
                  onChange({ ...value, start_date: todayStr });
                  setSelecting("end");
                } else {
                  onChange({ ...value, end_date: todayStr });
                  setSelecting("start");
                }
              }}
              className="text-[9px] font-black tracking-widest text-[#713f12] bg-[#fef9c3] border-2 border-[#713f12]/30 px-2 py-0.5 hover:bg-[#fef08a] active:brightness-90 transition-colors"
            >
              HARI INI
            </button>
          </div>
          <button
            type="button"
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center border-2 border-black font-black text-lg hover:bg-[#f5f0e8] active:brightness-90 transition-colors"
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
        <div className="grid grid-cols-7 gap-y-0.5">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const ds = makeDate(day);
            const isStart = ds === value.start_date;
            const isEnd = ds === value.end_date;
            const inRange = isInRange(ds);
            const isToday = ds === todayStr;

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleDayClick(ds)}
                onMouseEnter={() => setHovered(ds)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  "text-[12px] font-black py-2 transition-colors duration-75 active:brightness-90",
                  isStart || isEnd
                    ? "bg-[#1a1a1a] text-white"
                    : inRange
                      ? "bg-[#1a1a1a]/10 text-[#1a1a1a]"
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

        {/* Clear end */}
        {value.end_date && (
          <button
            type="button"
            onClick={() => {
              onChange({ ...value, end_date: "" });
              setSelecting("end");
            }}
            className="mt-2 w-full text-[9px] font-black tracking-widest text-black/40 hover:text-black transition-colors py-1 border-t border-black/10"
          >
            HAPUS TANGGAL BERAKHIR ×
          </button>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker;
