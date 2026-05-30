"use client";

import React from "react";

const SummaryCardSkeleton = () => (
  <div className="relative flex min-h-[130px] flex-col justify-between overflow-hidden border-[2.5px] border-[#1a1a1a] bg-[#f5f5f5] px-4 pb-[18px] pt-3.5">
    <div>
      <div className="h-4 w-16 animate-[skPulse_1.5s_infinite_ease-in-out] bg-[#e0e0e0]" />
      <div className="mt-1 h-[26px] w-24 animate-[skPulse_1.5s_infinite_ease-in-out] bg-[#e0e0e0]" />
      <div className="h-2.5 w-28 animate-[skPulse_1.5s_infinite_ease-in-out] bg-[#e0e0e0]" />
    </div>

    <div className="mt-2.5">
      <div className="h-[18px] w-20 animate-[skPulse_1.5s_infinite_ease-in-out] bg-[#e0e0e0]" />
    </div>

    <div className="absolute bottom-0 left-0 h-1 w-[55%] animate-[skPulse_1.5s_infinite_ease-in-out] bg-[#d4d4d4]" />
  </div>
);

export default SummaryCardSkeleton;
