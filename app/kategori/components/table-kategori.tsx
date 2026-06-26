"use client";

import React from "react";
import { TableDataComponent } from "@/components/ui/table-component/table-data-component";
import type { TableHeader } from "@/components/ui/table-component/table-data-component";
import { useKategoriStore, type Category } from "../store/kategori-store";
import { OpenmojiImg } from "./emoji-picker";
import { confirm } from "@/components/layout/for-pages/confirm-dialog";
import { Button } from "@/components/ui/button-component/button";
import { dateDisplay } from "@/lib/helper/date-format";
import { EMOJI_OPTIONS } from "./emoji-option";
import { useTranslate } from "@/lib/i18n/use-translate";

interface TabelKategoriProps {
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
}

const TabelKategori: React.FC<TabelKategoriProps> = ({ onEdit, onDelete }) => {
  const CONSTANT = useTranslate();
  const list = useKategoriStore((s) => s.list);
  const loading = useKategoriStore((s) => s.loading);

  const tableHeaders: TableHeader[] = [
    { title: CONSTANT.action, value: "action", width: "100px" },
    { title: CONSTANT.icon, value: "icon", width: "60px" },
    { title: CONSTANT.name, value: "name", width: "200px" },
    { title: CONSTANT.type, value: "type", width: "110px" },
    { title: CONSTANT.color, value: "color", width: "90px" },
    { title: CONSTANT.createdAt, value: "createdAt", width: "120px" },
  ];

  const handleDeleteClick = async (e: React.MouseEvent, cat: Category) => {
    e.stopPropagation();
    const ok = await confirm.show({
      title: `${CONSTANT.delete} ${CONSTANT.category}`,
      description: CONSTANT.actionCannotBeUndone,
      message: `${CONSTANT.deleteConfirmCategory} "${cat.name}"? ${CONSTANT.deleteAffectTransactions}`,
      confirmLabel: CONSTANT.yesDelete.toUpperCase(),
      cancelLabel: CONSTANT.cancel.toUpperCase(),
      variant: "danger",
    });
    if (!ok) return;
    onDelete(cat);
  };

  const renderCell = (cat: Category, header: TableHeader) => {
    if (header.value === "icon") {
      const emojiMeta = cat.icon
        ? EMOJI_OPTIONS.find((e) => e.hexcode === cat.icon)
        : null;
      return (
        <div
          className="w-8 h-8 shadow-brutal-sm flex items-center justify-center"
          style={{ background: (cat.color ?? "#6366f1") + "22" }}
        >
          {cat.icon ? (
            <OpenmojiImg
              hexcode={cat.icon}
              size={18}
              alt={emojiMeta?.label ?? cat.icon}
            />
          ) : (
            <span
              className="text-[11px] font-black"
              style={{ color: cat.color ?? "#6366f1" }}
            >
              {cat.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      );
    } else if (header.value === "name") {
      return (
        <span
          className="text-[12px] font-bold"
          style={{ color: cat.color ?? undefined }}
        >
          {cat.name}
        </span>
      );
    } else if (header.value === "type") {
      return (
        <span
          className={[
            "inline-flex items-center border-2 px-2 py-0.5 text-[9px] font-black tracking-widest",
            cat.type === "income"
              ? "border-[var(--color-success)] text-[var(--color-success)] bg-[var(--color-success)]/10"
              : "border-destructive text-destructive bg-destructive/10",
          ].join(" ")}
        >
          {cat.type === "income"
            ? CONSTANT.income.toUpperCase()
            : CONSTANT.expense.toUpperCase()}
        </span>
      );
    } else if (header.value === "color") {
      return (
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 border-2 border-border shadow-brutal-xs"
            style={{ background: cat.color ?? "#6366f1" }}
          />
          <span className="text-[9px] font-mono font-bold text-foreground/40">
            {cat.color ?? "—"}
          </span>
        </div>
      );
    } else if (header.value === "createdAt") {
      return (
        <span className="text-[10px] text-foreground/40 font-mono">
          {dateDisplay(cat.created_at)}
        </span>
      );
    } else if (header.value === "action") {
      return (
        <div className="flex gap-1">
          <Button
            label={CONSTANT.edit.toUpperCase()}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(cat);
            }}
            variant="outline"
          />
          <Button
            label={CONSTANT.delete.toUpperCase()}
            variant="destructive"
            onClick={(e) => handleDeleteClick(e, cat)}
          />
        </div>
      );
    }
  };

  return (
    <TableDataComponent
      tableData={list}
      tableHeaders={tableHeaders}
      renderCell={renderCell}
      dataKey="id"
      loading={loading}
      loadingRows={6}
      emptyMessage={CONSTANT.noCategoryYet}
    />
  );
};

export default TabelKategori;
