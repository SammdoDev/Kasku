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

const SESSION_KEY = "cashora_lang";

export function getLang(): Locale {
  if (typeof window === "undefined") return "id";
  return (sessionStorage.getItem(SESSION_KEY) as Locale) ?? "id";
}

export function setLang(lang: Locale) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, lang);
  window.dispatchEvent(new Event("cashora:lang-change"));
}

export function useTranslate(): TranslationMap {
  const [lang, setLangState] = useState<Locale>("id");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLangState(getLang());
    const handler = () => setLangState(getLang());
    window.addEventListener("cashora:lang-change", handler);
    return () => window.removeEventListener("cashora:lang-change", handler);
  }, []);

  return LOCALES[lang];
}