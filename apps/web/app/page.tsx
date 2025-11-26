import React from "react";
import HeroSectionOne from "@/app/components/hero-section-demo-1";
import LandingPageNavBar from "./components/LandingPageNavBar";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full  flex flex-col">
      <LandingPageNavBar />
      <div className="w-full mt-24">
        <HeroSectionOne />
      </div>
    </div>
  );
}
