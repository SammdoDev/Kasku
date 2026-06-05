// src/app/(pages)/kategori/components/emoji-picker.tsx
"use client";

import { useState, useMemo } from "react";
import InputText from "@/components/ui/input-component/input-text/input-text";

// ─── OpenMoji CDN helper ────────────────────────────────────────────────────
// Emojis are served as color SVGs from the OpenMoji CDN.
// We store only the hex codepoint (e.g. "1F4B0") in the database.
export const OPENMOJI_CDN =
  "https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@15.1.0/color/svg";

export function openmojiUrl(hexcode: string) {
  return `${OPENMOJI_CDN}/${hexcode.toUpperCase()}.svg`;
}

// ─── OpenMoji image component ────────────────────────────────────────────────
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

// ─── Curated budgeting emoji set ─────────────────────────────────────────────
// hexcode: Unicode codepoint(s) joined by "-" for multi-codepoint sequences.
// OpenMoji filenames use uppercase hex, e.g. "1F4B0.svg", "1F3E6.svg".
export const EMOJI_OPTIONS: {
  hexcode: string;
  label: string;
  group: string;
}[] = [
  // ── Keuangan ──────────────────────────────────────────────────────────────
  { hexcode: "1F4B0", label: "Uang Koin", group: "Keuangan" },
  { hexcode: "1F4B5", label: "Uang Kertas", group: "Keuangan" },
  { hexcode: "1F4B3", label: "Kartu Kredit", group: "Keuangan" },
  { hexcode: "1F4B8", label: "Uang Terbang", group: "Keuangan" },
  { hexcode: "1F4B9", label: "Grafik Naik", group: "Keuangan" },
  { hexcode: "1F3E6", label: "Bank", group: "Keuangan" },
  { hexcode: "1F4B1", label: "Tukar Mata Uang", group: "Keuangan" },
  { hexcode: "1FA99", label: "Koin", group: "Keuangan" },
  { hexcode: "1F4B2", label: "Dolar", group: "Keuangan" },
  { hexcode: "1F4B4", label: "Yen", group: "Keuangan" },
  { hexcode: "1F4B6", label: "Euro", group: "Keuangan" },
  { hexcode: "1F4B7", label: "Poundsterling", group: "Keuangan" },
  { hexcode: "1F4CA", label: "Statistik", group: "Keuangan" },
  { hexcode: "1F4C9", label: "Grafik Turun", group: "Keuangan" },
  { hexcode: "1F516", label: "Bookmark", group: "Keuangan" },

  // ── Makanan & Minuman ─────────────────────────────────────────────────────
  { hexcode: "1F35C", label: "Ramen", group: "Makanan" },
  { hexcode: "1F372", label: "Soto", group: "Makanan" },
  { hexcode: "1F35B", label: "Kari", group: "Makanan" },
  { hexcode: "1F354", label: "Burger", group: "Makanan" },
  { hexcode: "1F355", label: "Pizza", group: "Makanan" },
  { hexcode: "1F35F", label: "Kentang Goreng", group: "Makanan" },
  { hexcode: "1F371", label: "Bento", group: "Makanan" },
  { hexcode: "1F96A", label: "Sandwich", group: "Makanan" },
  { hexcode: "1F366", label: "Es Krim", group: "Makanan" },
  { hexcode: "1F370", label: "Kue", group: "Makanan" },
  { hexcode: "2615", label: "Kopi", group: "Makanan" },
  { hexcode: "1F9CB", label: "Bubble Tea", group: "Makanan" },
  { hexcode: "1F37A", label: "Bir", group: "Makanan" },
  { hexcode: "1F964", label: "Minuman", group: "Makanan" },
  { hexcode: "1F9FA", label: "Belanja Makanan", group: "Makanan" },
  { hexcode: "1F34E", label: "Buah", group: "Makanan" },

  // ── Transportasi ─────────────────────────────────────────────────────────
  { hexcode: "1F697", label: "Mobil", group: "Transportasi" },
  { hexcode: "1F68C", label: "Bus", group: "Transportasi" },
  { hexcode: "1F682", label: "Kereta", group: "Transportasi" },
  { hexcode: "1F6B2", label: "Sepeda", group: "Transportasi" },
  { hexcode: "1F6F5", label: "Motor", group: "Transportasi" },
  { hexcode: "2708", label: "Pesawat", group: "Transportasi" },
  { hexcode: "1F6A2", label: "Kapal", group: "Transportasi" },
  { hexcode: "26FD", label: "BBM / SPBU", group: "Transportasi" },
  { hexcode: "1F17F", label: "Parkir", group: "Transportasi" },
  { hexcode: "1F695", label: "Taksi", group: "Transportasi" },
  { hexcode: "1F6EB", label: "Naik Pesawat", group: "Transportasi" },
  { hexcode: "1F9F3", label: "Koper", group: "Transportasi" },

  // ── Belanja ───────────────────────────────────────────────────────────────
  { hexcode: "1F6CD", label: "Tas Belanja", group: "Belanja" },
  { hexcode: "1F6D2", label: "Troli Belanja", group: "Belanja" },
  { hexcode: "1F381", label: "Hadiah", group: "Belanja" },
  { hexcode: "1F4E6", label: "Paket", group: "Belanja" },
  { hexcode: "1F455", label: "Kemeja", group: "Belanja" },
  { hexcode: "1F457", label: "Gaun", group: "Belanja" },
  { hexcode: "1F45F", label: "Sepatu", group: "Belanja" },
  { hexcode: "1F453", label: "Kacamata", group: "Belanja" },
  { hexcode: "1F484", label: "Lipstik / Kosmetik", group: "Belanja" },
  { hexcode: "1F48D", label: "Cincin / Perhiasan", group: "Belanja" },
  { hexcode: "1F4F1", label: "HP", group: "Belanja" },
  { hexcode: "1F5A5", label: "Komputer / Gadget", group: "Belanja" },

  // ── Rumah & Tagihan ───────────────────────────────────────────────────────
  { hexcode: "1F3E0", label: "Rumah", group: "Rumah" },
  { hexcode: "1F6CB", label: "Furnitur", group: "Rumah" },
  { hexcode: "1F4A1", label: "Listrik", group: "Rumah" },
  { hexcode: "1F6B0", label: "Air", group: "Rumah" },
  { hexcode: "1F525", label: "Gas", group: "Rumah" },
  { hexcode: "1F528", label: "Perbaikan", group: "Rumah" },
  { hexcode: "1F4FA", label: "TV / Internet", group: "Rumah" },
  { hexcode: "1F9F9", label: "Kebersihan", group: "Rumah" },
  { hexcode: "1F511", label: "Sewa Kontrakan", group: "Rumah" },
  { hexcode: "1F6AA", label: "Pintu", group: "Rumah" },
  { hexcode: "1F9F4", label: "Peralatan Dapur", group: "Rumah" },
  { hexcode: "1F6D1", label: "Asuransi", group: "Rumah" },

  // ── Kesehatan ─────────────────────────────────────────────────────────────
  { hexcode: "1F3E5", label: "Rumah Sakit", group: "Kesehatan" },
  { hexcode: "1F48A", label: "Obat", group: "Kesehatan" },
  { hexcode: "1FA7A", label: "Periksa Dokter", group: "Kesehatan" },
  { hexcode: "1F9EA", label: "Vitamin / Suplemen", group: "Kesehatan" },
  { hexcode: "1F3CB", label: "Gym", group: "Kesehatan" },
  { hexcode: "1F9D8", label: "Yoga", group: "Kesehatan" },
  { hexcode: "1F6C1", label: "Perawatan Diri", group: "Kesehatan" },
  { hexcode: "1FAE6", label: "Gigi", group: "Kesehatan" },
  { hexcode: "1F9E0", label: "Kesehatan Mental", group: "Kesehatan" },
  { hexcode: "2764", label: "Jantung Sehat", group: "Kesehatan" },

  // ── Hiburan ───────────────────────────────────────────────────────────────
  { hexcode: "1F3B5", label: "Musik", group: "Hiburan" },
  { hexcode: "1F3AE", label: "Game", group: "Hiburan" },
  { hexcode: "1F3AC", label: "Film / Netflix", group: "Hiburan" },
  { hexcode: "1F4DA", label: "Buku", group: "Hiburan" },
  { hexcode: "1F3A8", label: "Seni", group: "Hiburan" },
  { hexcode: "1F4F7", label: "Foto", group: "Hiburan" },
  { hexcode: "1F3A4", label: "Karaoke", group: "Hiburan" },
  { hexcode: "26BD", label: "Olahraga", group: "Hiburan" },
  { hexcode: "1F3D6", label: "Liburan Pantai", group: "Hiburan" },
  { hexcode: "1F3D4", label: "Liburan Gunung", group: "Hiburan" },
  { hexcode: "1F3AA", label: "Event / Tiket", group: "Hiburan" },
  { hexcode: "1F9E9", label: "Hobi", group: "Hiburan" },

  // ── Pendidikan ────────────────────────────────────────────────────────────
  { hexcode: "1F393", label: "Sekolah / Kuliah", group: "Pendidikan" },
  { hexcode: "1F4D6", label: "Kursus / Buku", group: "Pendidikan" },
  { hexcode: "270F", label: "ATK", group: "Pendidikan" },
  { hexcode: "1F4BB", label: "Laptop Belajar", group: "Pendidikan" },
  { hexcode: "1F310", label: "Kursus Online", group: "Pendidikan" },
  { hexcode: "1F9D1-200D-1F4BB", label: "Les Privat", group: "Pendidikan" },
  { hexcode: "1F4C3", label: "SPP", group: "Pendidikan" },

  // ── Pemasukan ─────────────────────────────────────────────────────────────
  { hexcode: "1F4BC", label: "Gaji / Kantor", group: "Pemasukan" },
  { hexcode: "1F3E2", label: "Bisnis", group: "Pemasukan" },
  { hexcode: "2B50", label: "Bonus", group: "Pemasukan" },
  { hexcode: "1F91D", label: "Freelance", group: "Pemasukan" },
  { hexcode: "1F4C8", label: "Dividen / Investasi", group: "Pemasukan" },
  { hexcode: "1FA84", label: "Passive Income", group: "Pemasukan" },
  { hexcode: "1F38A", label: "THR / Hadiah", group: "Pemasukan" },
  { hexcode: "1F4E9", label: "Transfer Masuk", group: "Pemasukan" },

  // ── Lainnya ───────────────────────────────────────────────────────────────
  { hexcode: "1F4AC", label: "Lainnya", group: "Lainnya" },
  { hexcode: "2753", label: "Tak Terduga", group: "Lainnya" },
  { hexcode: "26A1", label: "Darurat", group: "Lainnya" },
  { hexcode: "1F4E4", label: "Transfer Keluar", group: "Lainnya" },
  { hexcode: "1F4DD", label: "Catatan", group: "Lainnya" },
  { hexcode: "1F512", label: "Tabungan Kunci", group: "Lainnya" },
  { hexcode: "267B", label: "Cicilan / Utang", group: "Lainnya" },
  { hexcode: "1F4CB", label: "Laporan", group: "Lainnya" },
];

const GROUPS = Array.from(new Set(EMOJI_OPTIONS.map((e) => e.group)));

// ─── Props ───────────────────────────────────────────────────────────────────
interface EmojiPickerProps {
  value: string | null; // stored hexcode, e.g. "1F4B0"
  onChange: (hexcode: string) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────
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
      {/* Search */}
      <InputText
        id="emoji-search"
        label="Cari Emoji"
        placeholder="Cari emoji..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Group tabs */}
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

      {/* Emoji grid */}
      <div className="grid grid-cols-8 gap-0 max-h-[200px] overflow-y-auto">
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

      {/* Selected preview */}
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
