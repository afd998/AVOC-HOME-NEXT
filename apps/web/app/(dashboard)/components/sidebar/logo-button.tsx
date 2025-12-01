'use client';

import Image from "next/image";
import Link from "next/link";
import { getTodayPath } from "@/utils/datePaths";

export function LogoButton() {
  return (
    <Link href={`${getTodayPath()}`}>
      <button
        className="group relative flex h-12 items-center gap-2 rounded-md px-2 transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:px-1"
        aria-label="Go to home"
      >
        <Image
          src="/images/wildcat2.png"
          alt="Home"
          width={40}
          height={40}
          className="h-10 w-10 object-contain group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6"
          priority
        />
        <span className="text-sm font-semibold text-foreground group-data-[collapsible=icon]:hidden">
          AVOC Home
        </span>
      </button>
    </Link>
  );
}
