"use client";

import { useEffect, useState } from "react";
import { post, patch, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import { Button } from "@/components/ui/button-component/button";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import { useDompetStore } from "../store/dompet-store";
import { Field, FieldLabel } from "@/components/ui/input-component/field-1";
import InputText from "@/components/ui/input-component/input-text/input-text";
import { useTranslate } from "@/lib/i18n/use-translate";
import EmojiPicker, { OpenmojiImg } from "@/app/kategori/components/emoji-picker";

export interface DompetForm {
  name: string;
  type: string;
  icon: string;
}

const FORM_DEFAULT: DompetForm = { name: "", type: "cash", icon: "" };

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
  editTarget?: {
    id: string;
    name: string;
    type: string | null;
    icon: string | null;
  } | null;
}

const ModalTambahDompet = ({ onClose, onSuccess, editTarget }: Props) => {
  const CONSTANT = useTranslate();
  const modalOpen = useDompetStore((s) => s.modalOpen);
  const [form, setForm] = useState<DompetForm>(FORM_DEFAULT);
  const [saving, setSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const TYPE_OPTIONS = [
    { label: "Bank", value: "bank" },
    { label: "E-Wallet", value: "ewallet" },
    { label: "Cash", value: "cash" },
    { label: CONSTANT.creditCard ?? "Kartu Kredit", value: "credit" },
    { label: CONSTANT.other ?? "Lainnya", value: "other" },
  ];

  useEffect(() => {
    if (!modalOpen) return;
    setShowPicker(false);
    if (editTarget) {
      setForm({
        name: editTarget.name,
        type: editTarget.type ?? "cash",
        icon: editTarget.icon ?? "",
      });
    } else {
      setForm(FORM_DEFAULT);
    }
  }, [modalOpen, editTarget]);

  const set = (val: Partial<DompetForm>) =>
    setForm((prev) => ({ ...prev, ...val }));

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error(CONSTANT.walletNameRequired ?? "Nama dompet harus diisi");
      return;
    }

    const payload = {
      name: form.name.trim(),
      type: form.type || null,
      icon: form.icon.trim() || null,
    };

    setSaving(true);
    try {
      if (editTarget) {
        await patch(`/payment-methods/${editTarget.id}`, payload);
        toast.success(CONSTANT.walletUpdated ?? "Dompet diperbarui");
      } else {
        await post("/payment-methods", payload);
        toast.success(CONSTANT.walletAdded ?? "Dompet ditambahkan");
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(CONSTANT.failedUpdate, getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="flex flex-col gap-4 pt-4"
      style={{ fontFamily: DASHBOARD_FONT }}
    >
      <InputText
        id="dompet-name"
        label={`${CONSTANT.wallet.toUpperCase()} *`}
        placeholder="e.g. BCA, GoPay, Cash"
        value={form.name}
        onChange={(e) => set({ name: e.target.value })}
        maxLength={50}
      />

      <Field>
        <FieldLabel>{CONSTANT.type ?? "TIPE"}</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set({ type: opt.value })}
              className={[
                "px-3 py-1.5 border-2 border-border text-[11px] font-black tracking-wider transition-all",
                form.type === opt.value
                  ? "bg-foreground text-background shadow-none translate-x-[2px] translate-y-[2px]"
                  : "bg-card text-foreground shadow-[3px_3px_0px_0px_hsl(var(--border))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Field>

      {/* Icon Picker */}
      <Field>
        <FieldLabel>ICON</FieldLabel>
        <button
          type="button"
          onClick={() => setShowPicker((v) => !v)}
          className={[
            "flex items-center gap-3 px-3 py-2 border-2 border-border bg-card w-full text-left transition-all",
            showPicker
              ? "shadow-none translate-x-[2px] translate-y-[2px]"
              : "shadow-[3px_3px_0px_0px_hsl(var(--border))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
          ].join(" ")}
        >
          {form.icon ? (
            <>
              <OpenmojiImg hexcode={form.icon} size={24} alt="selected icon" />
              <span className="text-[11px] font-black text-foreground">
                {form.icon.toUpperCase()}
              </span>
            </>
          ) : (
            <span className="text-[11px] font-black text-foreground/40">
              {CONSTANT.selectIcon ?? "PILIH ICON"}
            </span>
          )}
          {form.icon && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                set({ icon: "" });
                setShowPicker(false);
              }}
              className="ml-auto text-[9px] font-black text-foreground/40 hover:text-destructive"
            >
              ✕
            </button>
          )}
        </button>

        {showPicker && (
          <div className="mt-1">
            <EmojiPicker
              value={form.icon || null}
              onChange={(hexcode) => {
                set({ icon: hexcode });
                setShowPicker(false);
              }}
            />
          </div>
        )}
      </Field>

      <div className="flex gap-2 pt-2">
        <Button
          label={CONSTANT.cancel}
          variant="outline"
          onClick={onClose}
          className="flex-1"
        />
        <Button
          label={
            saving
              ? CONSTANT.loading
              : editTarget
                ? CONSTANT.save
                : CONSTANT.add
          }
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1"
        />
      </div>
    </div>
  );
};

export default ModalTambahDompet;
