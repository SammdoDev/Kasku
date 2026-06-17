// components/layout/for-pages/theme-toggle.tsx
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-9 w-9 border-[2.5px] border-black" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-9 w-9 flex items-center justify-center bg-card text-card-foreground border-[2.5px] border-border shadow-brutal-sm hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0_hsl(var(--border))] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-100"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun size={16} strokeWidth={2.5} />
      ) : (
        <Moon size={16} strokeWidth={2.5} />
      )}
    </button>
  );
};

export default ThemeToggle;
