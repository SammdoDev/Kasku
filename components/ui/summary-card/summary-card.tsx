"use client";

import React, { useRef } from "react";

export type DeltaDir = "up" | "down" | "neutral";

export interface SummaryCardProps {
  badge: string;
  badgeIcon?: React.ReactNode;
  value: string;
  label: string;
  delta: string;
  dir?: DeltaDir;
  bgColor?: string;
  accentColor?: string;
  progress?: number;
  className?: string;
  onClick?: () => void;
}

const DIR_META = {
  up: { arrow: "↑", color: "text-green-700" },
  down: { arrow: "↓", color: "text-red-600" },
  neutral: { arrow: "—", color: "text-amber-900" },
};

const SummaryCard = ({
  badge,
  badgeIcon,
  value,
  label,
  delta,
  dir = "neutral",
  accentColor = "#f59e0b",
  progress,
  className = "",
  onClick,
}: SummaryCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { arrow, color } = DIR_META[dir];

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={[
        "group relative flex flex-col overflow-hidden border-[2.5px] border-[#1a1a1a] bg-white",
        "px-4 pb-0 pt-3.5 font-mono",
        "transition-[box-shadow,transform] duration-150 ease-out",
        "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#1a1a1a]",
        onClick ? "cursor-pointer select-none" : "cursor-default",
        className,
      ].join(" ")}
    >
      {/* Badge */}
      <div className="mb-2.5">
        <span
          className="inline-flex items-center gap-1 border-[1.5px] border-[#1a1a1a] px-[7px] py-0.5 text-[8px] font-black tracking-[1.5px] text-white"
          style={{ background: accentColor }}
        >
          {badgeIcon}
          {badge}
        </span>
      </div>

      {/* Value */}
      <div className="mb-0.5 break-all text-[22px] font-black leading-[1.1] tracking-tight text-[#1a1a1a]">
        {value}
      </div>

      {/* Label */}
      <div className="mb-2.5 text-[9px] tracking-[0.2px] text-[#777]">
        {label}
      </div>

      {/* Delta */}
      <div className="mb-3.5">
        <span
          className={`inline-flex items-center gap-0.5 text-[9px] font-extrabold ${color}`}
        >
          {arrow} {delta}
        </span>
      </div>

      {/* Bottom accent / progress bar */}
      <div
        className="absolute bottom-0 left-0 h-[3px] transition-[width] duration-700"
        style={{
          width:
            progress !== undefined
              ? `${Math.min(100, Math.max(0, progress))}%`
              : "100%",
          background: accentColor,
        }}
      />
    </div>
  );
};

export default SummaryCard;
