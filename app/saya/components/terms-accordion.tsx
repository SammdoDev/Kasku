"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type AccordionEntry = {
  id: string;
  title: string;
  content: string;
};

type TermsAccordionProps = {
  items?: AccordionEntry[];
};

const DEFAULT_ITEMS: AccordionEntry[] = [
  {
    id: "ketentuan",
    title: "Ketentuan Pengguna",
    content:
      "Dengan menggunakan layanan ini, Anda menyetujui semua ketentuan yang berlaku. Kami berhak memperbarui ketentuan ini sewaktu-waktu.",
  },
  {
    id: "tanggung-jawab",
    title: "Tanggung Jawab Pengguna",
    content:
      "Pengguna bertanggung jawab atas keamanan akun dan seluruh aktivitas yang terjadi di dalamnya.",
  },
  {
    id: "pembayaran",
    title: "Pembayaran & Refund",
    content:
      "Pembayaran bersifat final. Refund hanya diproses dalam 7 hari jika layanan tidak berfungsi sebagaimana mestinya.",
  },
  {
    id: "disclaimer",
    title: "Disclaimer Finansial",
    content:
      "Layanan ini bukan penasehat keuangan. Setiap keputusan finansial sepenuhnya menjadi tanggung jawab pengguna.",
  },
];

const TermsAccordion = ({ items = DEFAULT_ITEMS }: TermsAccordionProps) => {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div>
      <span className="inline-block bg-[#CBFF4D] text-black text-[9px] font-black tracking-[0.22em] uppercase border-[2px] border-black px-2.5 py-1 mb-3">
        Terms &amp; Conditions
      </span>

      <div className="border-[3px] border-black shadow-[6px_6px_0_#000]">
        {items.map((item, i) => {
          const isOpen = openId === item.id;
          return (
            <div
              key={item.id}
              className={
                i < items.length - 1 ? "border-b-[3px] border-black" : ""
              }
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : item.id)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between text-left px-4.5 py-3.5 bg-white text-[11px] font-black uppercase tracking-wide transition-colors duration-100 hover:bg-[#CBFF4D]"
              >
                {item.title}
                <ChevronDown
                  size={16}
                  strokeWidth={2.5}
                  className={[
                    "shrink-0 transition-transform duration-200",
                    isOpen ? "rotate-180" : "",
                  ].join(" ")}
                />
              </button>
              {isOpen && (
                <div className="px-4.5 py-3.5 bg-[#F5F3EE] border-t-[3px] border-black text-[12px] text-black/65 font-medium leading-relaxed">
                  {item.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TermsAccordion;
