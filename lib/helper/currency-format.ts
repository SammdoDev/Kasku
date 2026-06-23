"use client";

import { useEffect, useState } from "react";
import { getCurrency } from "@/lib/i18n/use-translate";

export type CurrencyCode = "IDR" | "USD" | "SGD" | "MYR" | "EUR" | "JPY";

const RATES_FROM_IDR: Record<CurrencyCode, number> = {
  IDR: 1,
  USD: 0.000062,
  SGD: 0.000083,
  MYR: 0.000291,
  EUR: 0.000057,
  JPY: 0.0094,
};

const CURRENCY_CONFIG: Record<
  CurrencyCode,
  { symbol: string; locale: string; decimals: number }
> = {
  IDR: { symbol: "Rp", locale: "id-ID", decimals: 0 },
  USD: { symbol: "$", locale: "en-US", decimals: 2 },
  SGD: { symbol: "S$", locale: "en-SG", decimals: 2 },
  MYR: { symbol: "RM", locale: "ms-MY", decimals: 2 },
  EUR: { symbol: "€", locale: "de-DE", decimals: 2 },
  JPY: { symbol: "¥", locale: "ja-JP", decimals: 0 },
};

export function formatCurrency(
  valueInIDR: unknown,
  currency: CurrencyCode = "IDR",
): string {
  const n = Number(valueInIDR ?? 0);
  if (isNaN(n)) return `${CURRENCY_CONFIG[currency].symbol} 0`;

  const converted = n * RATES_FROM_IDR[currency];
  const { symbol, locale, decimals } = CURRENCY_CONFIG[currency];

  if (currency === "IDR") {
    if (Math.abs(n) >= 1_000_000_000)
      return `${symbol} ${(n / 1_000_000_000).toFixed(1)}M`;
    if (Math.abs(n) >= 1_000_000)
      return `${symbol} ${(n / 1_000_000).toFixed(1)}jt`;
    if (Math.abs(n) >= 1_000) return `${symbol} ${(n / 1_000).toFixed(0)}rb`;
    return `${symbol} ${n.toLocaleString(locale)}`;
  }

  return `${symbol} ${converted.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function convertFromIDR(
  valueInIDR: number,
  currency: CurrencyCode,
): number {
  return valueInIDR * RATES_FROM_IDR[currency];
}

export function useCurrency() {
  const [currency, setCurrency] = useState<CurrencyCode>("IDR");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrency(getCurrency() as CurrencyCode);
    const handler = () => setCurrency(getCurrency() as CurrencyCode);
    window.addEventListener("cashora:currency-change", handler);
    return () => window.removeEventListener("cashora:currency-change", handler);
  }, []);

  const format = (value: unknown) => formatCurrency(value, currency);

  return { currency, format };
}

export default function formatIDR(value: unknown): string {
  return formatCurrency(value, "IDR");
}
