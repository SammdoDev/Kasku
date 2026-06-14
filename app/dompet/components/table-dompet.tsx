"use client";

import {
  TableDataComponent,
  type TableHeader,
} from "@/components/ui/table-component/table-data-component";
import { Button } from "@/components/ui/button-component/button";
import { useDompetStore, type PaymentMethod } from "../store/dompet-store";

const TABLE_HEADERS: TableHeader[] = [
  { title: "Aksi", value: "_action", width: "110px" },
  { title: "Nama", value: "name", width: "180px" },
  { title: "Tipe", value: "type", width: "110px" },
  { title: "Icon", value: "icon", width: "100px" },
];

const TYPE_LABEL: Record<string, string> = {
  bank: "Bank",
  ewallet: "E-Wallet",
  cash: "Cash",
  credit: "Kartu Kredit",
  other: "Lainnya",
};

interface Props {
  onEdit: (item: PaymentMethod) => void;
  onDelete: (item: PaymentMethod) => void;
}

const TabelDompet = ({ onEdit, onDelete }: Props) => {
  const list = useDompetStore((s) => s.list);
  const loading = useDompetStore((s) => s.loading);

  const renderCell = (item: PaymentMethod, header: TableHeader) => {
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
      return <span className="text-[12px] font-bold">{item.name}</span>;
    } else if (header.value === "type") {
      return (
        <span className="inline-flex border-2 border-black px-2 py-0.5 text-[9px] font-black tracking-widest bg-white">
          {item.type ? (TYPE_LABEL[item.type] ?? item.type.toUpperCase()) : "—"}
        </span>
      );
    } else if (header.value === "icon") {
      return (
        <span className="text-[11px] text-black/50 font-mono">
          {item.icon ?? "—"}
        </span>
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
      emptyMessage="Belum ada dompet"
    />
  );
};

export default TabelDompet;
