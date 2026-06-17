export type CurrencyCode = "IDR" | "USD" | "SGD" | "MYR" | "EUR" | "JPY";

// Rate terhadap IDR (update berkala atau pakai API)
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

/**
 * Format nilai IDR ke currency target, dengan shorthand untuk IDR
 */
export function formatCurrency(
  valueInIDR: unknown,
  currency: CurrencyCode = "IDR",
): string {
  const n = Number(valueInIDR ?? 0);
  if (isNaN(n)) return `${CURRENCY_CONFIG[currency].symbol} 0`;

  const converted = n * RATES_FROM_IDR[currency];
  const { symbol, locale, decimals } = CURRENCY_CONFIG[currency];

  // Shorthand hanya untuk IDR
  if (currency === "IDR") {
    if (Math.abs(n) >= 1_000_000_000)
      return `${symbol} ${(n / 1_000_000_000).toFixed(1)}M`;
    if (Math.abs(n) >= 1_000_000)
      return `${symbol} ${(n / 1_000_000).toFixed(1)}jt`;
    if (Math.abs(n) >= 1_000) return `${symbol} ${(n / 1_000).toFixed(0)}rb`;
    return `${symbol} ${n.toLocaleString(locale)}`;
  }

  // Currency lain: format normal dengan desimal
  return `${symbol} ${converted.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Konversi nilai IDR ke currency lain (return number)
 */
export function convertFromIDR(
  valueInIDR: number,
  currency: CurrencyCode,
): number {
  return valueInIDR * RATES_FROM_IDR[currency];
}

/**
 * Backward-compat — tetap bisa import formatIDR seperti sebelumnya
 */
export default function formatIDR(value: unknown): string {
  return formatCurrency(value, "IDR");
}
