"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { get, getApiError } from "@/lib/helper/apiService";
import { useMonthFilter } from "@/components/ui/input-component/month-filter/store/month-filter-store";

interface ProfileResponse {
  user: {
    cycle_start_date: number | null;
  };
}

const DEFAULT_CYCLE_START = 1;

const PUBLIC_PATHS = ["/login", "/sign-up"];

export function useCycleStart() {
  const [cycleStartDay, setCycleStartDay] =
    useState<number>(DEFAULT_CYCLE_START);
  const [loading, setLoading] = useState(true);
  const syncCycleStart = useMonthFilter((s) => s.syncCycleStart);
  const pathname = usePathname();

  useEffect(() => {
    // Jangan fetch profile kalau lagi di halaman publik (belum login)
    if (PUBLIC_PATHS.some((p) => pathname?.startsWith(p))) {
      setLoading(false);
      return;
    }

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
        console.warn("[useCycleStart] gagal ambil profile:", getApiError(err));
        syncCycleStart(DEFAULT_CYCLE_START);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [syncCycleStart, pathname]);

  return { cycleStartDay, loading };
}
