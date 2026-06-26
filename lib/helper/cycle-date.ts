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
