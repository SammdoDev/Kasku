"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

// ─── Store ────────────────────────────────────────────────────────────────────

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

// ─── Public API ───────────────────────────────────────────────────────────────

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

// ─── Config per type ──────────────────────────────────────────────────────────

const CONFIG: Record<
  ToastType,
  { label: string; bg: string; border: string; accent: string }
> = {
  success: {
    label: "SUCCESS",
    bg: "#d4f5c4",
    border: "#1a1a1a",
    accent: "#22c55e",
  },
  error: {
    label: "ERROR",
    bg: "#ffe0e0",
    border: "#1a1a1a",
    accent: "#ef4444",
  },
  warning: {
    label: "WARN",
    bg: "#fff3c4",
    border: "#1a1a1a",
    accent: "#f59e0b",
  },
  info: { label: "INFO", bg: "#dbeafe", border: "#1a1a1a", accent: "#3b82f6" },
};

const TOAST_DURATION = 4000;
const circumference = 2 * Math.PI * 9;

// ─── Single Toast Item ────────────────────────────────────────────────────────

function ToastItem({ toast: t }: { toast: Toast }) {
  const remove = useToastStore((s) => s.remove);
  const duration = t.duration ?? TOAST_DURATION;

  // FIX 1: initialise startRef lazily inside useRef callback (no Date.now at render time)
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const pausedRef = useRef(false);
  const pauseTimeRef = useRef(0);

  const [remaining, setRemaining] = useState(duration);
  const [visible, setVisible] = useState(false);

  const cfg = CONFIG[t.type];
  const pct = (remaining / duration) * 100;
  const dashOffset = circumference * (1 - pct / 100);

  // FIX 2: declare handleDismiss BEFORE the effect that calls it
  const handleDismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => remove(t.id), 300);
  }, [t.id, remove]);

  // Animate in
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Countdown ticker — startRef is set imperatively, not during render
  useEffect(() => {
    // FIX 1 continued: assign Date.now() inside the effect (side-effect context)
    startRef.current = Date.now();

    const tick = () => {
      if (pausedRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const elapsed = Date.now() - startRef.current;
      const left = Math.max(0, duration - elapsed);
      setRemaining(left);
      if (left <= 0) {
        handleDismiss();
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
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
      style={{
        fontFamily: "'Space Grotesk', monospace",
        background: cfg.bg,
        border: `2.5px solid ${cfg.border}`,
        boxShadow: visible
          ? `4px 4px 0px ${cfg.border}`
          : `0px 0px 0px ${cfg.border}`,
        borderRadius: 0,
        padding: "12px 14px",
        minWidth: 280,
        maxWidth: 380,
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        transition: "opacity 0.3s, transform 0.3s, box-shadow 0.15s",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(32px)",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Type badge */}
      <div
        style={{
          background: cfg.accent,
          border: `2px solid ${cfg.border}`,
          color: "#fff",
          fontWeight: 800,
          fontSize: 10,
          letterSpacing: 1.5,
          padding: "2px 6px",
          flexShrink: 0,
          alignSelf: "flex-start",
          marginTop: 1,
          fontFamily: "monospace",
        }}
      >
        {cfg.label}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            color: "#1a1a1a",
            lineHeight: 1.3,
          }}
        >
          {t.title}
        </div>
        {t.description && (
          <div
            style={{
              fontSize: 12,
              color: "#444",
              marginTop: 3,
              lineHeight: 1.4,
            }}
          >
            {t.description}
          </div>
        )}
      </div>

      {/* Countdown ring + X */}
      <button
        onClick={handleDismiss}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          flexShrink: 0,
          position: "relative",
          width: 24,
          height: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label="Dismiss"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            fill="none"
            stroke={cfg.border}
            strokeWidth="2"
            opacity={0.15}
          />
          <circle
            cx="12"
            cy="12"
            r="9"
            fill="none"
            stroke={cfg.accent}
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="square"
            transform="rotate(-90 12 12)"
            style={{ transition: "stroke-dashoffset 0.1s linear" }}
          />
        </svg>
        <span
          style={{
            fontSize: 12,
            fontWeight: 900,
            color: cfg.border,
            lineHeight: 1,
            zIndex: 1,
          }}
        >
          ✕
        </span>
      </button>

      {/* Bottom progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 3,
          width: `${pct}%`,
          background: cfg.accent,
          transition: "width 0.1s linear",
        }}
      />
    </div>
  );
}


function ToastPortal({ toasts }: { toasts: Toast[] }) {
  return createPortal(
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        alignItems: "flex-end",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: "auto" }}>
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