"use client";

import {
  TableDataComponent,
  type TableHeader,
} from "@/components/ui/table-component/table-data-component";
import { Button } from "@/components/ui/button-component/button";
import { useAnggaranStore, type Anggaran } from "../store/anggaran-store";
import { OpenmojiImg } from "@/app/kategori/components/emoji-picker";
import formatIDR from "@/lib/helper/currency-format";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";

const PERIOD_LABEL: Record<string, string> = {
  daily: "Harian",
  weekly: "Mingguan",
  monthly: "Bulanan",
  yearly: "Tahunan",
};

interface Props {
  onEdit: (item: Anggaran) => void;
  onDelete: (item: Anggaran) => void;
}

const TabelAnggaran = ({ onEdit, onDelete }: Props) => {
  const list = useAnggaranStore((s) => s.list);
  const loading = useAnggaranStore((s) => s.loading);

  const TABLE_HEADERS: TableHeader[] = [
    { title: "Aksi", value: "_action", width: "110px" },
    { title: "Nama", value: "name", width: "160px" },
    { title: "Kategori", value: "category", width: "140px" },
    { title: "Periode", value: "period", width: "100px" },
    { title: "Anggaran", value: "amount", width: "130px" },
    { title: "Terpakai", value: "spent", width: "130px" },
    { title: "Sisa", value: "remaining", width: "130px" },
    { title: "Progress", value: "progress", width: "160px" },
  ];

  const renderCell = (item: Anggaran, header: TableHeader) => {
    if (header.value === "_action") {
      return (
        <div className="flex gap-1">
          <Button
            label="EDIT"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
          />
          <Button
            label="HAPUS"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
          />
        </div>
      );
    } else if (header.value === "name") {
      return (
        <div
          className="flex flex-col gap-0.5"
          style={{ fontFamily: DASHBOARD_FONT }}
        >
          <span className="text-[12px] font-black">{item.name}</span>
          {item.end_date && (
            <span className="text-[9px] text-black/40 font-bold">
              s/d {item.end_date}
            </span>
          )}
        </div>
      );
    } else if (header.value === "category") {
      if (!item.category)
        return (
          <span className="text-[10px] text-black/30 font-bold">Semua</span>
        );
      return (
        <div className="flex items-center gap-1.5">
          {item.category.icon && (
            <OpenmojiImg
              hexcode={item.category.icon}
              size={16}
              alt={item.category.name}
            />
          )}
          <span className="text-[11px] font-bold">{item.category.name}</span>
        </div>
      );
    } else if (header.value === "period") {
      return (
        <span className="text-[10px] font-black tracking-wider border-2 border-border px-2 py-0.5">
          {PERIOD_LABEL[item.period] ?? item.period}
        </span>
      );
    } else if (header.value === "amount") {
      return (
        <span className="text-[12px] font-black font-mono">
          {formatIDR(item.amount)}
        </span>
      );
    } else if (header.value === "spent") {
      return (
        <span className="text-[12px] font-black font-mono text-[#991b1b]">
          {formatIDR(item.spent ?? 0)}
        </span>
      );
    } else if (header.value === "remaining") {
      const rem = item.remaining ?? item.amount;
      const over = rem < 0;
      return (
        <span
          className={`text-[12px] font-black font-mono ${over ? "text-red-600" : "text-[#166534]"}`}
        >
          {over ? "-" : ""}
          {formatIDR(Math.abs(rem))}
        </span>
      );
    } else if (header.value === "progress") {
      const pct = item.percent_used ?? 0;
      const over = pct >= 100;
      return (
        <div
          className="flex flex-col gap-1 w-full"
          style={{ fontFamily: DASHBOARD_FONT }}
        >
          <div className="w-full h-3 border-2 border-border bg-card">
            <div
              className={`h-full transition-all ${over ? "bg-red-500" : pct >= 80 ? "bg-yellow-400" : "bg-[#1a1a1a]"}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <span
            className={`text-[9px] font-black ${over ? "text-red-600" : "text-black/50"}`}
          >
            {pct}%{over ? " — MELEBIHI!" : ""}
          </span>
        </div>
      );
    }
  };

  return (
    <TableDataComponent
      tableData={list}
      tableHeaders={TABLE_HEADERS}
      renderCell={renderCell}
      dataKey="id"
      loading={loading}
      loadingRows={5}
      emptyMessage="Belum ada anggaran"
    />
  );
};

export default TabelAnggaran;
