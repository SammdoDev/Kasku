"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChildModalWrapperProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: "sm" | "md" | "lg" | "full";
  className?: string;
}

const widthMap = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  full: "w-full h-full",
};

const ChildModalWrapper = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = "md",
  className,
}: ChildModalWrapperProps) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [portal, setPortal] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPortal(el);
    return () => {
      document.body.removeChild(el);
    };
  }, []);

  useEffect(() => {
    const backdrop = backdropRef.current;
    const panel = panelRef.current;
    if (!backdrop || !panel) return;

    if (open) {
      backdrop.style.display = "flex";
      requestAnimationFrame(() => {
        backdrop.style.opacity = "1";
        backdrop.style.pointerEvents = "auto";
        panel.style.transform = "translateY(0) scale(1)";
        panel.style.opacity = "1";
      });
    } else {
      backdrop.style.opacity = "0";
      backdrop.style.pointerEvents = "none";
      panel.style.transform = "translateY(16px) scale(0.95)";
      panel.style.opacity = "0";
      const timer = setTimeout(() => {
        if (backdropRef.current) backdropRef.current.style.display = "none";
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, portal]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!portal) return null;

  return createPortal(
    <div
      ref={backdropRef}
      className={cn(
        "fixed inset-0 z-[9999] items-center justify-center",
        width === "full" ? "p-0" : "p-4",
      )}
      style={{ display: "none", opacity: 0, transition: "opacity 300ms" }}
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 dark:bg-black/80"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          "relative w-full border-[3px] border-border bg-card font-mono",
          width !== "full" && "shadow-[6px_6px_0_hsl(var(--border))]",
          widthMap[width],
          className,
        )}
        style={{
          opacity: 0,
          transform: "translateY(16px) scale(0.95)",
          transition: "opacity 300ms, transform 300ms",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b-[3px] border-border px-5 py-3.5">
          <div>
            <h2 className="text-[13px] font-black tracking-[0.12em] text-foreground leading-none">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-[9px] tracking-widest text-foreground/40">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 flex h-7 w-7 flex-shrink-0 items-center justify-center border-[2px] border-border text-foreground hover:bg-foreground hover:text-background transition-colors duration-100"
            aria-label="Tutup"
          >
            <X size={13} />
          </button>
        </div>

        {/* Body */}
        <div
          className="px-5 py-4 overflow-y-auto"
          style={{
            maxHeight:
              width === "full" ? "calc(100vh - 60px)" : "calc(85vh - 60px)",
          }}
        >
          {children}
        </div>
      </div>
    </div>,
    portal,
  );
};

export default ChildModalWrapper;
