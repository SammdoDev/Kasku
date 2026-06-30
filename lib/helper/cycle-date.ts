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
    from: cycleFromDate.toISOString().split("T")[0],
    to: cycleToDate.toISOString().split("T")[0],
  };
};

export const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
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
