import React from "react";
import ThemeToggle from "../../components/theme/theme-toggle";
import Link from "next/link";
import Image from "next/image";

export default function LandingPageNavBar() {
  return (
    <nav className=" absolute z-10  bg-transparent flex w-full items-center justify-between border-t  border-neutral-200 px-4 py-4 dark:border-neutral-800">
      <Link className="  flex items-center gap-2 cursor-pointer" href="/">
        <Image
          src="/images/wildcat2.png"
          width={100}
          height={100}
          alt="AVOC Logo"
          className="size-10 rounded-full object-cover ring-violet-400/40 transition duration-300 ease-out hover:-translate-y-0.5 hover:ring-violet-300/60 dark:brightness-175 contrast-110"
        />
        <h1 className="text-base font-bold md:text-2xl">AVOC Home</h1>
      </Link>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link href="/login">
          <button
            type="button"
            className="w-24 transform rounded-lg bg-black px-6 py-2 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 md:w-32 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Login
          </button>
        </Link>
      </div>
    </nav>
  );
}
