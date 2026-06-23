"use client";

import Image from "next/image";
import { getEmojiOptions } from "./emoji-option";
import { useTranslate } from "@/lib/i18n/use-translate";

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
    <Image
      src={openmojiUrl(hexcode)}
      alt={alt ?? hexcode}
      width={size}
      height={size}
      className={className}
      draggable={false}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

interface EmojiPickerProps {
  value: string | null;
  onChange: (hexcode: string) => void;
}

const EmojiPicker = ({ value, onChange }: EmojiPickerProps) => {
  const C = useTranslate();
  const emojiOptions = getEmojiOptions(C);
  const GROUPS = Array.from(new Set(emojiOptions.map((e) => e.group)));

  return (
    <div className="border-2 border-border bg-card max-h-64 overflow-y-auto">
      {GROUPS.map((group) => {
        const emojis = emojiOptions.filter((e) => e.group === group);
        return (
          <div key={group}>
            <div className="px-3 py-1.5 bg-card border-b border-border/10 sticky top-0 z-10">
              <span className="text-[9px] font-black tracking-widest uppercase text-foreground/40">
                {group}
              </span>
            </div>
            <div className="grid grid-cols-4">
              {emojis.map((emoji) => {
                const isSelected = value === emoji.hexcode;
                return (
                  <button
                    key={emoji.hexcode}
                    type="button"
                    title={emoji.label}
                    onClick={() => onChange(emoji.hexcode)}
                    className={[
                      "flex flex-col items-center justify-center gap-1 p-2 border-b border-r border-border/10 transition-colors duration-75",
                      isSelected
                        ? "bg-foreground"
                        : "hover:bg-foreground/5 active:bg-foreground/10",
                    ].join(" ")}
                  >
                    <OpenmojiImg
                      hexcode={emoji.hexcode}
                      size={22}
                      alt={emoji.label}
                      className={
                        isSelected ? "brightness-[10] dark:brightness-0" : ""
                      }
                    />
                    <span
                      className={[
                        "text-[8px] font-bold leading-tight text-center line-clamp-2 w-full",
                        isSelected ? "text-background" : "text-foreground/40",
                      ].join(" ")}
                    >
                      {emoji.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EmojiPicker;
