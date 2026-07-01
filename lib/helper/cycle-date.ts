import { createServiceClient } from "@/lib/supabase/client";

export const getCycleStartDate = async (
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
): Promise<number> => {
  const { data } = await supabase
    .from("users")
    .select("cycle_start_date")
    .eq("id", userId)
    .single();
  return data?.cycle_start_date ?? 1;
};

const toLocalDateStr = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const calculateCycleDateRange = (
  month: string,
  cycleStart: number,
): { from: string; to: string } => {
  const [year, m] = month.split("-");
  const yearNum = Number(year);
  const monthNum = Number(m);

  const cycleFromDate = new Date(yearNum, monthNum - 1, cycleStart);
  const cycleToDate = new Date(yearNum, monthNum, cycleStart);
  cycleToDate.setDate(cycleToDate.getDate() - 1);

  return {
    from: toLocalDateStr(cycleFromDate),
    to: toLocalDateStr(cycleToDate),
  };
};

export const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

/**
 * Nentuin "cycle month" yang aktif SEKARANG berdasarkan cycleStart user.
 *
 * Beda sama getCurrentMonth() yang cuma ngambil bulan kalender polos —
 * ini mikirin: kalau hari ini masih SEBELUM tanggal cycleStart bulan ini,
 * berarti kita masih ada di cycle bulan sebelumnya.
 *
 * Contoh: cycleStart = 25, hari ini 1 Juli 2026
 *   → tanggal (1) < cycleStart (25) → cycle masih "2026-06"
 *   → range sebenarnya: 25 Juni - 24 Juli 2026
 *
 * Contoh: cycleStart = 25, hari ini 26 Juli 2026
 *   → tanggal (26) >= cycleStart (25) → cycle sudah "2026-07"
 *   → range sebenarnya: 25 Juli - 24 Agustus 2026
 */
export const getCurrentCycleMonth = (cycleStart: number): string => {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1; // 1-12

  if (now.getDate() < cycleStart) {
    month -= 1;
    if (month === 0) {
      month = 12;
      year -= 1;
    }
  }

  return `${year}-${String(month).padStart(2, "0")}`;
};

export const shiftMonth = (month: string, offset: number): string => {
  const [year, m] = month.split("-").map(Number);
  const d = new Date(year, m - 1 + offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const lastNMonthKeys = (n: number): string[] => {
  const current = getCurrentMonth();
  const result: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    result.push(shiftMonth(current, -i));
  }
  return result;
};

export const formatMonthLabel = (month: string): string => {
  const [year, m] = month.split("-").map(Number);
  const d = new Date(year, m - 1, 1);
  return d.toLocaleDateString("id-ID", { month: "short" }).toUpperCase();
};

export const formatCycleLabel = (range: {
  from: string;
  to: string;
}): string => {
  const from = new Date(range.from);
  const to = new Date(range.to);
  return `${from.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })} – ${to.toLocaleDateString(
    "id-ID",
    { day: "2-digit", month: "short", year: "numeric" },
  )}`;
};
