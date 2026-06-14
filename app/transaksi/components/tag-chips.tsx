"use client";

import { useEffect, useState } from "react";
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
      <div className="flex gap-2 px-1 py-2 overflow-x-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-6 w-16 bg-gray-100 border-2 border-[#e5e5e5] animate-pulse flex-shrink-0"
          />
        ))}
      </div>
    );
  }

  if (tags.length === 0) return null;

  return (
    <div className="border-t-2 border-black">
      <div className="flex gap-2 px-3 py-2 overflow-x-auto scrollbar-none">
        {tags.map((tag) => {
          const isSelected = selected.includes(tag.id);
          const color = tag.color ?? "#6366f1";
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggle(tag.id)}
              className="flex-shrink-0 px-2.5 py-1 border-2 text-[10px] font-black tracking-wider transition-all duration-75"
              style={
                isSelected
                  ? { borderColor: color, background: color, color: "#fff" }
                  : { borderColor: color, color, background: color + "18" }
              }
            >
              #{tag.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TagChips;
