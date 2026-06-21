"use client";

import { useEffect, useState } from "react";
import { post, patch, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import { Button } from "@/components/ui/button-component/button";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import { useDompetStore } from "../store/dompet-store";
import { Field, FieldLabel } from "@/components/ui/input-component/field-1";
import InputText from "@/components/ui/input-component/input-text/input-text";

const TYPE_OPTIONS = [
  { label: "Bank", value: "bank" },
  { label: "E-Wallet", value: "ewallet" },
  { label: "Cash", value: "cash" },
  { label: "Kartu Kredit", value: "credit" },
  { label: "Lainnya", value: "other" },
];

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
  const modalOpen = useDompetStore((s) => s.modalOpen);
  const [form, setForm] = useState<DompetForm>(FORM_DEFAULT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!modalOpen) return;
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
      toast.error("Nama dompet harus diisi");
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
        toast.success("Dompet diperbarui");
      } else {
        await post("/payment-methods", payload);
        toast.success("Dompet ditambahkan");
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error("Gagal menyimpan", getApiError(err));
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
        label="NAMA DOMPET *"
        placeholder="e.g. BCA, GoPay, Cash"
        value={form.name}
        onChange={(e) => set({ name: e.target.value })}
        maxLength={50}
      />

      <Field>
        <FieldLabel>TIPE</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set({ type: opt.value })}
              className={[
                "px-3 py-1.5 border-2 border-border text-[11px] font-black tracking-wider transition-all",
                form.type === opt.value
                  ? "bg-black text-white shadow-none translate-x-[2px] translate-y-[2px]"
                  : "bg-card text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Field>

      <InputText
        id="dompet-icon"
        label="ICON"
        placeholder="Wallet"
        value={form.icon}
        onChange={(e) => set({ icon: e.target.value })}
        maxLength={40}
      />

      <div className="flex gap-2 pt-2">
        <Button
          label="BATAL"
          variant="outline"
          onClick={onClose}
          className="flex-1"
        />
        <Button
          label={saving ? "MENYIMPAN..." : editTarget ? "SIMPAN" : "TAMBAH"}
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1"
        />
      </div>
    </div>
  );
};

export default ModalTambahDompet;
