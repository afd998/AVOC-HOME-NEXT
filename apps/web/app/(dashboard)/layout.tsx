import { AppSidebar } from "@/app/(dashboard)/components/sidebar/app-sidebar";
import { SidebarInset } from "@/app/(dashboard)/components/sidebar/sidebar";
import { SidebarTrigger } from "@/app/(dashboard)/components/sidebar/sidebar";
import React from "react";
import { SidebarShell } from "@/app/(dashboard)/components/sidebar/sidebar-shell";
import HeaderBreadcrumb from "@/app/(dashboard)/components/sidebar/header-breadcrumb";
import { ProfilePopover } from "@/app/(dashboard)/components/header/profile-popover";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { CalendarFocusToggle } from "@/app/(dashboard)/components/sidebar/calendar-focus-toggle";
import { DashboardSplitShell } from "@/app/(dashboard)/components/dashboard-split-shell";
import { Suspense } from "react";
import Image from "next/image";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
             <React.Suspense fallback={null}>
              <CalendarFocusToggle className="h-8 w-8" />
              </React.Suspense>
              <React.Suspense>
                <HeaderBreadcrumb />
              </React.Suspense>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2 px-4">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-8 border border-border cursor-pointer hover:bg-accent/80 dark:hover:bg-accent/30"
                aria-label="Magnum OS"
              >
                <a href="http://10.26.49.246/" target="_blank" rel="noopener noreferrer">
                  <Image
                    src="/images/magnum-os.svg"
                    alt="Magnum OS"
                    width={120}
                    height={16}
                    className="h-4 dark:invert"
                  />
                </a>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </Button>
              <React.Suspense fallback={null}>
                <ProfilePopover />
              </React.Suspense>
            </div>
          </header>
          <main className="flex-1 w-full p-2 min-h-0 overflow-hidden">
            <DashboardSplitShell>
            <Suspense> {children} </Suspense>
            </DashboardSplitShell>
          </main>
        </SidebarInset>
      </SidebarShell>
    </div>
  );
}
