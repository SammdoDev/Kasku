"use client";

import React from "react";

export interface ChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  size?: "sm" | "md";
}

const Chip = ({ active, onClick, children, size = "md" }: ChipProps) => (
  <button
    onClick={onClick}
    className={[
      "relative cursor-pointer select-none whitespace-nowrap rounded-none border-[2.5px] border-[#1a1a1a]",
      "font-mono text-[10px] font-extrabold tracking-[0.3px] outline-none",
      "transition-[background,box-shadow] duration-100",
      size === "sm" ? "px-2.5 py-[3px]" : "px-[13px] py-[5px] text-[11px]",
      active
        ? "z-10 bg-[#1a1a1a] text-white shadow-[3px_3px_0_#555]"
        : "z-0 bg-transparent text-[#1a1a1a] hover:bg-[#f0f0f0] hover:shadow-[3px_3px_0_#1a1a1a]",
    ].join(" ")}
  >
    {children}
  </button>
);

export default Chip;
