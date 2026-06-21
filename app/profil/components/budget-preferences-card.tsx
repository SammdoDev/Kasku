"use client";

import { useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { get, patch, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import { Pencil } from "lucide-react";
import NbToggle from "./nb-toggle";
import ChildModalWrapper from "@/components/layout/for-pages/child-modal-wrapper";
import ModalCycleStart from "./modal/modal-cycle-start";
import ModalCurrencyLang from "./modal/modal-currency-lang";

interface ApiUser {
  currency: string;
  cycle_start_date: number | null;
  language: string | null;
}

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`rounded bg-foreground/10 animate-pulse ${className}`} />
);

const BudgetPreferencesCard = () => {
  const { theme, setTheme } = useTheme();
  const [mountedTheme, setMountedTheme] = useState(false);

  const [currency, setCurrency] = useState("IDR");
  const [language, setLanguage] = useState("id");
  const [cycleStartDate, setCycleStartDate] = useState(1);
  const [budgetNotifications, setBudgetNotifications] = useState(false);
  const [identityReminder, setIdentityReminder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cycleModalOpen, setCycleModalOpen] = useState(false);
  const [currencyLangModalOpen, setCurrencyLangModalOpen] = useState(false);

  useEffect(() => setMountedTheme(true), []);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await get<{ user: ApiUser }>("/auth/profile");
      setCurrency(res.user.currency ?? "IDR");
      setCycleStartDate(res.user.cycle_start_date ?? 1);
      setLanguage(res.user.language ?? "id");
    } catch (err) {
      toast.error("Gagal memuat preferensi", getApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleToggle = async (
    key: "budget_notifications" | "identity_reminder",
    value: boolean,
  ) => {
    try {
      await patch("/auth/profile", { [key]: value });
      if (key === "budget_notifications") setBudgetNotifications(value);
      if (key === "identity_reminder") setIdentityReminder(value);
    } catch (err) {
      toast.error("Gagal memperbarui", getApiError(err));
    }
  };

  const LANGUAGE_LABEL: Record<string, string> = {
    id: "Indonesia",
    en: "English",
  };

  return (
    <>
      <div
        className="bg-card border-[3px] border-border shadow-[6px_6px_0_hsl(var(--border))] p-5"
        style={{ fontFamily: DASHBOARD_FONT }}
      >
        <span className="inline-block bg-[var(--accent)] text-black text-[9px] font-black tracking-[0.22em] uppercase border-[2px] border-border px-2.5 py-1 mb-3">
          Preferensi Budgeting
        </span>

        {/* Currency & Bahasa — 1 row, 1 tombol edit */}
        <div className="flex items-center justify-between py-3 border-b-[3px] border-border">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wide block">
              Currency &amp; Bahasa
            </span>
            {!loading && (
              <span className="text-[10px] font-bold text-black/40">
                {currency} · {LANGUAGE_LABEL[language] ?? language}
              </span>
            )}
          </div>
          {loading ? (
            <Skeleton className="h-6 w-16" />
          ) : (
            <button
              type="button"
              onClick={() => setCurrencyLangModalOpen(true)}
              className="flex items-center gap-1.5 text-[11px] font-black border-[2px] border-border px-3 py-1 bg-card hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[3px_3px_0_hsl(var(--border))] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-100"
            >
              Ubah
              <Pencil size={10} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Cycle Start Date */}
        <div className="flex items-center justify-between py-3 border-b-[3px] border-border">
          <span className="text-[11px] font-black uppercase tracking-wide">
            Cycle Start Date
          </span>
          {loading ? (
            <Skeleton className="h-6 w-16" />
          ) : (
            <button
              type="button"
              onClick={() => setCycleModalOpen(true)}
              className="flex items-center gap-1.5 text-[12px] font-black border-[2px] border-border px-3 py-1 bg-card hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[3px_3px_0_hsl(var(--border))] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-100"
            >
              Tgl {cycleStartDate}
              <Pencil size={10} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Notifikasi Budget */}
        <div className="flex items-center justify-between py-3 border-b-[3px] border-border">
          <span className="text-[11px] font-black uppercase tracking-wide">
            Notifikasi Budget
          </span>
          <NbToggle
            checked={budgetNotifications}
            onChange={(v) => handleToggle("budget_notifications", v)}
            label="Notifikasi Budget"
          />
        </div>

        {/* Identity Reminder */}
        <div className="flex items-center justify-between py-3 border-b-[3px] border-border">
          <span className="text-[11px] font-black uppercase tracking-wide">
            Identity Reminder
          </span>
          <NbToggle
            checked={identityReminder}
            onChange={(v) => handleToggle("identity_reminder", v)}
            label="Identity Reminder"
          />
        </div>

        {/* Dark Mode */}
        <div className="flex items-center justify-between py-3">
          <span className="text-[11px] font-black uppercase tracking-wide">
            Dark Mode
          </span>
          {!mountedTheme ? (
            <Skeleton className="h-5 w-9" />
          ) : (
            <NbToggle
              checked={theme === "dark"}
              onChange={(v) => setTheme(v ? "dark" : "light")}
              label="Dark Mode"
            />
          )}
        </div>
      </div>

      <ChildModalWrapper
        open={cycleModalOpen}
        onClose={() => setCycleModalOpen(false)}
        title="CYCLE START DATE"
        subtitle="PILIH TANGGAL AWAL SIKLUS BUDGET"
        width="md"
      >
        <ModalCycleStart
          current={cycleStartDate}
          onClose={() => setCycleModalOpen(false)}
          onSuccess={(day) => setCycleStartDate(day)}
        />
      </ChildModalWrapper>

      <ChildModalWrapper
        open={currencyLangModalOpen}
        onClose={() => setCurrencyLangModalOpen(false)}
        title="CURRENCY & BAHASA"
        subtitle="ATUR MATA UANG DAN BAHASA APLIKASI"
        width="md"
      >
        <ModalCurrencyLang
          currentCurrency={currency}
          currentLanguage={language}
          onClose={() => setCurrencyLangModalOpen(false)}
          onSuccess={(c, l) => {
            setCurrency(c);
            setLanguage(l);
          }}
        />
      </ChildModalWrapper>
    </>
  );
};

export default BudgetPreferencesCard;
