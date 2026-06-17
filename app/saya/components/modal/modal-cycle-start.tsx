"use client";

import { useState } from "react";
import { patch, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import { Button } from "@/components/ui/button-component/button";
import CalendarPicker from "@/components/ui/input-component/calendar-component/calendar-picker";

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

export default function ModalCycleStart({
  current,
  onClose,
  onSuccess,
}: Props) {
  const [dateStr, setDateStr] = useState(toDateStr(current));
  const [loading, setLoading] = useState(false);

  const selectedDay = parseInt(dateStr.split("-")[2]);
  const isOver28 = selectedDay > 28;

  const handleSubmit = async () => {
    if (isOver28) {
      toast.error(
        "Validasi gagal",
        "Tanggal maksimal 28 untuk kompatibilitas semua bulan.",
      );
      return;
    }
    setLoading(true);
    try {
      await patch("/auth/profile", { cycle_start_date: selectedDay });
      toast.success("Cycle start date diperbarui");
      onSuccess(selectedDay);
      onClose();
    } catch (err) {
      toast.error("Gagal memperbarui", getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 font-mono">
      <CalendarPicker value={dateStr} onChange={setDateStr} />

      <div className="flex items-center gap-2 border-[2px] border-black px-3 py-2 bg-[#F5F3EE]">
        <span className="text-[10px] font-bold text-black/50">
          TANGGAL DIPILIH
        </span>
        <span className="text-[13px] font-black ml-auto">{selectedDay}</span>
        {isOver28 && (
          <span className="text-[9px] font-black text-red-600 uppercase tracking-wide">
            Maks. 28
          </span>
        )}
      </div>

      <p className="text-[10px] font-bold text-black/35">
        Bulan dan tahun diabaikan — hanya tanggal yang disimpan sebagai awal
        siklus budget.
      </p>

      <div className="flex gap-2">
        <Button
          variant="outline"
          label="BATAL"
          className="flex-1"
          onClick={onClose}
          disabled={loading}
        />
        <Button
          label={loading ? "MENYIMPAN..." : "SIMPAN"}
          className="flex-1"
          onClick={handleSubmit}
          disabled={loading || isOver28}
        />
      </div>
    </div>
  );
}
