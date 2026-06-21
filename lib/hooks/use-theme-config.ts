"use client";

import { useEffect, useState, useCallback } from "react";

export type AccentColor = {
  id: string;
  label: string;
  bg: string;
  fg: string;
  navbarBg: string;
  sidebarBg: string;
  sidebarBgDark: string;
  navbarBgDark: string;
};

export type SizeScale = "xs" | "sm" | "md" | "lg" | "xl";

export const ACCENT_COLORS: AccentColor[] = [
  {
    id: "yellow",
    label: "Kuning",
    bg: "#f5c518",
    fg: "#000000",
    navbarBg: "#f5f0e8",
    sidebarBg: "#f5f0e8",
    navbarBgDark: "#1a1a14",
    sidebarBgDark: "#1a1a14",
  },
  {
    id: "blue",
    label: "Biru",
    bg: "#3b82f6",
    fg: "#ffffff",
    navbarBg: "#eff6ff",
    sidebarBg: "#eff6ff",
    navbarBgDark: "#0f172a",
    sidebarBgDark: "#0f172a",
  },
  {
    id: "green",
    label: "Hijau",
    bg: "#22c55e",
    fg: "#000000",
    navbarBg: "#f0fdf4",
    sidebarBg: "#f0fdf4",
    navbarBgDark: "#052e16",
    sidebarBgDark: "#052e16",
  },
  {
    id: "red",
    label: "Merah",
    bg: "#ef4444",
    fg: "#ffffff",
    navbarBg: "#fff1f2",
    sidebarBg: "#fff1f2",
    navbarBgDark: "#1f0505",
    sidebarBgDark: "#1f0505",
  },
  {
    id: "purple",
    label: "Ungu",
    bg: "#a855f7",
    fg: "#ffffff",
    navbarBg: "#faf5ff",
    sidebarBg: "#faf5ff",
    navbarBgDark: "#1a0533",
    sidebarBgDark: "#1a0533",
  },
  {
    id: "orange",
    label: "Oranye",
    bg: "#f97316",
    fg: "#000000",
    navbarBg: "#fff7ed",
    sidebarBg: "#fff7ed",
    navbarBgDark: "#1c0a00",
    sidebarBgDark: "#1c0a00",
  },
  {
    id: "pink",
    label: "Pink",
    bg: "#ec4899",
    fg: "#ffffff",
    navbarBg: "#fdf2f8",
    sidebarBg: "#fdf2f8",
    navbarBgDark: "#1f0515",
    sidebarBgDark: "#1f0515",
  },
  {
    id: "teal",
    label: "Teal",
    bg: "#14b8a6",
    fg: "#000000",
    navbarBg: "#f0fdfa",
    sidebarBg: "#f0fdfa",
    navbarBgDark: "#021917",
    sidebarBgDark: "#021917",
  },
];

export const SIZE_SCALES: Record<
  SizeScale,
  {
    label: string;
    navbarH: string;
    sidebarW: string;
    baseFontSize: string;
    navFontSize: string;
    iconSize: string;
    spacingNav: string;
  }
> = {
  xs: {
    label: "XS",
    navbarH: "48px",
    sidebarW: "200px",
    baseFontSize: "11px",
    navFontSize: "11px",
    iconSize: "13px",
    spacingNav: "6px",
  },
  sm: {
    label: "SM",
    navbarH: "58px",
    sidebarW: "220px",
    baseFontSize: "12px",
    navFontSize: "12px",
    iconSize: "14px",
    spacingNav: "7px",
  },
  md: {
    label: "MD",
    navbarH: "71px",
    sidebarW: "240px",
    baseFontSize: "14px",
    navFontSize: "13.5px",
    iconSize: "16px",
    spacingNav: "9px",
  },
  lg: {
    label: "LG",
    navbarH: "84px",
    sidebarW: "260px",
    baseFontSize: "15px",
    navFontSize: "15px",
    iconSize: "18px",
    spacingNav: "11px",
  },
  xl: {
    label: "XL",
    navbarH: "96px",
    sidebarW: "280px",
    baseFontSize: "16px",
    navFontSize: "16px",
    iconSize: "20px",
    spacingNav: "13px",
  },
};

type ThemeConfig = {
  accentId: string;
  size: SizeScale;
};

const SESSION_KEY = "cashora_theme";

const DEFAULT: ThemeConfig = { accentId: "yellow", size: "md" };

function loadConfig(): ThemeConfig {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
}

function applyConfig(config: ThemeConfig, isDark: boolean) {
  const accent =
    ACCENT_COLORS.find((c) => c.id === config.accentId) ?? ACCENT_COLORS[0];
  const scale = SIZE_SCALES[config.size];
  const el = document.documentElement;

  el.style.setProperty("--accent-bg", accent.bg);
  el.style.setProperty("--accent-fg", accent.fg);
  el.style.setProperty("--brand-accent", accent.bg);
  el.style.setProperty("--brand-accent-fg", accent.fg);
  el.style.setProperty(
    "--sidebar-bg",
    isDark ? accent.sidebarBgDark : accent.sidebarBg,
  );
  el.style.setProperty(
    "--navbar-bg",
    isDark ? accent.navbarBgDark : accent.navbarBg,
  );

  el.style.setProperty("--navbar-h", scale.navbarH);
  el.style.setProperty("--sidebar-w", scale.sidebarW);
  el.style.setProperty("--base-font-size", scale.baseFontSize);
  el.style.setProperty("--nav-font-size", scale.navFontSize);
  el.style.setProperty("--icon-size", scale.iconSize);
  el.style.setProperty("--spacing-nav", scale.spacingNav);
}

export function useThemeConfig() {
  const [config, setConfig] = useState<ThemeConfig>(DEFAULT);

  useEffect(() => {
    const saved = loadConfig();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConfig(saved);
    const isDark = document.documentElement.classList.contains("dark");
    applyConfig(saved, isDark);

    // observe dark mode class changes
    const observer = new MutationObserver(() => {
      const isDarkNow = document.documentElement.classList.contains("dark");
      const current = loadConfig();
      applyConfig(current, isDarkNow);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const update = useCallback((partial: Partial<ThemeConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      const isDark = document.documentElement.classList.contains("dark");
      applyConfig(next, isDark);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { config, update, ACCENT_COLORS, SIZE_SCALES };
}
