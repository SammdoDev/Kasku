"use client";

import { useEffect, useState } from "react";
import { get, getApiError } from "@/lib/helper/apiService";

interface ProfileResponse {
  cycle_start_date?: number | null;
}

const DEFAULT_CYCLE_START = 1;

export function useCycleStart() {
  const [cycleStartDay, setCycleStartDay] = useState<number>(
    DEFAULT_CYCLE_START,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await get<ProfileResponse>("/profile");
        const day = res.cycle_start_date;
        if (day && day >= 1 && day <= 31) {
          setCycleStartDay(day);
        }
      } catch (err) {
        // Diam-diam fallback ke default tanggal 1, gak perlu toast
        // karena ini bukan aksi eksplisit user.
        console.warn("[useCycleStart] gagal ambil profile:", getApiError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return { cycleStartDay, loading };
}