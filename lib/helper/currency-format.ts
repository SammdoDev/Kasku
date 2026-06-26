// use-currency.ts — versi baru

"use client";

import { useEffect, useState, useCallback } from "react";
import { getCurrency } from "@/lib/i18n/use-translate";

export type CurrencyCode = "IDR" | "USD" | "SGD" | "MYR" | "EUR" | "JPY";

const CURRENCY_CONFIG: Record<CurrencyCode, { symbol: string; locale: string; decimals: number }> = {
  IDR: { symbol: "Rp", locale: "id-ID", decimals: 0 },
  USD: { symbol: "$", locale: "en-US", decimals: 2 },
  SGD: { symbol: "S$", locale: "en-SG", decimals: 2 },
  MYR: { symbol: "RM", locale: "ms-MY", decimals: 2 },
  EUR: { symbol: "€", locale: "de-DE", decimals: 2 },
  JPY: { symbol: "¥", locale: "ja-JP", decimals: 0 },
};

// Fallback hardcode kalau fetch gagal
const FALLBACK_RATES_FROM_IDR: Record<CurrencyCode, number> = {
  IDR: 1,
  USD: 0.000062,
  SGD: 0.000083,
  MYR: 0.000291,
  EUR: 0.000057,
  JPY: 0.0094,
};

// ─── Rate Cache (module-level, persist selama sesi) ───────────────────────────
let _ratesCache: Record<CurrencyCode, number> | null = null;
let _ratesFetchedAt = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 jam

async function fetchRatesFromIDR(): Promise<Record<CurrencyCode, number>> {
  const now = Date.now();
  if (_ratesCache && now - _ratesFetchedAt < CACHE_TTL) return _ratesCache;

  try {
    // Free API, no key needed — rates relative to IDR
    const res = await fetch("https://open.er-api.com/v6/latest/IDR");
    if (!res.ok) throw new Error("fetch failed");
    const data = await res.json();
    // data.rates berisi semua currency terhadap IDR (1 IDR = X currency)
    const rates: Record<CurrencyCode, number> = {
      IDR: 1,
      USD: data.rates.USD,
      SGD: data.rates.SGD,
      MYR: data.rates.MYR,
      EUR: data.rates.EUR,
      JPY: data.rates.JPY,
    };
    _ratesCache = rates;
    _ratesFetchedAt = now;
    return rates;
  } catch {
    // Fallback ke hardcode kalau offline / rate limit
    return FALLBACK_RATES_FROM_IDR;
  }
}

// ─── Format fungsi ────────────────────────────────────────────────────────────

/**
 * @param valueInIDR  - nilai dalam IDR
 * @param currency    - target currency
 * @param compact     - true = singkat (untuk card/chip), false = full (untuk detail)
 * @param rates       - rate terbaru, opsional (pakai fallback kalau tidak ada)
 */
export function formatCurrency(
  valueInIDR: unknown,
  currency: CurrencyCode = "IDR",
  compact = false,
  rates: Record<CurrencyCode, number> = FALLBACK_RATES_FROM_IDR,
): string {
  const n = Number(valueInIDR ?? 0);
  if (isNaN(n)) return `${CURRENCY_CONFIG[currency].symbol} 0`;

  const { symbol, locale, decimals } = CURRENCY_CONFIG[currency];
  const converted = currency === "IDR" ? n : n * rates[currency];

  if (compact && currency === "IDR") {
    // Mode ringkas — hanya untuk tampilan kecil
    const abs = Math.abs(n);
    if (abs >= 1_000_000_000) return `${symbol} ${(n / 1_000_000_000).toFixed(1)}M`;
    if (abs >= 1_000_000) return `${symbol} ${(n / 1_000_000).toFixed(1)}jt`;
    if (abs >= 1_000) return `${symbol} ${(n / 1_000).toFixed(0)}rb`;
    return `${symbol} ${n.toLocaleString(locale)}`;
  }

  // Mode full — format lengkap, selalu jelas
  return `${symbol} ${converted.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
  // Contoh: Rp 1.050.000 (bukan Rp 1.1jt)
}

export function convertFromIDR(
  valueInIDR: number,
  currency: CurrencyCode,
  rates: Record<CurrencyCode, number> = FALLBACK_RATES_FROM_IDR,
): number {
  return valueInIDR * rates[currency];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useCurrency() {
  const [currency, setCurrency] = useState<CurrencyCode>("IDR");
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(FALLBACK_RATES_FROM_IDR);
  const [ratesReady, setRatesReady] = useState(false);

  // Fetch rates sekali waktu mount
  const loadRates = useCallback(async () => {
    const fresh = await fetchRatesFromIDR();
    setRates(fresh);
    setRatesReady(true);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrency(getCurrency() as CurrencyCode);
    loadRates();

    const onCurrencyChange = () => setCurrency(getCurrency() as CurrencyCode);
    window.addEventListener("cashora:currency-change", onCurrencyChange);
    return () => window.removeEventListener("cashora:currency-change", onCurrencyChange);
  }, [loadRates]);

  /** Format lengkap — untuk halaman detail, modal, dll */
  const format = (value: unknown) =>
    formatCurrency(value, currency, false, rates);

  /** Format ringkas — untuk card kecil, chip, sidebar */
  const formatCompact = (value: unknown) =>
    formatCurrency(value, currency, true, rates);

  return { currency, format, formatCompact, rates, ratesReady };
}

export default function formatIDR(value: unknown): string {
  return formatCurrency(value, "IDR", false);
}