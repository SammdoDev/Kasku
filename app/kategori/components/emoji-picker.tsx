"use client";

import { useState, useMemo } from "react";
import InputText from "@/components/ui/input-component/input-text/input-text";
import { EMOJI_OPTIONS } from "./emoji-option";

export function openmojiUrl(hexcode: string): string {
  return `https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/${hexcode.toUpperCase()}.svg`;
}

export function OpenmojiImg({
  hexcode,
  size = 20,
  className,
  alt,
}: {
  hexcode: string;
  size?: number;
  className?: string;
  alt?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={openmojiUrl(hexcode)}
      alt={alt ?? hexcode}
      width={size}
      height={size}
      className={className}
      draggable={false}
    />
  );
}

const GROUPS = Array.from(new Set(EMOJI_OPTIONS.map((e) => e.group)));

interface EmojiPickerProps {
  value: string | null;
  onChange: (hexcode: string) => void;
}

export default function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState<string>("all");

  const filtered = useMemo(() => {
    return EMOJI_OPTIONS.filter((e) => {
      const matchSearch =
        !search || e.label.toLowerCase().includes(search.toLowerCase());
      const matchGroup = activeGroup === "all" || e.group === activeGroup;
      return matchSearch && matchGroup;
    });
  }, [search, activeGroup]);

  const selectedEmoji = value
    ? EMOJI_OPTIONS.find((e) => e.hexcode === value)
    : null;

  return (
    <div className="border-2 border-black bg-white">
      <InputText
        id="emoji-search"
        label="Cari Emoji"
        placeholder="Cari emoji..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex gap-0 overflow-x-auto border-b-2 border-black">
        <button
          type="button"
          onClick={() => setActiveGroup("all")}
          className={[
            "shrink-0 px-3 py-1.5 text-[9px] font-black tracking-widest font-mono uppercase border-r-2 border-black",
            activeGroup === "all"
              ? "bg-black text-white"
              : "bg-white text-black/50 hover:bg-black/5",
          ].join(" ")}
        >
          SEMUA
        </button>
        {GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setActiveGroup(g)}
            className={[
              "shrink-0 px-3 py-1.5 text-[9px] font-black tracking-widest font-mono uppercase border-r-2 border-black",
              activeGroup === g
                ? "bg-black text-white"
                : "bg-white text-black/50 hover:bg-black/5",
            ].join(" ")}
          >
            {g.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-8 gap-0 max-h-50 overflow-y-auto">
        {filtered.map((emoji) => {
          const isSelected = value === emoji.hexcode;
          return (
            <button
              key={emoji.hexcode}
              type="button"
              title={emoji.label}
              onClick={() => onChange(emoji.hexcode)}
              className={[
                "flex flex-col items-center justify-center gap-1 p-2 border-b border-r border-black/10 transition-all duration-100",
                isSelected ? "bg-black" : "hover:bg-black/5",
              ].join(" ")}
            >
              <OpenmojiImg
                hexcode={emoji.hexcode}
                size={22}
                alt={emoji.label}
                className={isSelected ? "opacity-90 brightness-[10]" : ""}
              />
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-8 py-6 text-center text-[10px] font-mono text-black/30">
            Tidak ditemukan
          </div>
        )}
      </div>

      {value && selectedEmoji && (
        <div className="border-t-2 border-black px-3 py-2 flex items-center gap-2 bg-black/5">
          <OpenmojiImg hexcode={value} size={16} alt={selectedEmoji.label} />
          <span className="text-[10px] font-black font-mono">
            {selectedEmoji.label}
          </span>
          <span className="text-[9px] font-mono text-black/30 ml-auto">
            {value.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}
