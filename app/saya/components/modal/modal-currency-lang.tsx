"use client";

import { useState } from "react";
import { patch, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import { Button } from "@/components/ui/button-component/button";
import { Label } from "@/components/ui/input-component/label";

const CURRENCY_OPTIONS = [
  { value: "IDR", label: "IDR — Rupiah Indonesia" },
  { value: "USD", label: "USD — US Dollar" },
  { value: "SGD", label: "SGD — Singapore Dollar" },
  { value: "MYR", label: "MYR — Malaysian Ringgit" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "JPY", label: "JPY — Japanese Yen" },
];

const LANGUAGE_OPTIONS = [
  { value: "id", label: "🇮🇩  Bahasa Indonesia" },
  { value: "en", label: "🇺🇸  English" },
];

interface Props {
  currentCurrency: string;
  currentLanguage: string;
  onClose: () => void;
  onSuccess: (currency: string, language: string) => void;
}

export default function ModalCurrencyLang({
  currentCurrency,
  currentLanguage,
  onClose,
  onSuccess,
}: Props) {
  const [currency, setCurrency] = useState(currentCurrency);
  const [language, setLanguage] = useState(currentLanguage);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await patch("/auth/profile", { currency, language });
      toast.success("Preferensi diperbarui");
      onSuccess(currency, language);
      onClose();
    } catch (err) {
      toast.error("Gagal memperbarui", getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 font-mono">
      <div className="flex flex-col gap-2">
        <Label>MATA UANG</Label>
        <div className="flex flex-col gap-1.5">
          {CURRENCY_OPTIONS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCurrency(c.value)}
              className={[
                "flex items-center justify-between px-3 py-2.5 border-[2px] text-left transition-all duration-100",
                currency === c.value
                  ? "border-black bg-black text-[#CBFF4D]"
                  : "border-black bg-white hover:bg-[#f5f5f5]",
              ].join(" ")}
            >
              <span className="text-[11px] font-black">{c.label}</span>
              {currency === c.value && (
                <span className="text-[9px] font-black tracking-widest">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>BAHASA</Label>
        <div className="flex flex-col gap-1.5">
          {LANGUAGE_OPTIONS.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => setLanguage(l.value)}
              className={[
                "flex items-center justify-between px-3 py-2.5 border-[2px] text-left transition-all duration-100",
                language === l.value
                  ? "border-black bg-black text-[#CBFF4D]"
                  : "border-black bg-white hover:bg-[#f5f5f5]",
              ].join(" ")}
            >
              <span className="text-[11px] font-black">{l.label}</span>
              {language === l.value && (
                <span className="text-[9px] font-black tracking-widest">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          label="BATAL"
          className="flex-1"
          onClick={onClose}
          disabled={loading}
        />
        <Button
          label={loading ? "MENYIMPAN..." : "SIMPAN"}
          className="flex-1"
          onClick={handleSubmit}
          disabled={loading}
        />
      </div>
    </div>
  );
}
