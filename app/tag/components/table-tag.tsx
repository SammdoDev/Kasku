"use client";

import { Hash } from "lucide-react";
import {
  TableDataComponent,
  type TableHeader,
} from "@/components/ui/table-component/table-data-component";
import { Button } from "@/components/ui/button-component/button";
import { useTagStore, type Tag } from "../store/tag-store";

const TABLE_HEADERS: TableHeader[] = [
  { title: "Aksi", value: "_action", width: "130px" },
  { title: "Tag", value: "preview", width: "180px" },
  { title: "Nama", value: "name", width: "180px" },
  { title: "Warna", value: "color", width: "100px" },
];

interface Props {
  onEdit: (item: Tag) => void;
  onDelete: (item: Tag) => void;
}

const TabelTag = ({ onEdit, onDelete }: Props) => {
  const list = useTagStore((s) => s.list);
  const loading = useTagStore((s) => s.loading);

  const renderCell = (item: Tag, header: TableHeader) => {
    const color = item.color ?? "#6366f1";

    if (header.value === "_action") {
      return (
        <div className="flex flex-col sm:flex-row gap-1.5 w-full">
          <Button
            label="EDIT"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
          />
          <Button
            label="HAPUS"
            variant="destructive"
            className="w-full sm:w-auto"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
          />
        </div>
      );
    } else if (header.value === "preview") {
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border-2 text-[10px] font-black tracking-wider shadow-[2px_2px_0px_0px_hsl(var(--border))] transition-all duration-75 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none cursor-default"
          style={{
            borderColor: color,
            color,
            background: color + "18",
          }}
        >
          <Hash size={11} strokeWidth={3} style={{ color }} />
          {item.name}
        </span>
      );
    } else if (header.value === "name") {
      return <span className="text-[12px] font-bold">{item.name}</span>;
    } else if (header.value === "color") {
      return (
        <div className="flex items-center gap-1.5">
          <div
            className="w-5 h-5 border-2 border-border shadow-[1.5px_1.5px_0px_0px_hsl(var(--border))]"
            style={{ background: color }}
          />
          <span className="text-[10px] font-mono font-bold text-foreground/50 uppercase">
            {item.color ?? "—"}
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
      emptyMessage="Belum ada tag"
    />
  );
};

export default TabelTag;
