"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageLeftRightWrapperProps {
  leftComponent: ReactNode;
  rightComponent?: ReactNode;
  className?: string;
  leftClassName?: string;
  rightClassName?: string;
}

const PageLeftRightWrapper = ({
  leftComponent,
  rightComponent,
  className,
  leftClassName,
  rightClassName,
}: PageLeftRightWrapperProps) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4",
        className,
      )}
    >
      <div className={cn("w-full sm:flex-1", leftClassName)}>
        {leftComponent}
      </div>

      {rightComponent && (
        <div className={cn("w-full sm:w-auto sm:shrink-0", rightClassName)}>
          {rightComponent}
        </div>
      )}
    </div>
  );
};

export default PageLeftRightWrapper;
