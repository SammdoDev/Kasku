"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageLeftRightWrapperProps {
  leftComponent: ReactNode;
  rightComponent?: ReactNode;
  className?: string;
  leftClassName?: string;
  rightClassName?: string;
  hideRightOnMobile?: boolean;
}

const PageLeftRightWrapper = ({
  leftComponent,
  rightComponent,
  className,
  leftClassName,
  rightClassName,
  hideRightOnMobile = true,
}: PageLeftRightWrapperProps) => {
  return (
    <div
      className={cn("h-screen overflow-hidden grid lg:grid-cols-2", className)}
    >
      <div className={cn("h-full overflow-y-auto p-6 md:p-10", leftClassName)}>
        {leftComponent}
      </div>

      {rightComponent && (
        <div
          className={cn(
            hideRightOnMobile ? "hidden lg:flex" : "flex",
            "h-full overflow-hidden relative",
            rightClassName,
          )}
        >
          {rightComponent}
        </div>
      )}
    </div>
  );
};

export default PageLeftRightWrapper;
