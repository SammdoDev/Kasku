"use client";

import { Plus } from "lucide-react";
import CategoryButton from "./category-button";
import { useTranslate } from "@/lib/i18n/use-translate";

export interface CategoryItem {
  id: string;
  name: string;
  icon: string | null;
  color?: string | null;
  type?: "income" | "expense" | null;
}

interface CategoryGridProps {
  categories: CategoryItem[];
  selected: string | null;
  onSelect: (id: string) => void;
  onAddCategory?: () => void;
  loading?: boolean;
  onEditCategory?: (id: string) => void;
}

const SkeletonCell = () => (
  <div className="flex flex-col items-center gap-2 p-3 animate-pulse">
    <div className="w-11 h-11 bg-foreground/10 border-2 border-border/20" />
    <div className="h-2 w-10 bg-foreground/10" />
  </div>
);

const CategoryGrid = ({
  categories,
  selected,
  onSelect,
  onAddCategory,
  onEditCategory,
  loading = false,
}: CategoryGridProps) => {
  const CONSTANT = useTranslate();

  if (loading) {
    return (
      <div className="grid grid-cols-4 border-b-2 border-border">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCell key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="border-b-2 border-border">
      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-10">
          <span className="text-[10px] font-black tracking-widest text-foreground/25 uppercase">
            {CONSTANT.noData}
          </span>
          {onAddCategory && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddCategory?.();
              }}
              className="flex items-center gap-1.5 border-2 border-border bg-card text-foreground px-3 py-2 text-[10px] font-black tracking-widest uppercase hover:bg-foreground hover:text-background transition-colors duration-75 shadow-brutal-sm active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
            >
              <Plus size={11} strokeWidth={3} />
              {CONSTANT.add} {CONSTANT.category}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-4 overflow-y-auto max-h-[220px]">
          {categories.map((cat) => (
            <CategoryButton
              key={cat.id}
              id={cat.id}
              name={cat.name}
              icon={cat.icon}
              selected={selected === cat.id}
              onClick={onSelect}
              onEdit={onEditCategory}
            />
          ))}
          {onAddCategory && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddCategory?.();
              }}
              className="flex flex-col items-center justify-center gap-2 p-3 border-r-[1.5px] border-b-[1.5px] border-dashed border-border/30 hover:bg-[var(--sidebar-bg)] active:bg-foreground group transition-colors duration-75"
            >
              <div className="w-11 h-11 flex items-center justify-center border-[1.5px] border-dashed border-border/30 group-hover:border-border group-active:border-background transition-colors">
                <Plus
                  size={16}
                  strokeWidth={2}
                  className="text-foreground/30 group-hover:text-foreground group-active:text-background"
                />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wide text-foreground/30 group-hover:text-foreground group-active:text-background">
                {CONSTANT.add}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryGrid;
