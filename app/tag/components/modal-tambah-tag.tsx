"use client";

import { useEffect, useState } from "react";
import { post, patch, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import { Button } from "@/components/ui/button-component/button";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import { useTagStore } from "../store/tag-store";
import { Field, FieldLabel } from "@/components/ui/input-component/field-1";
import InputText from "@/components/ui/input-component/input-text/input-text";

const PRESET_COLORS = [
  "#f97316",
  "#ef4444",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f59e0b",
  "#84cc16",
  "#6366f1",
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
      className="flex flex-col gap-4 pt-4"
      style={{ fontFamily: DASHBOARD_FONT }}
    >
      <InputText
        id="tag-name"
        label="NAMA TAG *"
        placeholder="e.g. Liburan, Wajib, Darurat"
        value={form.name}
        onChange={(e) => set({ name: e.target.value })}
        maxLength={50}
      />

      <Field>
        <FieldLabel>WARNA</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set({ color: c })}
              className={[
                "w-7 h-7 border-2 transition-all",
                form.color === c
                  ? "border-border scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  : "border-transparent hover:border-border/40",
              ].join(" ")}
              style={{ background: c }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div
            className="w-8 h-8 border-2 border-border flex-shrink-0"
            style={{ background: form.color }}
          />
          <InputText
            id="tag-color"
            label=""
            placeholder="#6366f1"
            value={form.color}
            onChange={(e) => set({ color: e.target.value })}
            maxLength={7}
            fieldClassName="flex-1"
          />
        </div>
      </Field>

      <Field>
        <FieldLabel>PREVIEW</FieldLabel>
        <span
          className="w-fit px-2.5 py-1 border-2 text-[11px] font-black tracking-wider"
          style={{
            borderColor: form.color,
            color: form.color,
            background: form.color + "18",
          }}
        >
          #{form.name || "tag"}
        </span>
      </Field>

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

export default ModalTambahTag;
