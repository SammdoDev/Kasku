"use client";

import { OpenmojiImg } from "@/app/kategori/components/emoji-picker";
import { cn } from "@/lib/utils";

interface CategoryButtonProps {
  id: string;
  name: string;
  icon: string | null;
  selected?: boolean;
  onClick: (id: string) => void;
}

const CategoryButton = ({
  id,
  name,
  icon,
  selected = false,
  onClick,
}: CategoryButtonProps) => {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-3",
        "border-r-[1.5px] border-b-[1.5px] border-black",
        "transition-all duration-75 w-full",
        selected
          ? "bg-[#1a1a1a]"
          : "bg-white hover:bg-[#f5f0e8] active:bg-[#1a1a1a]",
      )}
    >
      <div
        className={cn(
          "w-11 h-11 flex items-center justify-center border-2 flex-shrink-0",
          selected
            ? "border-white/30 bg-white/10"
            : "border-black/10 bg-[#f5f0e8]",
        )}
      >
        {icon ? (
          <OpenmojiImg hexcode={icon} size={24} alt={name} />
        ) : (
          <span className="text-[13px] font-black text-black/20">?</span>
        )}
      </div>
      <span
        className={cn(
          "text-[9px] font-black tracking-wide uppercase leading-tight text-center w-full truncate px-1",
          selected ? "text-white" : "text-[#1a1a1a]/70",
        )}
      >
        {name}
      </span>
    </button>
  );
};

export default CategoryButton;
