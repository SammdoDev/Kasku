"use client";

import {
  TableDataComponent,
  type TableHeader,
} from "@/components/ui/table-component/table-data-component";
import { Button } from "@/components/ui/button-component/button";
import { useAnggaranStore, type Anggaran } from "../store/anggaran-store";
import { OpenmojiImg } from "@/app/kategori/components/emoji-picker";
import { useCurrency } from "@/lib/helper/currency-format";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import { useTranslate } from "@/lib/i18n/use-translate";

interface Props {
  onEdit: (item: Anggaran) => void;
  onDelete: (item: Anggaran) => void;
}

const TabelAnggaran = ({ onEdit, onDelete }: Props) => {
  const CONSTANT = useTranslate();
  const { format } = useCurrency();
  const list = useAnggaranStore((s) => s.list);
  const loading = useAnggaranStore((s) => s.loading);

  const PERIOD_LABEL: Record<string, string> = {
    daily: CONSTANT.daily ?? "Harian",
    weekly: CONSTANT.weekly ?? "Mingguan",
    monthly: CONSTANT.monthly ?? "Bulanan",
    yearly: CONSTANT.yearly ?? "Tahunan",
  };

  const TABLE_HEADERS: TableHeader[] = [
    { title: CONSTANT.action ?? "Aksi", value: "_action", width: "110px" },
    { title: CONSTANT.name ?? "Nama", value: "name", width: "160px" },
    { title: CONSTANT.category, value: "category", width: "140px" },
    { title: CONSTANT.period ?? "Periode", value: "period", width: "100px" },
    { title: CONSTANT.budget, value: "amount", width: "130px" },
    { title: CONSTANT.spent ?? "Terpakai", value: "spent", width: "130px" },
    { title: CONSTANT.remaining ?? "Sisa", value: "remaining", width: "130px" },
    { title: CONSTANT.progress ?? "Progress", value: "progress", width: "160px" },
  ];

  const renderCell = (item: Anggaran, header: TableHeader) => {
    if (header.value === "_action") {
      return (
        <div className="flex gap-1">
          <Button
            label={CONSTANT.edit}
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
          />
          <Button
            label={CONSTANT.delete}
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
            <span className="text-[9px] text-foreground/40 font-bold">
              s/d {item.end_date}
            </span>
          )}
        </div>
      );
    } else if (header.value === "category") {
      if (!item.category)
        return (
          <span className="text-[10px] text-foreground/30 font-bold">
            {CONSTANT.all}
          </span>
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
          {format(item.amount)}
        </span>
      );
    } else if (header.value === "spent") {
      return (
        <span
          className="text-[12px] font-black font-mono"
          style={{ color: "var(--color-danger)" }}
        >
          {format(item.spent ?? 0)}
        </span>
      );
    } else if (header.value === "remaining") {
      const rem = item.remaining ?? item.amount;
      const over = rem < 0;
      return (
        <span
          className="text-[12px] font-black font-mono"
          style={{
            color: over ? "var(--color-danger)" : "var(--color-success)",
          }}
        >
          {over ? "-" : ""}
          {format(Math.abs(rem))}
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
              className="h-full transition-all"
              style={{
                width: `${Math.min(pct, 100)}%`,
                background: over
                  ? "var(--color-danger)"
                  : pct >= 80
                    ? "var(--color-warning)"
                    : "hsl(var(--foreground))",
              }}
            />
          </div>
          <span
            className="text-[9px] font-black"
            style={{
              color: over
                ? "var(--color-danger)"
                : "var(--color-muted-foreground, #666)",
            }}
          >
            {pct}%{over ? ` — ${CONSTANT.overBudget ?? "MELEBIHI!"}` : ""}
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
      emptyMessage={CONSTANT.budgetEmpty ?? "Belum ada anggaran"}
    />
  );
};

export default TabelAnggaran;
