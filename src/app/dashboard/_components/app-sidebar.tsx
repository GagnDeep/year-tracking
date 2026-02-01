"use client"

import * as React from "react"
import { Calendar, LayoutDashboard, Settings, CalendarDays } from "lucide-react"
import { format } from "date-fns"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const today = React.useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  const items = [
    {
      title: "Today",
      url: `/dashboard/day/${today}`,
      icon: LayoutDashboard,
    },
    {
      title: "Year",
      url: "/dashboard",
      icon: Calendar,
    },
    {
      title: "Month",
      url: "#",
      icon: CalendarDays,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h2 className="text-xl font-bold tracking-tight">Chronos</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
