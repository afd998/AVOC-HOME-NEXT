import { AppSidebar } from "@/app/(dashboard)/components/sidebar/app-sidebar";
import { SidebarInset } from "@/app/(dashboard)/components/sidebar/sidebar";
import { SidebarTrigger } from "@/app/(dashboard)/components/sidebar/sidebar";
import React, { Suspense } from "react";
import { SidebarShell } from "@/app/(dashboard)/components/sidebar/sidebar-shell";
import HeaderBreadcrumb from "@/app/(dashboard)/components/sidebar/header-breadcrumb";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  "use cache";
  return (
    <div>
      <SidebarShell collapsible="icon" className="h-svh">
        <React.Suspense fallback={null}>
          <AppSidebar />
        </React.Suspense>
        <SidebarInset className="min-h-0 overflow-hidden">
          <header className="flex h-12 shrink-0 items-center transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-sidebar-border bg-background">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1 h-8 w-8" />
              <React.Suspense>
                <HeaderBreadcrumb />
              </React.Suspense>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2 px-4">
              {/* Placeholder for header actions */}
            </div>
          </header>
          <main className="flex-1 w-full p-2 overflow-y-auto min-h-0">
            <Suspense fallback={null}>{children}</Suspense>
          </main>
        </SidebarInset>
      </SidebarShell>
    </div>
  );
}
