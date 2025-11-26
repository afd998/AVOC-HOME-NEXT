
import { getFacultyPage } from "@/lib/data/faculty";
import React from "react";

export default async function EventsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              Search Events
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Browse events wil full text search.
            </p>
          </header>
        </div>
      </div>
    </div>
  );
}
