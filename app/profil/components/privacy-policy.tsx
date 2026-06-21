"use client";

import { Database, PlugZap, ShieldCheck } from "lucide-react";

type PrivacyItem = {
  id: string;
  title: string;
  description: string;
  icon: typeof Database;
};

const PRIVACY_ITEMS: PrivacyItem[] = [
  {
    id: "pengumpulan-data",
    title: "Pengumpulan Data",
    description:
      "Kami hanya mengumpulkan data yang diperlukan untuk menjalankan layanan budgeting Anda dengan aman dan efisien.",
    icon: Database,
  },
  {
    id: "keamanan-finansial",
    title: "Keamanan Finansial",
    description:
      "Data keuangan Anda dienkripsi end-to-end dan tidak pernah dijual atau dibagikan ke pihak ketiga.",
    icon: ShieldCheck,
  },
  {
    id: "integrasi-pihak-ketiga",
    title: "Integrasi Pihak Ketiga",
    description:
      "Integrasi eksternal hanya mengakses data sesuai izin eksplisit yang Anda berikan saat koneksi.",
    icon: PlugZap,
  },
];

const PrivacyPolicyCard = () => {
  return (
    <div>
      <span className="inline-block bg-[var(--accent)] text-black text-[9px] font-black tracking-[0.22em] uppercase border-[2px] border-border px-2.5 py-1 mb-3">
        Privacy Policy
      </span>

      <div className="bg-card border-[3px] border-border shadow-[6px_6px_0_hsl(var(--border))] p-4.5">
        {PRIVACY_ITEMS.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={[
                "py-3.5",
                i < PRIVACY_ITEMS.length - 1
                  ? "border-b-[3px] border-border"
                  : "",
              ].join(" ")}
            >
              <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide mb-1.5">
                <Icon size={15} strokeWidth={2.5} />
                {item.title}
              </p>
              <p className="text-[11px] font-medium text-black/55 leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PrivacyPolicyCard;
