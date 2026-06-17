"use client";

import { AlertTriangle, RefreshCw, Trash2 } from "lucide-react";

type DangerZoneCardProps = {
  onResetBudgetData?: () => void;
  onDeleteAccount?: () => void;
};

const DangerZoneCard = ({
  onResetBudgetData,
  onDeleteAccount,
}: DangerZoneCardProps) => {
  return (
    <div className="border-[3px] border-black shadow-[8px_8px_0_#000] overflow-hidden">
      <div
        className="flex items-center gap-2.5 px-5 py-3.5 border-b-[3px] border-black"
        style={{ background: "#FF3B3B" }}
      >
        <AlertTriangle size={18} strokeWidth={2.5} className="text-white" />
        <span className="text-[13px] font-black uppercase tracking-[0.15em] text-white">
          Danger Zone
        </span>
      </div>

      <div className="px-5 py-5" style={{ background: "#FFD6D6" }}>
        <p
          className="text-[12px] font-bold leading-relaxed mb-4"
          style={{ color: "#5A0000" }}
        >
          Tindakan di bawah ini{" "}
          <strong>bersifat permanen dan tidak dapat dibatalkan</strong>. Data
          yang dihapus tidak dapat dipulihkan. Pastikan Anda sudah membuat
          backup sebelum melanjutkan.
        </p>

        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            onClick={onResetBudgetData}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-[10px] font-black uppercase tracking-wider border-[3px] border-black bg-white transition-transform duration-100 hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[4px_4px_0_#000] active:translate-x-0 active:translate-y-0 active:shadow-none"
          >
            <RefreshCw size={13} strokeWidth={2.5} />
            Reset Budgeting Data
          </button>
          <button
            type="button"
            onClick={onDeleteAccount}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-[10px] font-black uppercase tracking-wider border-[3px] border-black bg-[#FF3B3B] text-white transition-transform duration-100 hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[4px_4px_0_#000] active:translate-x-0 active:translate-y-0 active:shadow-none"
          >
            <Trash2 size={13} strokeWidth={2.5} />
            Delete Account Permanently
          </button>
        </div>
      </div>
    </div>
  );
};

export default DangerZoneCard;
