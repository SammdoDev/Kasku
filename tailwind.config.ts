// Tailwind v4: almost all config moves to globals.css via @theme inline.
// This file is kept only for editor tooling compatibility.
// Do NOT add darkMode, theme.extend colours, etc. here — use @theme in CSS.

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
};

export default config;
