"use client"

import { Calendar } from "@/components/ui/calendar"
import { Calendar as CalendarIcon } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/(dashboard)/components/sidebar/sidebar"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import React from "react"

export function DatePicker() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Parse date from URL slug (format: /calendar/2025-11-10)
  const selectedDate = React.useMemo(() => {
    const slug = params?.slug as string | undefined
    if (!slug) return new Date()
    
    const [y, m, d] = slug.split("-").map(Number)
    if (!y || !m || !d) return new Date()
    return new Date(y, m - 1, d)
  }, [params])

  // Handle date selection with URL navigation
  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const yyyy = date.getFullYear()
      const mm = String(date.getMonth() + 1).padStart(2, "0")
      const dd = String(date.getDate()).padStart(2, "0")
      const params = new URLSearchParams(searchParams.toString())
      const queryString = params.toString()
      const nextPath = `/calendar/${yyyy}-${mm}-${dd}${
        queryString ? `?${queryString}` : ""
      }`
      router.push(nextPath)
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Calendar</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Calendar">
              <CalendarIcon />
              <span>Calendar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="group-data-[collapsible=icon]:hidden">
          <Calendar 
            selected={selectedDate}
            onSelect={handleSelect}
            className="w-full [&_[role=gridcell]]:w-[33px] [&_[role=gridcell]]:h-[33px] [&_table]:w-full [&_thead]:border-b [&_thead]:border-sidebar-border [&_tbody]:space-y-1" 
          />
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
