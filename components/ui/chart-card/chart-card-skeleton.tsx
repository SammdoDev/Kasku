"use client";

const ChartCardSkeleton = ({ height = 240 }: { height?: number }) => (
  <div className="border-[2.5px] border-[#1a1a1a] bg-white p-4">
    {/* title + toggle */}
    <div className="flex justify-between mb-2.5">
      <div>
        <div className="h-3 w-36 bg-[#e0e0e0] rounded-none animate-pulse" />
        <div className="h-2 w-24 bg-[#e0e0e0] rounded-none animate-pulse mt-1" />
      </div>
      <div className="flex gap-1">
        <div className="h-[22px] w-9 bg-[#e0e0e0] rounded-none animate-pulse" />
        <div className="h-[22px] w-8 bg-[#e0e0e0] rounded-none animate-pulse" />
      </div>
    </div>

    {/* legend */}
    <div className="flex gap-3 mb-2.5">
      <div className="h-2.5 w-16 bg-[#e0e0e0] rounded-none animate-pulse" />
      <div className="h-2.5 w-20 bg-[#e0e0e0] rounded-none animate-pulse" />
    </div>

    {/* chart area */}
    <div
      className="relative overflow-hidden bg-[#f7f7f7] animate-pulse"
      style={{ height }}
    >
      {[65, 40, 80, 55, 70, 45, 60].map((h2, i) => (
        <div
          key={i}
          className="absolute bottom-0 bg-[#e4e4e4]"
          style={{ left: `${8 + i * 13}%`, width: "8%", height: `${h2}%` }}
        />
      ))}
    </div>
  </div>
);

export default ChartCardSkeleton;
