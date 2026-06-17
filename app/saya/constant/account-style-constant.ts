export const ACCOUNT_STYLE = {
  accentColor: "#CBFF4D",
  dangerColor: "#FF3B3B",
  bgColor: "#F5F3EE",
} as const;

// Shared brutalist primitives — reuse across every account component
// so border widths / shadow offsets never drift between cards.
export const nb = {
  card: "bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-5",
  cardTight: "bg-white border-[3px] border-black shadow-[6px_6px_0_#000]",
  sectionLabel:
    "inline-block bg-[--accent] text-black text-[9px] font-black tracking-[0.22em] uppercase border-[2px] border-black px-2.5 py-1 mb-3",
  btn: "inline-flex items-center gap-2 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider border-[3px] border-black transition-transform duration-100 hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[4px_4px_0_#000] active:translate-x-0 active:translate-y-0 active:shadow-none",
  btnWhite: "bg-white text-black",
  btnBlack: "bg-black text-[#CBFF4D]",
  btnDanger: "bg-[#FF3B3B] text-white",
} as const;
