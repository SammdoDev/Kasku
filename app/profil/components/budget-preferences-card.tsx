"use client";

import { useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { get, patch, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import { Monitor, Moon, Pencil, Sun } from "lucide-react";
import NbToggle from "./nb-toggle";
import ChildModalWrapper from "@/components/layout/for-pages/child-modal-wrapper";
import ModalCycleStart from "./modal/modal-cycle-start";
import ModalCurrencyLang from "./modal/modal-currency-lang";
import {
  useTranslate,
  setLang,
  getLang,
  getCurrency,
  setCurrencyLocal,
} from "@/lib/i18n/use-translate";

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
  const CONSTANT = useTranslate();

  const [currency, setCurrency] = useState(() => getCurrency());
  const [language, setLanguage] = useState(() => getLang());
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
      const fetchedLang = (res.user.language ?? "id") as "id" | "en";
      const fetchedCurrency = res.user.currency ?? "IDR";

      setCurrency(fetchedCurrency);
      setCycleStartDate(res.user.cycle_start_date ?? 1);
      setLanguage(fetchedLang);
      setLang(fetchedLang);
      setCurrencyLocal(fetchedCurrency);
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
      toast.error(CONSTANT.failedUpdate, getApiError(err));
    }
  };

  const LANGUAGE_LABEL: Record<string, string> = {
    id: CONSTANT.indonesia,
    en: CONSTANT.english,
  };

  return (
    <>
      <div
        className="bg-card border-[3px] border-border shadow-[6px_6px_0_hsl(var(--border))] p-5"
        style={{ fontFamily: DASHBOARD_FONT }}
      >
        <span
          style={{ background: "var(--accent-bg)" }}
          className="inline-block text-[9px] font-black tracking-[0.22em] uppercase border-[2px] border-border px-2.5 py-1 mb-3"
        >
          {CONSTANT.budgetingPreferences}
        </span>

        {/* Currency & Language */}
        <div className="flex items-center justify-between py-3 border-b-[3px] border-border">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wide block">
              {CONSTANT.currencyAndLanguage}
            </span>
            {!loading && (
              <span className="text-[10px] font-bold text-foreground/40">
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
              {CONSTANT.change}
              <Pencil size={10} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Cycle Start Date */}
        <div className="flex items-center justify-between py-3 border-b-[3px] border-border">
          <span className="text-[11px] font-black uppercase tracking-wide">
            {CONSTANT.cycleStartDate}
          </span>
          {loading ? (
            <Skeleton className="h-6 w-16" />
          ) : (
            <button
              type="button"
              onClick={() => setCycleModalOpen(true)}
              className="flex items-center gap-1.5 text-[12px] font-black border-[2px] border-border px-3 py-1 bg-card hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[3px_3px_0_hsl(var(--border))] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-100"
            >
              {CONSTANT.datePrefix} {cycleStartDate}
              <Pencil size={10} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Budget Notification */}
        <div className="flex items-center justify-between py-3 border-b-[3px] border-border">
          <span className="text-[11px] font-black uppercase tracking-wide">
            {CONSTANT.budgetNotification}
          </span>
          <NbToggle
            checked={budgetNotifications}
            onChange={(v) => handleToggle("budget_notifications", v)}
            label={CONSTANT.budgetNotification}
          />
        </div>

        {/* Identity Reminder */}
        <div className="flex items-center justify-between py-3 border-b-[3px] border-border">
          <span className="text-[11px] font-black uppercase tracking-wide">
            {CONSTANT.identityReminder}
          </span>
          <NbToggle
            checked={identityReminder}
            onChange={(v) => handleToggle("identity_reminder", v)}
            label={CONSTANT.identityReminder}
          />
        </div>

        {/* Dark Mode */}
        <div className="flex items-center justify-between py-3">
          <span className="text-[11px] font-black uppercase tracking-wide">
            {CONSTANT.darkMode}
          </span>
          {!mountedTheme ? (
            <Skeleton className="h-7 w-[108px]" />
          ) : (
            <div className="flex border-[2px] border-border overflow-hidden">
              {(
                [
                  { value: "light", icon: Sun },
                  { value: "system", icon: Monitor },
                  { value: "dark", icon: Moon },
                ] as const
              ).map(({ value, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  className={`px-3 py-1.5 transition-all duration-100 ${
                    theme === value
                      ? "bg-foreground text-background"
                      : "bg-card text-foreground/50 hover:text-foreground"
                  }`}
                >
                  <Icon size={12} strokeWidth={2.5} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <ChildModalWrapper
        open={cycleModalOpen}
        onClose={() => setCycleModalOpen(false)}
        title={CONSTANT.cycleStartDate}
        subtitle={CONSTANT.chooseStartCycle}
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
        title={CONSTANT.currencyAndLanguage}
        subtitle={CONSTANT.setCurrencyLanguage}
        width="md"
      >
        <ModalCurrencyLang
          currentCurrency={currency}
          currentLanguage={language}
          onClose={() => setCurrencyLangModalOpen(false)}
          onSuccess={(c, l) => {
            setCurrency(c);
            setLanguage(l as "id" | "en");
            setLang(l as "id" | "en");
            setCurrencyLocal(c);
          }}
        />
      </ChildModalWrapper>
    </>
  );
};

export default BudgetPreferencesCard;
