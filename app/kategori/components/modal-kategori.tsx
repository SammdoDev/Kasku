"use client";

import { useEffect, useState } from "react";
import { post, patch, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";
import { useKategoriStore, type Category } from "../store/kategori-store";
import EmojiPicker, { OpenmojiImg } from "./emoji-picker";
import TabFilter from "@/components/ui/input-component/tab-filter.tsx/tab-filter";
import { Button } from "@/components/ui/button-component/button";
import { EMOJI_OPTIONS } from "./emoji-option";
import InputText from "@/components/ui/input-component/input-text/input-text";
import { Label } from "@/components/ui/input-component/label";
import { useTranslate } from "@/lib/i18n/use-translate";

const COLOR_PRESETS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
  "#f43f5e",
  "#64748b",
  "#1a1a1a",
  "#78716c",
  "#fbbf24",
];

interface ModalKategoriProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ModalKategori = ({ onClose, onSuccess }: ModalKategoriProps) => {
  const CONSTANT = useTranslate();
  const editTarget = useKategoriStore((s) => s.editTarget);
  const addCategory = useKategoriStore((s) => s.addCategory);
  const updateCategory = useKategoriStore((s) => s.updateCategory);
  const isEdit = !!editTarget;

  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [icon, setIcon] = useState<string | null>(null);
  const [color, setColor] = useState<string>("#6366f1");
  const [loading, setLoading] = useState(false);

  const TYPE_OPTIONS = [
    { label: CONSTANT.expense.toUpperCase(), value: "expense" },
    { label: CONSTANT.income.toUpperCase(), value: "income" },
  ];

  useEffect(() => {
    if (editTarget) {
      setName(editTarget.name);
      setType(editTarget.type);
      setIcon(editTarget.icon ?? null);
      setColor(editTarget.color ?? "#6366f1");
    } else {
      setName("");
      setType("expense");
      setIcon(null);
      setColor("#6366f1");
    }
  }, [editTarget]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error(
        CONSTANT.failed,
        `${CONSTANT.name} ${CONSTANT.category.toLowerCase()} wajib diisi.`,
      );
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        type,
        icon: icon ?? undefined,
        color,
      };
      if (isEdit && editTarget) {
        const res = await patch<{ category: Category }>(
          `/categories/${editTarget.id}`,
          payload,
        );
        updateCategory(res.category);
        toast.success(CONSTANT.categoryUpdated ?? "Kategori diperbarui");
      } else {
        const res = await post<{ category: Category }>("/categories", payload);
        addCategory(res.category);
        toast.success(CONSTANT.categoryAdded ?? "Kategori ditambahkan");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(CONSTANT.failedUpdate, getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const selectedEmojiMeta = icon
    ? EMOJI_OPTIONS.find((e) => e.hexcode === icon)
    : null;

  return (
    <div className="flex flex-col gap-5 font-mono">
      <div className="flex flex-col gap-1">
        <Label>{CONSTANT.type?.toUpperCase() ?? "TIPE"}</Label>
        <TabFilter
          value={type}
          onChange={(v) => setType((v || "expense") as "income" | "expense")}
          options={TYPE_OPTIONS}
          showAll={false}
        />
      </div>

      <InputText
        id="kategori-name"
        label={`${CONSTANT.name?.toUpperCase() ?? "NAMA"} ${CONSTANT.category.toUpperCase()}`}
        required
        type="text"
        placeholder="Contoh: Makan Siang"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fieldClassName="flex flex-col gap-1"
      />

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <Label>EMOJI</Label>
          {icon && (
            <button
              type="button"
              onClick={() => setIcon(null)}
              className="text-[9px] font-black text-foreground/30 hover:text-foreground transition-colors"
            >
              {CONSTANT.delete} EMOJI
            </button>
          )}
        </div>
        <EmojiPicker value={icon} onChange={setIcon} />
      </div>

      <div className="flex flex-col gap-1">
        <Label>{CONSTANT.accentColor?.toUpperCase() ?? "WARNA"}</Label>
        <div className="flex flex-wrap gap-2 items-center">
          {COLOR_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={[
                "w-7 h-7 border-2 transition-all duration-100",
                color === c
                  ? "border-border scale-110 shadow-[2px_2px_0px_hsl(var(--border))]"
                  : "border-transparent hover:border-border/40",
              ].join(" ")}
              style={{ background: c }}
            />
          ))}
          <div className="relative">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-7 h-7 border-2 border-border cursor-pointer opacity-0 absolute inset-0"
            />
            <div
              className="w-7 h-7 border-2 border-border border-dashed flex items-center justify-center text-[8px] font-black"
              style={{ background: color }}
            >
              +
            </div>
          </div>
          <span className="text-[10px] font-mono font-black text-foreground/40">
            {color}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>PREVIEW</Label>
        <div
          className="flex items-center gap-3 border-2 border-border p-3"
          style={{ background: color + "11" }}
        >
          <div
            className="w-9 h-9 border-2 border-border flex items-center justify-center shrink-0"
            style={{ background: color + "33" }}
          >
            {icon ? (
              <OpenmojiImg
                hexcode={icon}
                size={20}
                alt={selectedEmojiMeta?.label ?? icon}
              />
            ) : (
              <span className="text-[10px] font-black" style={{ color }}>
                {name.charAt(0).toUpperCase() || "?"}
              </span>
            )}
          </div>
          <div>
            <p className="text-[12px] font-black" style={{ color }}>
              {name || CONSTANT.category}
            </p>
            <p
              className="text-[9px] font-bold tracking-widest"
              style={{ color: color + "99" }}
            >
              {type === "income"
                ? CONSTANT.income.toUpperCase()
                : CONSTANT.expense.toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          label={CONSTANT.cancel}
          className="flex-1"
          onClick={onClose}
          disabled={loading}
        />
        <Button
          label={loading ? CONSTANT.loading : isEdit ? CONSTANT.save : CONSTANT.add}
          className="flex-1"
          onClick={handleSubmit}
          disabled={loading}
        />
      </div>
    </div>
  );
};
export default ModalKategori;
