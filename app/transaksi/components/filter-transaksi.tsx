"use client";

import { useEffect, useRef } from "react";
import { get } from "@/lib/helper/apiService";
import {
  useTransaksiStore,
  type Category,
  type Tag,
  type PaymentMethod,
} from "../store/transaksi-store";
import { useMonthFilter } from "@/components/ui/input-component/month-filter/store/month-filter-store";
import MonthFilter from "@/components/ui/input-component/month-filter/month-filter";
import { Button } from "@/components/ui/button-component/button";
import { Plus, RotateCcw } from "lucide-react";
import TabFilter from "@/components/ui/input-component/tab-filter.tsx/tab-filter";
import { useTranslate } from "@/lib/i18n/use-translate";

interface FilterTransaksiProps {
  onOpenCreate: () => void;
}

const FilterTransaksi = ({ onOpenCreate }: FilterTransaksiProps) => {
  const CONSTANT = useTranslate();
  const filter = useTransaksiStore((s) => s.filter);
  const tags = useTransaksiStore((s) => s.tags);
  const setFilter = useTransaksiStore((s) => s.setFilter);
  const resetFilter = useTransaksiStore((s) => s.resetFilter);
  const setReference = useTransaksiStore((s) => s.setReference);

  const { month } = useMonthFilter();

  useEffect(() => {
    setFilter({ month, page: 1 });
  }, [month, setFilter]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Promise.all([
      get<{ categories: Category[] }>("/categories"),
      get<{ tags: Tag[] }>("/tags"),
      get<{ payment_methods: PaymentMethod[] }>("/payment-methods"),
    ]).then(([cats, tgs, methods]) =>
      setReference({
        categories: cats.categories,
        tags: tgs.tags,
        paymentMethods: methods.payment_methods,
      }),
    );
  }, [setReference]);

  const handleSearch = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => setFilter({ search: value, page: 1 }),
      350,
    );
  };

  const hasActiveFilter =
    filter.type !== "all" ||
    !!filter.category_id ||
    !!filter.tag_id ||
    !!filter.search;

  const TIPE_OPTIONS = [
    { label: CONSTANT.expense.toUpperCase(), value: "expense" },
    { label: CONSTANT.income.toUpperCase(), value: "income" },
  ];

  return (
    <div className="flex flex-col gap-2.5">
      {/* Row 1 */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <input
          type="text"
          placeholder={`${CONSTANT.search} ${CONSTANT.transaction.toLowerCase()}...`}
          defaultValue={filter.search}
          onChange={(e) => handleSearch(e.target.value)}
          className={[
            "h-9 w-full min-w-0 border-2 border-border bg-card px-3",
            "text-[11px] font-mono font-bold tracking-wide text-foreground",
            "placeholder:text-foreground/30",
            "shadow-brutal-lg",
            "focus:outline-none focus:shadow-brutal-sm",
            "focus:translate-x-0.5 focus:translate-y-0.5 transition-all duration-100",
            "md:flex-1",
          ].join(" ")}
        />
        <div className="flex items-center gap-2">
          <MonthFilter size="sm" />
          <Button
            size="sm"
            leftIcon={<Plus size={12} />}
            onClick={onOpenCreate}
            label={CONSTANT.add}
          />
        </div>
      </div>

      {/* Row 2 */}
      <div className="flex flex-wrap items-center gap-1.5">
        <TabFilter
          value={filter.type === "all" ? "" : filter.type}
          onChange={(val) =>
            setFilter({ type: (val || "all") as typeof filter.type, page: 1 })
          }
          options={TIPE_OPTIONS}
          allLabel={CONSTANT.all.toUpperCase()}
        />

        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() =>
              setFilter({
                tag_id: filter.tag_id === tag.id ? "" : tag.id,
                page: 1,
              })
            }
            className={[
              "h-9 inline-flex items-center gap-1 border-2 border-border px-3",
              "text-[10px] font-black tracking-wide font-mono uppercase",
              "transition-all duration-100",
              filter.tag_id === tag.id
                ? "bg-foreground text-background shadow-none translate-x-[3px] translate-y-[3px]"
                : [
                    "bg-card text-foreground",
                    "shadow-brutal-lg",
                    "hover:shadow-brutal-sm",
                    "hover:translate-x-[2px] hover:translate-y-[2px]",
                    "active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
                  ].join(" "),
            ].join(" ")}
          >
            <span className="opacity-40">#</span>
            {tag.name}
          </button>
        ))}

        {hasActiveFilter && (
          <Button
            size="sm"
            label={CONSTANT.reset ?? "RESET"}
            variant="outline"
            onClick={resetFilter}
            leftIcon={<RotateCcw size={10} />}
          />
        )}
      </div>
    </div>
  );
};

export default FilterTransaksi;
