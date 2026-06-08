"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showPasswordToggle?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, showPasswordToggle = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
      <div className="relative w-full">
        <input
          type={inputType}
          className={cn(
            // height 34px → sejajar month-nav & tombol TAMBAH
            "flex h-[34px] w-full border-2 border-[#1a1a1a] bg-white px-3 text-[11px] font-mono font-bold tracking-wide placeholder:text-[#1a1a1a]/30",
            "shadow-[3px_3px_0_#1a1a1a] focus:outline-none focus:shadow-[1px_1px_0_#1a1a1a] focus:translate-x-0.5 focus:translate-y-0.5",
            "transition-all duration-100 disabled:cursor-not-allowed disabled:opacity-50",
            isPassword && showPasswordToggle && "pr-10",
            className,
          )}
          ref={ref}
          {...props}
        />
        {isPassword && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
