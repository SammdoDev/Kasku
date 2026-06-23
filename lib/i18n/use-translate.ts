"use client";

import { useEffect, useState } from "react";
import idLocale from "./locales/id.json";
import enLocale from "./locales/en.json";

type Locale = "id" | "en";
export type TranslationMap = typeof idLocale;

const LOCALES: Record<Locale, TranslationMap> = {
  id: idLocale,
  en: enLocale as TranslationMap,
};

const LANG_KEY = "cashora_lang";
const CURRENCY_KEY = "cashora_currency";

export function getLang(): Locale {
  if (typeof window === "undefined") return "id";
  return (localStorage.getItem(LANG_KEY) as Locale) ?? "id";
}

export function setLang(lang: Locale) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LANG_KEY, lang);
  window.dispatchEvent(new Event("cashora:lang-change"));
}

export function getCurrency(): string {
  if (typeof window === "undefined") return "IDR";
  return localStorage.getItem(CURRENCY_KEY) ?? "IDR";
}

export function setCurrencyLocal(currency: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CURRENCY_KEY, currency);
  window.dispatchEvent(new Event("cashora:currency-change")); // tambah ini
}

export function useTranslate(): TranslationMap {
  const [lang, setLangState] = useState<Locale>("id"); // always start with "id" for SSR

  useEffect(() => {
    // On mount, immediately sync with localStorage
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLangState(getLang());

    const handler = () => setLangState(getLang());
    window.addEventListener("cashora:lang-change", handler);
    return () => window.removeEventListener("cashora:lang-change", handler);
  }, []);

  return LOCALES[lang];
}
