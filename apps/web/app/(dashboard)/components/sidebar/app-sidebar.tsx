import { Suspense } from "react";

import { LayoutDashboard } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "./sidebar";

import {
  Item,
  ItemContent,
  ItemTitle,
  ItemActions,
} from "@/components/ui/item"; 
import NotificationsModal from "@/features/notifications/NotificationsModal";
import FilterRoomsModal from "@/app/(dashboard)/calendar/[slug]/components/FilterRoomsModal";
import { Calendar } from "@/components/ui/calendar"; 
import Link from "next/link";
// Navigation data for the sidebar
import CalendarButton from "./calendar-button";
import SliderServer from "./sliders-server";
import ThemeToggle from "@/components/theme/theme-toggle";
import { LogoButton } from "./logo-button";
import { Filters } from "./filters";
import { CalendarOnly } from "./calendar-only"; 
import { FacultyIcon } from "./faculty-icon";
import { EventSeriesIcon } from "./event-series-icon";
import AcademicCalendarInfo from "@/app/(dashboard)/calendar/[slug]/components/AcademicCalendarInfo";

const RoomIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M12 2C8.14 2 5 5.06 5 8.83c0 4.77 4.65 9.65 6.44 11.3.31.28.81.28 1.12 0C14.35 18.48 19 13.6 19 8.83 19 5.06 15.86 2 12 2Zm0 8.75a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Z" />
  </svg>
);
export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex flex-col items-center justify-center py-1 gap-1">
          <Suspense  fallback={null}> 
          
            <LogoButton />
          </Suspense>  

          {/* Calendar icon - only visible when collapsed */}
          <CalendarButton />
          {/* Faculty icon - only visible when collapsed */}
          <Link href="/faculty">
            <button
              className="group-data-[collapsible=icon]:flex hidden w-full h-8 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground flex items-center justify-center"
              aria-label="Faculty Directory"
            >
              <FacultyIcon className="h-4 w-4" />
            </button>
          </Link>
          {/* Session Assignments icon - only visible when collapsed */}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Date Picker */}
        <SidebarGroup className="px-0 group-data-[collapsible=icon]:hidden py-0">
          <SidebarGroupContent className="">
            <div className="w-full flex justify-center">
              <Suspense fallback={null}>
                <Calendar
                  mode="single"
                  useUrlDate={true}
                  useUrlNavigation={true}
                  className="rounded-lg  ![--cell-size:--spacing(8)] md:![--cell-size:--spacing(8)]"
                  buttonVariant="ghost"
                />
              </Suspense>
            </div>

            <div className="mt-2 flex justify-center gap-2">
              <AcademicCalendarInfo />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

       <CalendarOnly> 
         
            <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />

            {/* View Controls */}
            <SidebarGroup className="px-0 group-data-[collapsible=icon]:hidden">
              <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                View
              </SidebarGroupLabel>
              <SidebarGroupContent className="px-3">
                <div className="space-y-4">
                  {/* Filter Rooms Button */}
                  <div className="space-y-2">
                    <SidebarMenuButton>
                      <Suspense fallback={null}>
                        <Filters />
                      </Suspense>
                    </SidebarMenuButton>
                  </div>
                  {/* <Suspense fallback={null}>
                    <SliderServer />
                  </Suspense> */}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />
            </CalendarOnly>

        {/* Platform */}
        <SidebarGroup className="px-0 group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Platform
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-3">
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/faculty">
                  <SidebarMenuButton className="w-full justify-start">
                    <FacultyIcon className="h-4 w-4" />
                    <span>Faculty Directory</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/series">
                  <SidebarMenuButton className="w-full justify-start">
                    <EventSeriesIcon className="h-4 w-4" />
                    <span>Event Series</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/venues">
                  <SidebarMenuButton className="w-full justify-start">
                    <RoomIcon className="h-4 w-4" />
                    <span>Venues</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />

        {/* Manager */}
        <SidebarGroup className="px-0 group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Manager
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-3">
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/manager-dashboard">
                  <SidebarMenuButton className="w-full justify-start">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Manager Dashboard</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />

        {/* Quick Actions */}
        <SidebarGroup className="px-0 group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Quick Actions
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-3">
            <SidebarMenu>
              <SidebarMenuItem>{/* <NotificationsModal /> */}</SidebarMenuItem>
              <SidebarMenuItem>
                <Item>
                  <ItemContent>
                    <ItemTitle>Theme</ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    <ThemeToggle />
                  </ItemActions>
                </Item>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
