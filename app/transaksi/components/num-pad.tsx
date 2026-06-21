"use client";

import { cn } from "@/lib/utils";
import { Delete } from "lucide-react";

interface NumPadProps {
  onPress: (key: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  loading?: boolean;
  walletName?: string;
  date: string;
  onDateClick: () => void;
  onWalletClick: () => void;
}

interface NumKeyProps {
  label: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const NumKey = ({
  label,
  onClick,
  className,
  disabled,
  style,
}: NumKeyProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    style={style}
    className={cn(
      "flex items-center justify-center select-none",
      "text-[22px] font-black font-mono",
      "py-[18px] transition-colors duration-75",
      "active:brightness-90",
      "disabled:opacity-40 disabled:cursor-not-allowed",
      className,
    )}
  >
    {label}
  </button>
);

const NumPad = ({
  onPress,
  onBackspace,
  onSubmit,
  loading,
  walletName,
  date,
  onDateClick,
  onWalletClick,
}: NumPadProps) => {
  const today = new Date().toISOString().split("T")[0];
  const isToday = date === today;

  const formatShort = (d: string) => {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y.slice(2)}`;
  };

  return (
    <div className="grid grid-cols-4 divide-x-2 divide-y-2 divide-border border-l-2 border-border">
      {/* Row 1 */}
      <NumKey
        label="1"
        onClick={() => onPress("1")}
        className="bg-card text-foreground hover:bg-foreground/5"
      />
      <NumKey
        label="2"
        onClick={() => onPress("2")}
        className="bg-card text-foreground hover:bg-foreground/5"
      />
      <NumKey
        label="3"
        onClick={() => onPress("3")}
        className="bg-card text-foreground hover:bg-foreground/5"
      />
      {/* HARI */}
      <NumKey
        label={
          <div className="flex flex-col items-center gap-0.5">
            <span
              className="text-[10px] font-black tracking-[0.1em]"
              style={{ color: "var(--brand-accent-fg)" }}
            >
              HARI
            </span>
            <span
              className="text-[8px] font-bold opacity-60"
              style={{ color: "var(--brand-accent-fg)" }}
            >
              {isToday ? "hari ini" : formatShort(date)}
            </span>
          </div>
        }
        onClick={onDateClick}
        className="hover:brightness-95"
        style={{ background: "var(--brand-accent)" } as React.CSSProperties}
      />

      {/* Row 2 */}
      <NumKey
        label="4"
        onClick={() => onPress("4")}
        className="bg-card text-foreground hover:bg-foreground/5"
      />
      <NumKey
        label="5"
        onClick={() => onPress("5")}
        className="bg-card text-foreground hover:bg-foreground/5"
      />
      <NumKey
        label="6"
        onClick={() => onPress("6")}
        className="bg-card text-foreground hover:bg-foreground/5"
      />
      {/* AKUN */}
      <NumKey
        label={
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] font-black tracking-[0.1em] text-foreground">
              AKUN
            </span>
            {walletName && (
              <span className="text-[7px] font-bold tracking-wide text-foreground/50 max-w-[48px] truncate">
                {walletName}
              </span>
            )}
          </div>
        }
        onClick={onWalletClick}
        className="bg-foreground/[0.06] hover:bg-foreground/10 text-foreground"
      />

      {/* Row 3 */}
      <NumKey
        label="7"
        onClick={() => onPress("7")}
        className="bg-card text-foreground hover:bg-foreground/5"
      />
      <NumKey
        label="8"
        onClick={() => onPress("8")}
        className="bg-card text-foreground hover:bg-foreground/5"
      />
      <NumKey
        label="9"
        onClick={() => onPress("9")}
        className="bg-card text-foreground hover:bg-foreground/5"
      />
      {/* DOMPET */}
      <NumKey
        label={
          <span className="text-[10px] font-black tracking-[0.1em] text-foreground">
            DOMPET
          </span>
        }
        onClick={onWalletClick}
        className="bg-foreground/[0.06] hover:bg-foreground/10"
      />

      {/* Row 4 */}
      <NumKey
        label="0"
        onClick={() => onPress("0")}
        className="bg-card text-foreground hover:bg-foreground/5"
      />
      <NumKey
        label={
          <span className="text-[20px] font-light text-foreground">,</span>
        }
        onClick={() => onPress(".")}
        className="bg-card hover:bg-foreground/5"
      />
      <NumKey
        label={<Delete size={20} strokeWidth={2} className="text-foreground" />}
        onClick={onBackspace}
        className="bg-card hover:bg-foreground/5"
      />
      {/* SUBMIT */}
      <NumKey
        label={
          loading ? (
            <span className="text-[11px] tracking-widest animate-pulse text-background">
              ···
            </span>
          ) : (
            <span className="text-[18px] text-background">✓</span>
          )
        }
        onClick={onSubmit}
        disabled={loading}
        className="bg-foreground hover:opacity-90"
      />
    </div>
  );
};

export default NumPad;
