import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-bold uppercase tracking-wide transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border-2 border-border active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
  {
    variants: {
      variant: {
        default:
          "bg-foreground text-background shadow-brutal-lg hover:shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-brutal-lg hover:shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px]",
        outline:
          "bg-card text-foreground shadow-brutal-lg hover:shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px]",
        secondary:
          "[background:var(--accent)] [color:var(--accent-fg)] shadow-brutal-lg hover:shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px]",
        ghost:
          "border-transparent shadow-none hover:bg-foreground/10 text-foreground",
        link: "border-transparent shadow-none underline underline-offset-4 text-foreground",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      label,
      leftIcon,
      rightIcon,
      loading,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && leftIcon}
        {label ?? children}
        {!loading && rightIcon}
      </Comp>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
