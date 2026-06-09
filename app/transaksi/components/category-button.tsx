"use client";

import { OpenmojiImg } from "@/app/kategori/components/emoji-picker";
import { useRef } from "react";

interface CategoryButtonProps {
  id: string;
  name: string;
  icon: string | null;
  color?: string | null;
  selected: boolean;
  onClick: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const CategoryButton = ({
  id,
  name,
  icon,
  color,
  selected,
  onClick,
  onEdit,
  onDelete,
}: CategoryButtonProps) => {
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const longPressCount = useRef(0);

  const startPress = () => {
    didLongPress.current = false;
    longPressCount.current = 0;

    // long press pertama (500ms) → edit
    pressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      longPressCount.current = 1;
      onEdit?.(id);

      // long press kedua (tahan terus 1000ms total) → delete
      pressTimer.current = setTimeout(() => {
        longPressCount.current = 2;
        onDelete?.(id);
      }, 800);
    }, 500);
  };

  const cancelPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const handleClick = () => {
    if (didLongPress.current) {
      didLongPress.current = false;
      return;
    }
    onClick(id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      onTouchMove={cancelPress}
      onContextMenu={(e) => e.preventDefault()}
      className={[
        "flex flex-col items-center gap-2 p-3 border-r-[1.5px] border-b-[1.5px] border-black/10 transition-colors duration-75",
        selected
          ? "bg-[#1a1a1a] text-white"
          : "hover:bg-[#f5f0e8] active:bg-[#1a1a1a] active:text-white",
      ].join(" ")}
    >
      <div
        className={[
          "w-11 h-11 flex items-center justify-center border-2",
          selected ? "border-white/30" : "border-black/10",
        ].join(" ")}
        style={
          !selected && color ? { backgroundColor: color + "22" } : undefined
        }
      >
        {icon ? (
          <OpenmojiImg hexcode={icon} size={22} alt={name} />
        ) : (
          <span
            className="text-[13px] font-black"
            style={!selected && color ? { color } : undefined}
          >
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <span className="text-[9px] font-black uppercase tracking-wide leading-tight text-center line-clamp-2">
        {name}
      </span>
    </button>
  );
};

export default CategoryButton;
