"use client";

import { useThemeConfig } from "@/lib/hooks/use-theme-config";

export function ThemeConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useThemeConfig();
  return <>{children}</>;
}
