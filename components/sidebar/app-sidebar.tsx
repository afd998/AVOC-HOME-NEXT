"use server"
import * as React from "react";
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
import { Badge } from "../ui/badge";
import { Item, ItemContent, ItemTitle, ItemActions } from "../ui/item";
import NotificationsModal from "../../features/notifications/NotificationsModal";
import FilterRoomsModal from "../../app/(dashboard)/calendar/Schedule/components/FilterRoomsModal";
import QuarterCount from "../../features/QuarterCount/QuarterCount";
import AcademicCalendarInfo from "../../app/(dashboard)/calendar/Schedule/components/AcademicCalendarInfo";
import { Calendar } from "../ui/calendar";
import Link from "next/link";
import { getTodayPath } from "@/utils/datePaths";
// Navigation data for the sidebar
import CalendarButton from "./calendar-button";
import SliderServer from "./sliders-server";
import ThemeToggle from "../theme/theme-toggle";
import getMyProfile from "@/lib/data/profile";
import FilterDialogClient from "./filter-dialog-client";

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { profile: profile, email: email } = await getMyProfile();
  return (
    <Sidebar collapsible="icon" {...props}>
          <SidebarHeader>
            <div className="flex flex-col items-center justify-center py-2 gap-2">
              <Link href={`${getTodayPath()}`}>
                <button
                  className="h-12 w-12 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 p-4 group-data-[collapsible=icon]:p-2 rounded-full transition-all duration-200 flex flex-col items-center justify-center backdrop-blur-sm border border-purple-400/50 shadow-lg hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] hover:scale-105 active:scale-95 bg-primary"
                  aria-label="Go to home"
                >
                  <span className="text-sm group-data-[collapsible=icon]:text-[10px] text-white text-center leading-tight font-medium">
                    AVOC
                  </span>
                  <span className="text-[10px] group-data-[collapsible=icon]:text-[6px] text-white text-center leading-tight font-medium">
                    HOME
                  </span>
                </button>
              </Link>
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
                  <Calendar
                    mode="single"
                    useUrlDate={true}
                    useUrlNavigation={true}
                    className="rounded-lg  ![--cell-size:--spacing(8)] md:![--cell-size:--spacing(8)]"
                    buttonVariant="ghost"
                  />
                </div>

                {/* Quarter Count and Academic Calendar Info */}
                <div className="mt-2 flex justify-center gap-2">
                  {/* <QuarterCount />
                  <AcademicCalendarInfo /> */}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>

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
                      <FilterDialogClient profile={profile}>
                        <FilterRoomsModal profile={profile} />
                      </FilterDialogClient>
                    </SidebarMenuButton>
                  </div>

                  <SliderServer />
                </div>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />

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
                        <span>Faculty List</span>
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
                  <SidebarMenuItem>
                    {/* <NotificationsModal /> */}
                  </SidebarMenuItem>
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
        <NavUser profile={profile} email={email} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
