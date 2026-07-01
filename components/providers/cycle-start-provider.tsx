"use client";

import { useCycleStart } from "@/lib/helper/use-cycle-start";

export default function CycleStartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useCycleStart();
  return <>{children}</>;
}
