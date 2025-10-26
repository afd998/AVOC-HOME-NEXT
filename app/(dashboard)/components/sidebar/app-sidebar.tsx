 import { Suspense } from "react";

import { Users, Calendar as CalendarIcon } from "lucide-react";

import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import QuarterCount from "@/features/QuarterCount/QuarterCount";
import { Calendar } from "@/components/ui/calendar"; 
import Link from "next/link";
// Navigation data for the sidebar
import CalendarButton from "./calendar-button";
import SliderServer from "./sliders-server";
import ThemeToggle from "@/components/theme/theme-toggle";
import { LogoButton } from "./logo-button";
import { Filters } from "./filters";
import { CalendarOnly } from "./calendar-only"; 
export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex flex-col items-center justify-center py-2 gap-2">
          <Suspense  fallback={null}> 
          
            <LogoButton />
          </Suspense>  

          {/* Calendar icon - only visible when collapsed */}
          <CalendarButton />
          {/* Faculty icon - only visible when collapsed */}
          <Link href="/faculty">
            <button
              className="group-data-[collapsible=icon]:flex hidden w-full h-8 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground flex items-center justify-center"
              aria-label="Faculty List"
            >
              <Users className="h-4 w-4" />
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

            {/* Quarter Count and Academic Calendar Info */}
            <div className="mt-2 flex justify-center gap-2">
              {/* <QuarterCount />
                  <AcademicCalendarInfo /> */}
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
                    <Users className="h-4 w-4" />
                    <span>Faculty</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/events">
                  <SidebarMenuButton className="w-full justify-start">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Events</span>
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
            Quick Actions!!!!!!zz
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
      <SidebarFooter>
        {/* <Suspense fallback={null}>
          <NavUser />
        </Suspense> */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
