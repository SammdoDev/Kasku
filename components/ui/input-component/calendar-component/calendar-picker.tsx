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

interface CalendarPickerProps {
  value: string;
  onChange: (date: string) => void;
}

const CalendarPicker = ({ value, onChange }: CalendarPickerProps) => {
  const CONSTANT = useTranslate();
  const parsed = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(parsed.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed.getMonth());

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

  return (
    <div className="w-full border-2 border-border bg-card p-3">
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
            onClick={() => onChange(todayStr)}
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
                  ? "bg-foreground text-background"
                  : isToday
                    ? "text-foreground"
                    : "hover:bg-foreground/5 text-foreground",
              )}
              style={
                isToday && !isSelected
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
    </div>
  );
};

export default CalendarPicker;
