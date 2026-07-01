"use client";

import { useEffect, useState } from "react";
import { get, getApiError } from "@/lib/helper/apiService";
import { useMonthFilter } from "@/components/ui/input-component/month-filter/store/month-filter-store";

// NOTE: endpoint-nya "/auth/profile" (samain sama BudgetPreferencesCard),
// bukan "/profile" — dan responsnya ke-nest di bawah "user",
// bukan flat { cycle_start_date }.
interface ProfileResponse {
  user: {
    cycle_start_date: number | null;
  };
}

const DEFAULT_CYCLE_START = 1;

export function useCycleStart() {
  const [cycleStartDay, setCycleStartDay] =
    useState<number>(DEFAULT_CYCLE_START);
  const [loading, setLoading] = useState(true);
  const syncCycleStart = useMonthFilter((s) => s.syncCycleStart);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await get<ProfileResponse>("/auth/profile");
        const day = res.user?.cycle_start_date;
        if (day && day >= 1 && day <= 31) {
          setCycleStartDay(day);
          syncCycleStart(day);
        } else {
          syncCycleStart(DEFAULT_CYCLE_START);
        }
      } catch (err) {
        // Diam-diam fallback ke default tanggal 1, gak perlu toast
        // karena ini bukan aksi eksplisit user.
        console.warn("[useCycleStart] gagal ambil profile:", getApiError(err));
        syncCycleStart(DEFAULT_CYCLE_START);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [syncCycleStart]);

  return { cycleStartDay, loading };
}
