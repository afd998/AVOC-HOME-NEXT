'use client';

import Link from "next/link";
import { getTodayPath } from "@/utils/datePaths";

export function LogoButton() {
  return (
    <Link href={`${getTodayPath()}`}>
      <button
        className="h-12 w-12 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 p-4 group-data-[collapsible=icon]:p-2 rounded-full transition-all duration-200 flex flex-col items-center justify-center backdrop-blur-sm border border-purple-400/50 shadow-lg hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] hover:scale-105 active:scale-95 bg-primary"
        aria-label="Go to home"
      >
        <span className="text-sm group-data-[collapsible=icon]:text-[10px] text-white text-center leading-tight font-medium">
          AVOC
        </span>
      </button>
    </Link>
  )
}
