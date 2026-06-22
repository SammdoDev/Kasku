"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTranslate } from "@/lib/i18n/use-translate";

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
  const CONSTANT = useTranslate();
  const initDate = value.start_date ? new Date(value.start_date) : new Date();
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());
  const [selecting, setSelecting] = useState<SelectingMode>("start");
  const [hovered, setHovered] = useState<string | null>(null);

  const DAYS = [
    CONSTANT.daySun ?? "Sen",
    CONSTANT.dayMon ?? "Sel",
    CONSTANT.dayTue ?? "Rab",
    CONSTANT.dayWed ?? "Kam",
    CONSTANT.dayThu ?? "Jum",
    CONSTANT.dayFri ?? "Sab",
    CONSTANT.daySat ?? "Min",
  ];

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
    return `${d} ${MONTHS[parseInt(m) - 1]} ${y}`;
  };

  return (
    <div className="w-full border-2 border-border bg-card">
      {/* Mode tabs */}
      <div className="flex border-b-2 border-border">
        <button
          type="button"
          onClick={() => setSelecting("start")}
          className={cn(
            "flex-1 px-3 py-2.5 text-left border-r-2 border-border transition-colors duration-75",
            selecting === "start"
              ? "bg-foreground"
              : "bg-card hover:bg-foreground/5",
          )}
        >
          <div
            className={cn(
              "text-[9px] font-black tracking-widest mb-0.5",
              selecting === "start"
                ? "text-background/50"
                : "text-foreground/40",
            )}
          >
            {CONSTANT.startDate ?? "MULAI"}
          </div>
          <div
            className={cn(
              "text-[11px] font-black",
              selecting === "start" ? "text-background" : "text-foreground",
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
              ? "bg-foreground"
              : "bg-card hover:bg-foreground/5",
          )}
        >
          <div
            className={cn(
              "text-[9px] font-black tracking-widest mb-0.5",
              selecting === "end" ? "text-background/50" : "text-foreground/40",
            )}
          >
            {CONSTANT.endDate ?? "BERAKHIR"}
            <span className="ml-1 font-medium normal-case tracking-normal opacity-60">
              ({CONSTANT.optional ?? "opsional"})
            </span>
          </div>
          <div
            className={cn(
              "text-[11px] font-black",
              selecting === "end"
                ? "text-background"
                : value.end_date
                  ? "text-foreground"
                  : "text-foreground/30",
            )}
          >
            {formatDisplay(value.end_date)}
          </div>
        </button>
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center border-2 border-border font-black text-lg hover:bg-foreground/5 active:brightness-90 transition-colors"
          >
            ‹
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-black tracking-wider">
              {MONTHS[viewMonth]} {viewYear}
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
              className="text-[9px] font-black tracking-widest px-2 py-0.5 border-2 transition-colors"
              style={{
                background: "var(--accent-bg)",
                color: "var(--accent-fg)",
                borderColor: "var(--accent-bg)",
              }}
            >
              {CONSTANT.today.toUpperCase()}
            </button>
          </div>
          <button
            type="button"
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center border-2 border-border font-black text-lg hover:bg-foreground/5 active:brightness-90 transition-colors"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d) => (
            <div
              key={d}
              className="text-center text-[9px] font-black text-foreground/40 py-1"
            >
              {d}
            </div>
          ))}
        </div>

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
                    ? "bg-foreground text-background"
                    : inRange
                      ? "bg-foreground/10 text-foreground"
                      : isToday
                        ? "text-foreground"
                        : "hover:bg-foreground/5 text-foreground",
                )}
                style={
                  isToday && !isStart && !isEnd
                    ? {
                        background: "var(--accent-bg)",
                        color: "var(--accent-fg)",
                      }
                    : undefined
                }
              >
                {day}
              </button>
            );
          })}
        </div>

        {value.end_date && (
          <button
            type="button"
            onClick={() => {
              onChange({ ...value, end_date: "" });
              setSelecting("end");
            }}
            className="mt-2 w-full text-[9px] font-black tracking-widest text-foreground/40 hover:text-foreground transition-colors py-1 border-t border-border/10"
          >
            {CONSTANT.clearEndDate ?? "HAPUS TANGGAL BERAKHIR"} ×
          </button>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker;
