"use client";

import {
  TableDataComponent,
  type TableHeader,
} from "@/components/ui/table-component/table-data-component";
import { Button } from "@/components/ui/button-component/button";
import { useTagStore, type Tag } from "../store/tag-store";

const TABLE_HEADERS: TableHeader[] = [
  { title: "Aksi", value: "_action", width: "110px" },
  { title: "Tag", value: "preview", width: "160px" },
  { title: "Nama", value: "name", width: "180px" },
  { title: "Warna", value: "color", width: "90px" },
];

interface Props {
  onEdit: (item: Tag) => void;
  onDelete: (item: Tag) => void;
}

const TabelTag = ({ onEdit, onDelete }: Props) => {
  const list = useTagStore((s) => s.list);
  const loading = useTagStore((s) => s.loading);

  const renderCell = (item: Tag, header: TableHeader) => {
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
    } else if (header.value === "preview") {
      return (
        <span
          className="px-2.5 py-1 border-2 text-[11px] font-black tracking-wider"
          style={{
            borderColor: item.color ?? "#6366f1",
            color: item.color ?? "#6366f1",
            background: (item.color ?? "#6366f1") + "18",
          }}
        >
          #{item.name}
        </span>
      );
    } else if (header.value === "name") {
      return <span className="text-[12px] font-bold">{item.name}</span>;
    } else if (header.value === "color") {
      return (
        <div className="flex items-center gap-1.5">
          <div
            className="w-4 h-4 border-2 border-black/20"
            style={{ background: item.color ?? "#6366f1" }}
          />
          <span className="text-[10px] font-mono text-black/50">
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
