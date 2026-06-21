// src/components/layout/toast.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  add: (toast: Omit<Toast, "id">) => string;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (t) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    return id;
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (title: string, description?: string, duration?: number) =>
    useToastStore
      .getState()
      .add({ type: "success", title, description, duration }),
  error: (title: string, description?: string, duration?: number) =>
    useToastStore
      .getState()
      .add({ type: "error", title, description, duration }),
  warning: (title: string, description?: string, duration?: number) =>
    useToastStore
      .getState()
      .add({ type: "warning", title, description, duration }),
  info: (title: string, description?: string, duration?: number) =>
    useToastStore
      .getState()
      .add({ type: "info", title, description, duration }),
};

const CONFIG: Record<ToastType, { label: string; bg: string; accent: string }> =
  {
    success: { label: "OK", bg: "bg-emerald-100", accent: "bg-emerald-500" },
    error: { label: "ERR", bg: "bg-red-100", accent: "bg-red-500" },
    warning: { label: "WARN", bg: "bg-amber-100", accent: "bg-amber-400" },
    info: { label: "INFO", bg: "bg-blue-100", accent: "bg-blue-500" },
  };

const ACCENT_BORDER: Record<ToastType, string> = {
  success: "border-emerald-500",
  error: "border-red-500",
  warning: "border-amber-400",
  info: "border-blue-500",
};

const TOAST_DURATION = 4000;
const circumference = 2 * Math.PI * 9;

function ToastItem({ toast: t }: { toast: Toast }) {
  const remove = useToastStore((s) => s.remove);
  const duration = t.duration ?? TOAST_DURATION;

  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const pausedRef = useRef(false);
  const pauseTimeRef = useRef(0);

  const [remaining, setRemaining] = useState(duration);
  const [visible, setVisible] = useState(false);

  const cfg = CONFIG[t.type];
  const pct = (remaining / duration) * 100;
  const dashOffset = circumference * (1 - pct / 100);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => remove(t.id), 300);
  }, [t.id, remove]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    startRef.current = Date.now();
    const tick = () => {
      if (pausedRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const elapsed = Date.now() - startRef.current;
      const left = Math.max(0, duration - elapsed);
      setRemaining(left);
      if (left <= 0) handleDismiss();
      else rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration, handleDismiss]);

  const pause = useCallback(() => {
    pausedRef.current = true;
    pauseTimeRef.current = Date.now();
  }, []);

  const resume = useCallback(() => {
    if (!pausedRef.current) return;
    startRef.current += Date.now() - pauseTimeRef.current;
    pausedRef.current = false;
  }, []);

  return (
    <div
      onMouseEnter={pause}
      onMouseLeave={resume}
      className={[
        "relative flex items-start gap-3 overflow-hidden",
        "border-[2.5px] border-border font-mono",
        "px-3.5 py-3 min-w-[280px] max-w-[380px]",
        "transition-all duration-300",
        cfg.bg,
        visible
          ? "opacity-100 translate-x-0 shadow-[4px_4px_0px_#1a1a1a]"
          : "opacity-0 translate-x-8 shadow-none",
      ].join(" ")}
    >
      {/* Badge */}
      <span
        className={[
          "shrink-0 self-start mt-0.5",
          "border-2 border-border px-1.5 py-0.5",
          "text-[10px] font-black tracking-[0.15em] text-white",
          cfg.accent,
        ].join(" ")}
      >
        {cfg.label}
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-black leading-snug">
          {t.title}
        </p>
        {t.description && (
          <p className="text-[12px] text-black/60 mt-0.5 leading-snug">
            {t.description}
          </p>
        )}
      </div>

      {/* Countdown ring + close */}
      <button
        onClick={handleDismiss}
        className="shrink-0 relative w-6 h-6 flex items-center justify-center"
        aria-label="Tutup"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className="absolute inset-0"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="2"
            opacity={0.15}
          />
          <circle
            cx="12"
            cy="12"
            r="9"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="square"
            transform="rotate(-90 12 12)"
            className={[
              "transition-[stroke-dashoffset] duration-100",
              ACCENT_BORDER[t.type].replace("border-", "text-"),
            ].join(" ")}
          />
        </svg>
        <span className="text-[12px] font-black text-black z-10">✕</span>
      </button>

      {/* Bottom progress bar */}
      <div
        className={[
          "absolute bottom-0 left-0 h-[3px] transition-[width] duration-100",
          cfg.accent,
        ].join(" ")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function ToastPortal({ toasts }: { toasts: Toast[] }) {
  return createPortal(
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>,
    document.body,
  );
}

export function ToastProvider() {
  const toasts = useToastStore((s) => s.toasts);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return <ToastPortal toasts={toasts} />;
}
