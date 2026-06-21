"use client";

import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";

type SeparatorProps = React.ComponentProps<typeof SeparatorPrimitive.Root>;

const Separator = ({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: SeparatorProps) => (
  <SeparatorPrimitive.Root
    decorative={decorative}
    orientation={orientation}
    className={cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-0.5 w-full" : "h-full w-[2px]",
      className,
    )}
    {...props}
  />
);

Separator.displayName = "Separator";

export { Separator };