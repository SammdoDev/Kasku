export const ACCOUNT_STYLE = {
  accentColor: "var(--accent)",
  dangerColor: "#FF3B3B",
  bgColor: "#F5F3EE",
} as const;

// Shared brutalist primitives — reuse across every account component
// so border widths / shadow offsets never drift between cards.
export const nb = {
  card: "bg-card border-[3px] border-border shadow-[6px_6px_0_hsl(var(--border))] p-5",
  cardTight:
    "bg-card border-[3px] border-border shadow-[6px_6px_0_hsl(var(--border))]",
  sectionLabel:
    "inline-block bg-[--accent] text-black text-[9px] font-black tracking-[0.22em] uppercase border-[2px] border-border px-2.5 py-1 mb-3",
  btn: "inline-flex items-center gap-2 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider border-[3px] border-border transition-transform duration-100 hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[4px_4px_0_#000] active:translate-x-0 active:translate-y-0 active:shadow-none",
  btnWhite: "bg-card text-black",
  btnBlack: "bg-black text-[var(--accent)]",
  btnDanger: "bg-[#FF3B3B] text-white",
} as const;
