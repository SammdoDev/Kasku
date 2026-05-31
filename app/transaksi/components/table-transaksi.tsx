"use client";

import React from "react";
import { TableDataComponent } from "@/components/ui/table-component/table-data-component";
import type { TableHeader } from "@/components/ui/table-component/table-data-component";
import formatIDR from "@/lib/helper/currency-format";
import { useTransaksiStore, type Transaction } from "../store/transaksi-store";

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

  const tableHeaders: TableHeader[] = [
    {
      title: "Aksi",
      value: "_action",
      width: "100px",
    },
    {
      title: "Tanggal",
      value: "date",
      width: "90px",
    },
    {
      title: "Deskripsi",
      value: "description",
      width: "220px",
    },
    {
      title: "Kategori",
      value: "category",
      width: "130px",
    },
    {
      title: "Tags",
      value: "tags",
      width: "150px",
    },
    {
      title: "Metode",
      value: "payment_method",
      width: "100px",
    },
    {
      title: "Tipe",
      value: "type",
      width: "90px",
    },
    {
      title: "Jumlah",
      value: "amount",
      width: "130px",
      align: "right",
      sortable: true,
    },
  ];

  const renderCell = (trx: Transaction, header: TableHeader) => {
    if (header.value === "date") {
      return (
        <span className="text-[10px] text-muted-foreground">
          {new Date(trx.date)
            .toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "2-digit",
            })
            .toUpperCase()}
        </span>
      );
    } else if (header.value === "description") {
      return (
        <div>
          <p className="text-[11px] font-bold">{trx.description}</p>
          {trx.note && (
            <p className="text-[10px] text-muted-foreground">{trx.note}</p>
          )}
        </div>
      );
    } else if (header.value === "category") {
      return trx.category ? (
        <span className="inline-flex items-center gap-1.5 text-sm">
          <span
            className="size-2 rounded-full"
            style={{ background: trx.category.color ?? "#888" }}
          />
          {trx.category.name}
        </span>
      ) : (
        <span className="text-[10px] text-muted-foreground">—</span>
      );
    } else if (header.value === "tags") {
      return (
        <div className="flex gap-1">
          {trx.tags.slice(0, 2).map((tag) => (
            <span
              key={tag.id}
              className="px-1.5 py-px border border-current text-[9px]"
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
        <span className="text-[11px] font-bold">
          {trx.type === "income" ? "MASUK" : "KELUAR"}
        </span>
      );
    } else if (header.value === "amount") {
      return (
        <span
          className={`text-[13px] font-bold ${trx.type === "income" ? "text-green-800" : "text-red-800"}`}
        >
          {trx.type === "income" ? "+" : "−"} {formatIDR(trx.amount)}
        </span>
      );
    } else if (header.value === "_action") {
      return (
        <div className="flex gap-1">
          <button
            className="px-2 py-1 text-[10px] font-bold border border-current hover:bg-muted transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(trx);
            }}
          >
            Edit
          </button>
          <button
            className="px-2 py-1 text-[10px] font-bold border border-current hover:bg-muted transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(trx);
            }}
          >
            Hapus
          </button>
        </div>
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
