"use client";

import { useState } from "react";
import ChildModalWrapper from "@/components/layout/for-pages/child-modal-wrapper";
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

interface CalendarDialogProps {
  open: boolean;
  date: string;
  onConfirm: (date: string) => void;
  onClose: () => void;
}

const CalendarDialog = ({
  open,
  date,
  onConfirm,
  onClose,
}: CalendarDialogProps) => {
  const CONSTANT = useTranslate();
  const parsed = date ? new Date(date) : new Date();
  const [viewYear, setViewYear] = useState(parsed.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed.getMonth());

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const DAYS = [
    CONSTANT.daySun,
    CONSTANT.dayMon,
    CONSTANT.dayTue,
    CONSTANT.dayWed,
    CONSTANT.dayThu,
    CONSTANT.dayFri,
    CONSTANT.daySat,
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

  const handleSelect = (day: number) => {
    onConfirm(makeDate(day));
    onClose();
  };

  return (
    <ChildModalWrapper
      open={open}
      onClose={onClose}
      title={CONSTANT.chooseDate.toUpperCase()}
      subtitle={CONSTANT.transactionDate.toUpperCase()}
      width="sm"
    >
      <div className="pt-3 pb-1">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={prevMonth}
            className="w-9 h-9 flex items-center justify-center border-2 border-border text-foreground font-black text-lg hover:bg-foreground/5 active:brightness-90 transition-colors"
          >
            ‹
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-black tracking-wider text-foreground">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={() => {
                onConfirm(todayStr);
                onClose();
              }}
              className="text-[9px] font-black tracking-widest px-2 py-0.5 border-2 transition-colors"
              style={{
                color: "var(--accent-fg)",
                background: "var(--accent-bg)",
                borderColor: "var(--accent-bg)",
              }}
            >
              {CONSTANT.today.toUpperCase()}
            </button>
          </div>
          <button
            type="button"
            onClick={nextMonth}
            className="w-9 h-9 flex items-center justify-center border-2 border-border text-foreground font-black text-lg hover:bg-foreground/5 active:brightness-90 transition-colors"
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
            const isSelected = ds === date;
            const isTodayCell = ds === todayStr;
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(day)}
                className={cn(
                  "text-[13px] font-black py-2 transition-colors duration-75 active:brightness-90",
                  isSelected
                    ? "bg-foreground text-background"
                    : isTodayCell
                      ? "text-foreground"
                      : "hover:bg-foreground/5 text-foreground",
                )}
                style={
                  isTodayCell && !isSelected
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
    </ChildModalWrapper>
  );
};

export default CalendarDialog;
