"use client";

import React from "react";
import { TableDataComponent } from "@/components/ui/table-component/table-data-component";
import type { TableHeader } from "@/components/ui/table-component/table-data-component";
import formatIDR from "@/lib/helper/currency-format";
import { useTransaksiStore, type Transaction } from "../store/transaksi-store";
import { Button } from "@/components/ui/button-component/button";
import { dateDisplay } from "@/lib/helper/date-format";
import { EMOJI_OPTIONS } from "@/app/kategori/components/emoji-option";
import { OpenmojiImg } from "@/app/kategori/components/emoji-picker";

const tableHeaders: TableHeader[] = [
  { title: "Aksi", value: "action", width: "100px" },
  { title: "Tanggal", value: "date", width: "90px" },
  { title: "Deskripsi", value: "description", width: "220px" },
  { title: "Icon", value: "category_icon", width: "50px" },
  { title: "Kategori", value: "category_name", width: "130px" },
  { title: "Tags", value: "tags", width: "150px" },
  { title: "Metode", value: "payment_method", width: "100px" },
  { title: "Tipe", value: "type", width: "90px" },
  {
    title: "Jumlah",
    value: "amount",
    width: "130px",
    align: "right",
    sortable: true,
  },
];

interface TabelTransaksiProps {
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
}

const TabelTransaksi: React.FC<TabelTransaksiProps> = ({
  onEdit,
  onDelete,
}) => {
  const list = useTransaksiStore((s) => s.list);
  const loading = useTransaksiStore((s) => s.loading);

  const renderCell = (trx: Transaction, header: TableHeader) => {
    if (header.value === "action") {
      return (
        <div className="flex gap-1">
          <Button
            label="EDIT"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(trx);
            }}
          />
          <Button
            label="HAPUS"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(trx);
            }}
          />
        </div>
      );
    } else if (header.value === "date") {
      return (
        <span className="text-[10px] text-muted-foreground">
          {dateDisplay(trx.date)}
        </span>
      );
    } else if (header.value === "description") {
      return (
        <div>
          <p className="text-[11px] font-bold text-foreground">
            {trx.description}
          </p>
          {trx.note && (
            <p className="text-[10px] text-muted-foreground">{trx.note}</p>
          )}
        </div>
      );
    } else if (header.value === "category_icon") {
      const cat = trx.category;

      const icon = cat?.icon ?? null;
      const emojiMeta = icon
        ? EMOJI_OPTIONS.find((e) => e.hexcode === icon)
        : null;

      return (
        <div
          className="w-8 h-8 shadow-brutal-sm flex items-center justify-center"
          style={{
            background: (cat?.color ?? "#6366f1") + "22",
          }}
        >
          {icon ? (
            <OpenmojiImg
              hexcode={icon}
              size={18}
              alt={emojiMeta?.label ?? icon}
            />
          ) : (
            <span
              className="text-[11px] font-black"
              style={{
                color: cat?.color ?? "#6366f1",
              }}
            >
              {cat?.name?.charAt(0).toUpperCase() ?? "?"}
            </span>
          )}
        </div>
      );
    } else if (header.value === "category_name") {
      return trx.category ? (
        <span
          className="text-[11px] font-bold"
          style={{ color: trx.category.color ?? undefined }}
        >
          {trx.category.name}
        </span>
      ) : (
        <span className="text-[10px] text-muted-foreground">—</span>
      );
    } else if (header.value === "tags") {
      return (
        <div className="flex gap-1 flex-wrap">
          {trx.tags.slice(0, 2).map((tag) => (
            <span
              key={tag.id}
              className="px-1.5 py-px border border-border text-foreground/60 text-[9px]"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      );
    } else if (header.value === "payment_method") {
      return (
        <span className="text-[10px] text-muted-foreground">
          {trx.payment_method?.name ?? "—"}
        </span>
      );
    } else if (header.value === "type") {
      return (
        <span
          className={[
            "inline-flex items-center border-2 px-2 py-0.5 text-[9px] font-black tracking-widest",
            trx.type === "income"
              ? "border-[var(--color-success)] text-[var(--color-success)] bg-[var(--color-success)]/10"
              : "border-destructive text-destructive bg-destructive/10",
          ].join(" ")}
        >
          {trx.type === "income" ? "PEMASUKAN" : "PENGELUARAN"}
        </span>
      );
    } else if (header.value === "amount") {
      return (
        <span
          className="text-[13px] font-bold"
          style={{
            color:
              trx.type === "income"
                ? "var(--color-success)"
                : "var(--color-danger)",
          }}
        >
          {trx.type === "income" ? "+" : "−"} {formatIDR(trx.amount)}
        </span>
      );
    }
  };

  return (
    <TableDataComponent
      tableData={list ?? []}
      tableHeaders={tableHeaders}
      renderCell={renderCell}
      dataKey="id"
      loading={loading}
      loadingRows={8}
      emptyMessage="Tidak ada transaksi ditemukan"
    />
  );
};

export default TabelTransaksi;
