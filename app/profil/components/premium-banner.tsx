"use client";

import { Crown, Receipt, Rocket } from "lucide-react";

type PremiumBannerProps = {
  isActive?: boolean;
  expiresAt: string;
  onViewBilling?: () => void;
  onUpgrade?: () => void;
};

const PremiumBanner = ({
  isActive = true,
  expiresAt,
  onViewBilling,
  onUpgrade,
}: PremiumBannerProps) => {
  return (
    <div className="bg-black border-[3px] border-border shadow-[8px_8px_0_#000] flex items-center gap-5 flex-wrap px-7 py-6">
      <div
        className="w-[52px] h-[52px] border-[3px] border-border flex items-center justify-center shrink-0"
        style={{ background: "var(--accent-bg)" }}
        aria-hidden="true"
      >
        <Crown size={24} strokeWidth={2.5} />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-xl font-black uppercase tracking-tight leading-none"
          style={{ color: "var(--accent-fg)" }}
        >
          Premium Membership
        </p>
        <p className="text-[10px] font-bold text-white/45 uppercase tracking-[0.12em] mt-1.5">
          Berlaku hingga {expiresAt}
        </p>
        <span
          className="inline-block text-[9px] font-black uppercase tracking-wider border-[2px] border-border px-2.5 py-1 mt-2"
          style={{ background: "var(--accent-fg)" }}
        >
          ● Status: {isActive ? "Aktif" : "Nonaktif"}
        </span>
      </div>

      <div className="flex gap-2.5 flex-wrap">
        <button
          type="button"
          onClick={onViewBilling}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-[10px] font-black uppercase tracking-wider border-[3px] border-white/30 text-white/70 bg-transparent transition-colors duration-100 hover:border-white hover:text-white"
        >
          <Receipt size={13} strokeWidth={2.5} />
          Billing History
        </button>
        <button
          type="button"
          onClick={onUpgrade}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-[10px] font-black uppercase tracking-wider border-[3px] border-border text-black shadow-[4px_4px_0_#000] transition-transform duration-100 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_hsl(var(--border))] active:translate-x-0 active:translate-y-0 active:shadow-none"
          style={{ background: "var(--accent-bg)" }}
        >
          <Rocket size={13} strokeWidth={2.5} />
          Upgrade Plan
        </button>
      </div>
    </div>
  );
};

export default PremiumBanner;
