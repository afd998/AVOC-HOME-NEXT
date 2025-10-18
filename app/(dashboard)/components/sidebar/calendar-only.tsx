
"use client";

import { usePathname } from "next/navigation";

export function CalendarOnly({ children }: { children: React.ReactNode }) {
  return usePathname().startsWith("/calendar") ? <>{children}</> : null;
}