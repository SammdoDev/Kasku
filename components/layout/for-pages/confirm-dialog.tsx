"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { create } from "zustand";

export type ConfirmVariant = "danger" | "warning" | "info";

interface ConfirmOptions {
  title: string;
  description?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

interface ConfirmState {
  open: boolean;
  options: ConfirmOptions;
  resolve: ((value: boolean) => void) | null;
  show: (options: ConfirmOptions) => Promise<boolean>;
  _confirm: () => void;
  _cancel: () => void;
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  open: false,
  options: { title: "" },
  resolve: null,
  show: (options) =>
    new Promise<boolean>((resolve) => {
      set({ open: true, options, resolve });
    }),
  _confirm: () => {
    get().resolve?.(true);
    set({ open: false, resolve: null });
  },
  _cancel: () => {
    get().resolve?.(false);
    set({ open: false, resolve: null });
  },
}));

export const confirm = {
  show: (options: ConfirmOptions) => useConfirmStore.getState().show(options),
};

// Variant config — warna semantic, bukan hardcode
const VARIANT_CONFIG: Record<
  ConfirmVariant,
  { icon: string; iconBg: string; btnClass: string; btnShadow: string }
> = {
  danger: {
    icon: "⚠",
    iconBg: "bg-red-100 border-red-500",
    btnClass: "bg-red-500 border-red-500 text-white hover:bg-red-600",
    btnShadow: "shadow-[2px_2px_0px_#b91c1c]",
  },
  warning: {
    icon: "!",
    iconBg: "bg-amber-100 border-amber-500",
    btnClass: "bg-amber-500 border-amber-500 text-white hover:bg-amber-600",
    btnShadow: "shadow-[2px_2px_0px_#92400e]",
  },
  info: {
    icon: "i",
    iconBg: "bg-blue-100 border-blue-500",
    btnClass: "bg-blue-500 border-blue-500 text-white hover:bg-blue-600",
    btnShadow: "shadow-[2px_2px_0px_#1d4ed8]",
  },
};

function ConfirmDialogInner() {
  const open = useConfirmStore((s) => s.open);
  const options = useConfirmStore((s) => s.options);
  const _confirm = useConfirmStore((s) => s._confirm);
  const _cancel = useConfirmStore((s) => s._cancel);

  const [visible, setVisible] = useState(false);
  const variant = options.variant ?? "danger";
  const cfg = VARIANT_CONFIG[variant];

  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") _cancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, _cancel]);

  if (!open && !visible) return null;

  return (
    <div
      className={[
        "fixed inset-0 z-[10000] flex items-center justify-center p-4 font-mono",
        "transition-all duration-200",
        visible ? "bg-foreground/50" : "bg-foreground/0",
      ].join(" ")}
      onClick={(e) => {
        if (e.target === e.currentTarget) _cancel();
      }}
    >
      <div
        className={[
          "bg-card border-[2.5px] border-border w-full max-w-sm",
          "transition-all duration-200",
          visible
            ? "opacity-100 scale-100 shadow-[6px_6px_0px_hsl(var(--border))]"
            : "opacity-0 scale-95 shadow-none",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-4 pb-3.5 border-b-2 border-border">
          <div
            className={[
              "w-8 h-8 border-2 flex items-center justify-center shrink-0",
              "text-[14px] font-black",
              cfg.iconBg,
            ].join(" ")}
          >
            {cfg.icon}
          </div>
          <div>
            <p className="text-[12px] font-black tracking-[0.15em] text-foreground">
              {options.title.toUpperCase()}
            </p>
            {options.description && (
              <p className="text-[11px] text-foreground/50 mt-0.5 leading-snug">
                {options.description}
              </p>
            )}
          </div>
        </div>

        {/* Body */}
        {options.message && (
          <div className="px-5 py-3.5 text-[12px] text-foreground/70 leading-relaxed border-b-2 border-border bg-foreground/[0.02]">
            {options.message}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 justify-end px-5 py-3">
          <button
            onClick={_cancel}
            className={[
              "px-4 py-2 text-[10px] font-black tracking-[0.15em]",
              "border-2 border-border bg-card text-foreground",
              "hover:bg-foreground hover:text-background transition-all duration-100",
              "shadow-[2px_2px_0px_hsl(var(--border))] hover:shadow-none",
              "hover:translate-x-[2px] hover:translate-y-[2px]",
            ].join(" ")}
          >
            {options.cancelLabel ?? "BATAL"}
          </button>
          <button
            onClick={_confirm}
            className={[
              "px-4 py-2 text-[10px] font-black tracking-[0.15em]",
              "border-2 transition-all duration-100",
              "hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
              cfg.btnClass,
              cfg.btnShadow,
            ].join(" ")}
          >
            {options.confirmLabel ?? "YA, LANJUTKAN"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConfirmDialogProvider() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return createPortal(<ConfirmDialogInner />, document.body);
}
