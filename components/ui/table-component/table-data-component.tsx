"use client";

import React from "react";

export type SortDirection = "asc" | "desc" | null;

export interface TableHeader<T = Record<string, unknown>> {
  title: string;
  value: string;
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
}

export interface TableDataComponentProps<T = Record<string, unknown>> {
  tableData: T[];
  tableHeaders: TableHeader<T>[];
  renderCell?: (item: T, header: TableHeader<T>) => React.ReactNode;
  dataKey?: keyof T & string;
  loading?: boolean;
  loadingRows?: number;
  emptyMessage?: string;
  sortField?: string;
  sortOrder?: SortDirection;
  onSort?: (e: { field: string; order: SortDirection }) => void;
  onRowClick?: (e: { data: T; index: number }) => void;
  className?: string;
}

function SortIcon({ dir }: { dir: SortDirection }) {
  return (
    <span className="inline-flex flex-col gap-[2px] align-middle ml-1.5">
      <svg
        className={`block ${dir === "asc" ? "opacity-100" : "opacity-30"}`}
        width="7"
        height="4"
        viewBox="0 0 7 4"
      >
        <path d="M3.5 0L7 4H0z" fill="currentColor" />
      </svg>
      <svg
        className={`block ${dir === "desc" ? "opacity-100" : "opacity-30"}`}
        width="7"
        height="4"
        viewBox="0 0 7 4"
      >
        <path d="M3.5 4L0 0h7z" fill="currentColor" />
      </svg>
    </span>
  );
}

function SkeletonRow({ count }: { count: number }) {
  return (
    <tr className="border-b border-border last:border-b-0">
      {Array.from({ length: count }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <span className="block h-2.5 w-3/4 bg-foreground/10 animate-pulse rounded" />
        </td>
      ))}
    </tr>
  );
}

export function TableDataComponent<T = Record<string, unknown>>({
  tableData = [] as T[],
  tableHeaders = [],
  renderCell,
  dataKey,
  loading = false,
  loadingRows = 5,
  emptyMessage = "Tidak ada data",
  sortField,
  sortOrder,
  onSort,
  onRowClick,
  className = "",
}: TableDataComponentProps<T>) {
  const get = (row: T, field: string): unknown =>
    (row as Record<string, unknown>)[field];

  const handleSort = (field: string) => {
    if (!onSort) return;
    if (sortField !== field) return onSort({ field, order: "asc" });
    if (sortOrder === "asc") return onSort({ field, order: "desc" });
    onSort({ field, order: null });
  };

  return (
    <div
      className={`overflow-x-auto border-[3px] border-border shadow-[4px_4px_0_hsl(var(--border))] ${className}`}
    >
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-foreground text-background">
            {tableHeaders.map((h) => (
              <th
                key={h.value}
                style={{ width: h.width, textAlign: h.align ?? "left" }}
                className={[
                  "px-4 py-3 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap select-none",
                  h.sortable
                    ? "cursor-pointer hover:opacity-75 transition-opacity"
                    : "",
                ].join(" ")}
                onClick={h.sortable ? () => handleSort(h.value) : undefined}
              >
                {h.title}
                {h.sortable && (
                  <SortIcon
                    dir={sortField === h.value ? (sortOrder ?? null) : null}
                  />
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            Array.from({ length: loadingRows }).map((_, i) => (
              <SkeletonRow key={i} count={tableHeaders.length} />
            ))
          ) : tableData.length === 0 ? (
            <tr>
              <td
                colSpan={tableHeaders.length}
                className="px-4 py-12 text-center text-sm text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            tableData.map((row, index) => (
              <tr
                key={dataKey ? String(get(row, dataKey)) : index}
                className={[
                  "border-b border-border last:border-b-0 transition-colors duration-75 text-foreground",
                  onRowClick
                    ? "cursor-pointer hover:bg-accent/20"
                    : "hover:bg-muted/50",
                ].join(" ")}
                onClick={
                  onRowClick
                    ? () => onRowClick({ data: row, index })
                    : undefined
                }
              >
                {tableHeaders.map((h) => (
                  <td
                    key={h.value}
                    style={{ width: h.width, textAlign: h.align ?? "left" }}
                    className="px-4 py-3 text-sm"
                  >
                    {renderCell
                      ? (renderCell(row, h) ?? String(get(row, h.value) ?? "—"))
                      : String(get(row, h.value) ?? "—")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TableDataComponent;
