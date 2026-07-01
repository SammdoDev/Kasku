"use client";

import { useEffect, useState } from "react";
import { patch, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import { Button } from "@/components/ui/button-component/button";
import CalendarPicker from "@/components/ui/input-component/calendar-component/calendar-picker";
import { useTranslate } from "@/lib/i18n/use-translate";
import { useMonthFilter } from "@/components/ui/input-component/month-filter/store/month-filter-store";

interface Props {
  current: number;
  onClose: () => void;
  onSuccess: (day: number) => void;
}

const toDateStr = (day: number) => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(Math.min(day, 28)).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const ModalCycleStart = ({ current, onClose, onSuccess }: Props) => {
  const CONSTANT = useTranslate();
  const [dateStr, setDateStr] = useState(toDateStr(current));
  const [loading, setLoading] = useState(false);
  const setCycleStart = useMonthFilter((s) => s.setCycleStart);

  const selectedDay = parseInt(dateStr.split("-")[2]);
  const isOver28 = selectedDay > 28;

  useEffect(() => {
    setDateStr(toDateStr(current));
  }, [current]);

  const handleSubmit = async () => {
    if (isOver28) {
      toast.error(
        CONSTANT.failed,
        "Tanggal maksimal 28 untuk kompatibilitas semua bulan.",
      );
      return;
    }
    setLoading(true);
    try {
      await patch("/auth/cycle-start", { cycle_start_date: selectedDay });
      toast.success(CONSTANT.success);
      // Update store GLOBAL, bukan cuma state lokal — biar MonthFilter,
      // SummaryCardsDesktop, AppDashboard, AppTransaksi semua langsung
      // ke-refresh pakai cycleStart baru tanpa perlu reload.
      setCycleStart(selectedDay);
      onSuccess(selectedDay);
      onClose();
    } catch (err) {
      toast.error(CONSTANT.failedUpdate, getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 font-mono">
      <CalendarPicker value={dateStr} onChange={setDateStr} />

      <div className="flex items-center gap-2 border-[2px] border-border px-3 py-2">
        <span className="text-[10px] font-bold">{CONSTANT.chooseDate}</span>
        <span className="text-[13px] font-black ml-auto">{selectedDay}</span>
        {isOver28 && (
          <span className="text-[9px] uppercase tracking-wide">Maks. 28</span>
        )}
      </div>

      <p className="text-[10px] font-bold">{CONSTANT.chooseStartCycle}</p>

      <div className="flex gap-2">
        <Button
          variant="outline"
          label={CONSTANT.cancel}
          className="flex-1"
          onClick={onClose}
          disabled={loading}
        />
        <Button
          label={loading ? CONSTANT.loading : CONSTANT.save}
          className="flex-1"
          onClick={handleSubmit}
          disabled={loading || isOver28}
        />
      </div>
    </div>
  );
};

export default ModalCycleStart;
