"use client";

import { useEffect, useState } from "react";
import { Hash } from "lucide-react";
import { get, getApiError } from "@/lib/helper/apiService";
import { toast } from "@/components/layout/for-pages/toast";

interface TagItem {
  id: string;
  name: string;
  color: string | null;
}

interface TagChipsProps {
  selected: string[];
  onChange: (ids: string[]) => void;
}

const TagChips = ({ selected, onChange }: TagChipsProps) => {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await get<{ tags: TagItem[] }>("/tags");
        setTags(res.tags);
      } catch (err) {
        toast.error("Gagal memuat tag", getApiError(err));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id],
    );
  };

  if (loading) {
    return (
      <div className="border-t-2 border-border">
        <div className="flex gap-2 px-3 py-2.5 overflow-x-auto scrollbar-none">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-7 w-16 bg-foreground/10 border-2 border-border/20 animate-pulse flex-shrink-0"
            />
          ))}
        </div>
      </div>
    );
  }

  if (tags.length === 0) return null;

  return (
    <div className="border-t-2 border-border">
      <div className="flex gap-2 px-3 py-2.5 overflow-x-auto scrollbar-none">
        {tags.map((tag) => {
          const isSelected = selected.includes(tag.id);
          const color = tag.color ?? "#6366f1";
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggle(tag.id)}
              className={[
                "flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 border-2 text-[10px] font-black tracking-wider transition-all duration-75",
                isSelected
                  ? "translate-x-[1px] translate-y-[1px] shadow-none"
                  : "shadow-[2px_2px_0px_0px_hsl(var(--border))] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none",
              ].join(" ")}
              style={
                isSelected
                  ? { borderColor: color, background: color, color: "#fff" }
                  : { borderColor: color, color, background: color + "18" }
              }
            >
              <Hash
                size={11}
                strokeWidth={3}
                style={{ color: isSelected ? "#fff" : color }}
              />
              {tag.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TagChips;
