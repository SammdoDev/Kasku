"use client";

import { Bell, HelpCircle, Settings } from "lucide-react";

type AccountTopbarProps = {
  title?: string;
  subtitle?: string;
};

const AccountTopbar = ({
  title = "Account",
  subtitle = "Kelola akun dan preferensi Anda",
}: AccountTopbarProps) => {
  return (
    <div
      className="flex items-stretch h-[58px] border-b-[4px] border-black px-7"
      style={{ background: "#CBFF4D" }}
    >
      <div className="flex items-center pr-6 mr-6 border-r-[4px] border-black">
        <span className="font-black text-xl uppercase tracking-tight">
          {title}
        </span>
      </div>

      <div className="flex-1 flex items-center text-[11px] font-black uppercase tracking-wider text-black/60">
        {subtitle}
      </div>

      <div className="flex border-l-[4px] border-black">
        {[
          { icon: Bell, label: "Notifikasi" },
          { icon: Settings, label: "Pengaturan" },
          { icon: HelpCircle, label: "Bantuan" },
        ].map(({ icon: Icon, label }, i) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            className={[
              "w-[58px] flex items-center justify-center transition-colors duration-100",
              "hover:bg-black hover:text-[#CBFF4D]",
              i < 2 ? "border-r-[4px] border-black" : "",
            ].join(" ")}
          >
            <Icon size={18} strokeWidth={2.5} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default AccountTopbar;
