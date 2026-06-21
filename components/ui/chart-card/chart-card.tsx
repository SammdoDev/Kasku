"use client";

import { useEffect, useRef, useState } from "react";
import type { TooltipItem } from "chart.js";

export type ChartType = "line" | "bar";

export interface ChartDataset {
  label: string;
  data: number[];
  color: string;
  borderDash?: number[];
  fill?: boolean;
}

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  labels: string[];
  datasets: ChartDataset[];
  chartType?: ChartType;
  lockType?: boolean;
  height?: number;
  className?: string;
  formatCurrency?: boolean;
  emptyMessage?: string;
  accentColor?: string;
}

function formatIDRShort(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000_000)
    return `${sign}Rp ${(abs / 1_000_000_000).toFixed(1)}M`;
  if (abs >= 1_000_000) return `${sign}Rp ${(abs / 1_000_000).toFixed(1)}jt`;
  if (abs >= 1_000) return `${sign}Rp ${(abs / 1_000).toFixed(0)}rb`;
  return `${sign}Rp ${abs.toLocaleString("id-ID")}`;
}

function buildDatasets(datasets: ChartDataset[], type: ChartType) {
  return datasets.map((ds) => ({
    label: ds.label,
    data: ds.data,
    borderColor: ds.color,
    backgroundColor:
      type === "bar"
        ? ds.color + "CC"
        : ds.fill
          ? ds.color + "22"
          : "transparent",
    borderWidth: type === "bar" ? 0 : 2.5,
    fill: type === "line" ? (ds.fill ?? false) : false,
    tension: 0,
    pointRadius: ds.data.length > 20 ? 0 : 4,
    pointHoverRadius: 6,
    pointBorderWidth: 2,
    pointBorderColor: "#0a0a0a",
    pointBackgroundColor: ds.color,
    borderDash: ds.borderDash ?? [],
  }));
}

const getBaseOptions = (formatCurrency: boolean) => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 300 },
  interaction: { mode: "index" as const, intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#0a0a0a",
      titleFont: {
        family: "Space Mono, monospace",
        weight: "bold" as const,
        size: 9,
      },
      bodyFont: { family: "Space Mono, monospace", size: 10 },
      padding: 10,
      cornerRadius: 0,
      borderColor: "#FACC15",
      borderWidth: 2,
      displayColors: true,
      boxWidth: 8,
      boxHeight: 8,
      callbacks: formatCurrency
        ? {
            label: (ctx: TooltipItem<"line" | "bar">) =>
              ` ${ctx.dataset.label ?? ""}: ${formatIDRShort((ctx.parsed as { y: number }).y ?? 0)}`,
          }
        : undefined,
    },
  },
  scales: {
    x: {
      grid: { color: "rgba(0,0,0,0.06)", lineWidth: 1 },
      ticks: {
        font: { family: "Space Mono, monospace", size: 8 },
        color: "#888",
        maxRotation: 40,
        autoSkip: true,
        maxTicksLimit: 8,
      },
      border: { color: "#0a0a0a", width: 2 },
    },
    y: {
      grid: { color: "rgba(0,0,0,0.06)", lineWidth: 1 },
      ticks: {
        font: { family: "Space Mono, monospace", size: 8 },
        color: "#888",
        callback: formatCurrency
          ? (v: number | string) => formatIDRShort(Number(v))
          : undefined,
      },
      border: { color: "#0a0a0a", width: 2 },
    },
  },
});

const ChartCard = ({
  title,
  subtitle,
  labels,
  datasets,
  chartType: initialType = "line",
  lockType = false,
  height = 220,
  className = "",
  formatCurrency = true,
  emptyMessage = "Belum ada data untuk periode ini",
  accentColor = "#FACC15",
}: ChartCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);
  const [type, setType] = useState<ChartType>(initialType);

  const isEmpty = datasets.every(
    (ds) => ds.data.every((v) => v === 0) || ds.data.length === 0,
  );

  useEffect(() => {
    if (typeof window === "undefined" || isEmpty) return;
    import("chart.js/auto").then(({ Chart }) => {
      if (!canvasRef.current) return;
      chartRef.current?.destroy();
      chartRef.current = null;
      chartRef.current = new Chart(canvasRef.current!, {
        type: type === "bar" ? "bar" : "line",
        data: { labels, datasets: buildDatasets(datasets, type) },
        options: getBaseOptions(formatCurrency),
      });
    });
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [type, labels, datasets, isEmpty, formatCurrency]);

  return (
    <div
      className={`relative bg-card border-[3px] border-[#0a0a0a] shadow-[5px_5px_0_#0a0a0a] p-4 font-mono ${className}`}
    >
      {/* Top accent bar */}
      <div
        className="absolute -top-[3px] -left-[3px] h-1 w-10"
        style={{ background: accentColor }}
      />

      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-2 mb-2.5">
        <div>
          <div className="text-[11px] font-bold tracking-[1px] uppercase text-[#0a0a0a] leading-tight">
            {title}
          </div>
          {subtitle && (
            <div className="text-[9px] text-[#666] mt-0.5 tracking-[0.5px] uppercase">
              {subtitle}
            </div>
          )}
        </div>

        {!lockType && (
          <div className="flex flex-shrink-0">
            {(["line", "bar"] as ChartType[]).map((key, i) => (
              <button
                key={key}
                onClick={() => setType(key)}
                className={`font-mono text-[9px] font-bold tracking-[1px] px-2.5 py-1 border-2 border-[#0a0a0a] cursor-pointer rounded-none outline-none transition-colors duration-75 ${
                  i === 0 ? "border-r-0" : ""
                } ${
                  type === key
                    ? "bg-[#0a0a0a] text-white"
                    : "bg-card text-[#0a0a0a]"
                }`}
              >
                {key.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-3">
        {datasets.map((ds, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 text-[8px] font-bold text-[#555] tracking-[0.8px] uppercase"
          >
            <span
              className="inline-block w-2.5 h-2.5 border-2 border-[#0a0a0a] flex-shrink-0"
              style={{ background: ds.color }}
            />
            {ds.label.toUpperCase()}
          </div>
        ))}
      </div>

      {/* Canvas / empty */}
      <div className="relative w-full" style={{ height }}>
        {isEmpty ? (
          <div className="w-full h-full flex flex-col items-center justify-content gap-1.5 border-[2.5px] border-dashed border-[#ccc]">
            <span className="text-[10px] font-bold tracking-[2px] uppercase text-[#bbb]">
              BELUM ADA DATA
            </span>
            <span className="text-[8px] text-[#ddd]">{emptyMessage}</span>
          </div>
        ) : (
          <canvas ref={canvasRef} className="w-full h-full" />
        )}
      </div>
    </div>
  );
};

export default ChartCard;
