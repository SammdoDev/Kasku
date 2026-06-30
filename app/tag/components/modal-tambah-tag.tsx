"use client";

import { useEffect, useState } from "react";
import { post, patch, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import { Button } from "@/components/ui/button-component/button";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import { useTagStore } from "../store/tag-store";
import { Field, FieldLabel } from "@/components/ui/input-component/field-1";
import InputText from "@/components/ui/input-component/input-text/input-text";
import { Hash } from "lucide-react";

const PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
  "#f43f5e",
  "#64748b",
];

export interface TagForm {
  name: string;
  color: string;
}

const FORM_DEFAULT: TagForm = { name: "", color: "#6366f1" };

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
  editTarget?: { id: string; name: string; color: string | null } | null;
}

const ModalTambahTag = ({ onClose, onSuccess, editTarget }: Props) => {
  const modalOpen = useTagStore((s) => s.modalOpen);
  const [form, setForm] = useState<TagForm>(FORM_DEFAULT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!modalOpen) return;
    if (editTarget) {
      setForm({ name: editTarget.name, color: editTarget.color ?? "#6366f1" });
    } else {
      setForm(FORM_DEFAULT);
    }
  }, [modalOpen, editTarget]);

  const set = (val: Partial<TagForm>) =>
    setForm((prev) => ({ ...prev, ...val }));

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Nama tag harus diisi");
      return;
    }

    const payload = { name: form.name.trim(), color: form.color || null };

    setSaving(true);
    try {
      if (editTarget) {
        await patch(`/tags/${editTarget.id}`, payload);
        toast.success("Tag diperbarui");
      } else {
        await post("/tags", payload);
        toast.success("Tag ditambahkan");
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
      className="flex flex-col gap-5 pt-4 font-mono"
      style={{ fontFamily: DASHBOARD_FONT }}
    >
      <InputText
        id="tag-name"
        label="NAMA TAG *"
        placeholder="e.g. Liburan, Wajib, Darurat"
        value={form.name}
        onChange={(e) => set({ name: e.target.value })}
        maxLength={50}
        fieldClassName="flex flex-col gap-1"
      />

      <div className="flex flex-col gap-1">
        <FieldLabel>WARNA</FieldLabel>
        <div className="flex flex-wrap gap-2 items-center">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set({ color: c })}
              className={[
                "w-7 h-7 border-2 transition-all duration-100",
                form.color === c
                  ? "border-border scale-110 shadow-[2px_2px_0px_hsl(var(--border))]"
                  : "border-transparent hover:border-border/40",
              ].join(" ")}
              style={{ background: c }}
            />
          ))}
          <div className="relative">
            <input
              type="color"
              value={form.color}
              onChange={(e) => set({ color: e.target.value })}
              className="w-7 h-7 border-2 border-border cursor-pointer opacity-0 absolute inset-0"
            />
            <div
              className="w-7 h-7 border-2 border-border border-dashed flex items-center justify-center text-[8px] font-black"
              style={{ background: form.color }}
            >
              +
            </div>
          </div>
          <span className="text-[10px] font-mono font-black text-foreground/40 uppercase">
            {form.color}
          </span>
        </div>
      </div>

      <Field>
        <FieldLabel>PREVIEW</FieldLabel>
        <div
          className="flex items-center gap-3 border-2 border-border p-3"
          style={{ background: form.color + "11" }}
        >
          <div
            className="w-9 h-9 border-2 border-border flex items-center justify-center shrink-0"
            style={{ background: form.color + "33" }}
          >
            <Hash size={16} strokeWidth={3} style={{ color: form.color }} />
          </div>
          <span
            className="px-2.5 py-1 border-2 text-[11px] font-black tracking-wider shadow-[2px_2px_0px_0px_hsl(var(--border))]"
            style={{
              borderColor: form.color,
              color: form.color,
              background: form.color + "18",
            }}
          >
            #{form.name || "tag"}
          </span>
        </div>
      </Field>

      <div className="flex flex-col sm:flex-row gap-2 pt-1">
        <Button
          label="BATAL"
          variant="outline"
          onClick={onClose}
          className="w-full sm:flex-1"
        />
        <Button
          label={saving ? "MENYIMPAN..." : editTarget ? "SIMPAN" : "TAMBAH"}
          onClick={handleSubmit}
          disabled={saving}
          className="w-full sm:flex-1"
        />
      </div>
    </div>
  );
};

export default ModalTambahTag;
