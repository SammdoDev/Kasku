"use client";

import { cn } from "@/lib/utils";
import { Delete } from "lucide-react";

interface NumPadProps {
  onPress: (key: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  loading?: boolean;
}

interface NumKeyProps {
  label: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

const NumKey = ({ label, onClick, className, disabled }: NumKeyProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
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

const NumPad = ({ onPress, onBackspace, onSubmit, loading }: NumPadProps) => {
  return (
    <div className="grid grid-cols-4 divide-x-2 divide-y-2 divide-black border-t-0">
      {/* Row 1 */}
      <NumKey
        label="1"
        onClick={() => onPress("1")}
        className="bg-white hover:bg-[#f5f0e8]"
      />
      <NumKey
        label="2"
        onClick={() => onPress("2")}
        className="bg-white hover:bg-[#f5f0e8]"
      />
      <NumKey
        label="3"
        onClick={() => onPress("3")}
        className="bg-white hover:bg-[#f5f0e8]"
      />
      <NumKey
        label={
          <span className="text-[10px] font-black tracking-[0.1em]">HARI</span>
        }
        onClick={() => onPress("day")}
        className="bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12]"
      />

      {/* Row 2 */}
      <NumKey
        label="4"
        onClick={() => onPress("4")}
        className="bg-white hover:bg-[#f5f0e8]"
      />
      <NumKey
        label="5"
        onClick={() => onPress("5")}
        className="bg-white hover:bg-[#f5f0e8]"
      />
      <NumKey
        label="6"
        onClick={() => onPress("6")}
        className="bg-white hover:bg-[#f5f0e8]"
      />
      <NumKey
        label={
          <span className="text-[10px] font-black tracking-[0.1em]">AKUN</span>
        }
        onClick={() => onPress("acc")}
        className="bg-[#ffedd5] hover:bg-[#fed7aa] text-[#7c2d12]"
      />

      {/* Row 3 */}
      <NumKey
        label="7"
        onClick={() => onPress("7")}
        className="bg-white hover:bg-[#f5f0e8]"
      />
      <NumKey
        label="8"
        onClick={() => onPress("8")}
        className="bg-white hover:bg-[#f5f0e8]"
      />
      <NumKey
        label="9"
        onClick={() => onPress("9")}
        className="bg-white hover:bg-[#f5f0e8]"
      />
      <NumKey
        label={
          <span className="text-[10px] font-black tracking-[0.1em]">KARTU</span>
        }
        onClick={() => onPress("bank")}
        className="bg-[#dbeafe] hover:bg-[#bfdbfe] text-[#1e3a8a]"
      />

      {/* Row 4 */}
      <NumKey
        label="0"
        onClick={() => onPress("0")}
        className="bg-white hover:bg-[#f5f0e8]"
      />
      <NumKey
        label={<span className="text-[20px] font-light">,</span>}
        onClick={() => onPress(".")}
        className="bg-white hover:bg-[#f5f0e8]"
      />
      <NumKey
        label={<Delete size={20} strokeWidth={2} />}
        onClick={onBackspace}
        className="bg-white hover:bg-[#f5f0e8]"
      />
      <NumKey
        label={
          loading ? (
            <span className="text-[11px] tracking-widest animate-pulse">
              ···
            </span>
          ) : (
            <span className="text-[18px]">✓</span>
          )
        }
        onClick={onSubmit}
        disabled={loading}
        className="bg-[#1a1a1a] text-white hover:bg-[#333]"
      />
    </div>
  );
};

export default NumPad;
