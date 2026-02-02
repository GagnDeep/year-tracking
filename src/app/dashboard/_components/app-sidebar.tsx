"use client"

import * as React from "react"
import { Calendar, LayoutDashboard, Settings, CalendarDays, LogOut, User as UserIcon } from "lucide-react"
import { format } from "date-fns"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"

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
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [todayPath, setTodayPath] = React.useState("");

  React.useEffect(() => {
    setTodayPath(`/dashboard/day/${format(new Date(), "yyyy-MM-dd")}`);
  }, []);

  const items = [
    {
      title: "Today",
      url: todayPath || "#",
      icon: LayoutDashboard,
      isActive: (path: string) => path.startsWith("/dashboard/day/")
    },
    {
      title: "Year Grid",
      url: "/dashboard",
      icon: Calendar,
      isActive: (path: string) => path === "/dashboard"
    },
    {
      title: "Month View",
      url: "/dashboard/month",
      icon: CalendarDays,
      isActive: (path: string) => path === "/dashboard/month"
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
      isActive: (path: string) => path === "/dashboard/settings"
    },
  ]

  const userInitials = React.useMemo(() => {
    if (!session?.user?.name) return "U";
    return session.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [session?.user?.name]);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="h-16 flex items-center justify-center px-4 border-b border-sidebar-border/50">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight w-full overflow-hidden group-data-[collapsible=icon]:justify-center">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="truncate group-data-[collapsible=icon]:hidden">Chronos</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider group-data-[collapsible=icon]:hidden">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                 const active = item.isActive(pathname);
                 return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    tooltip={item.title}
                    className="h-10 transition-all duration-200"
                  >
                    <a href={item.url}>
                      <item.icon className={active ? "text-primary" : "text-muted-foreground"} />
                      <span className={active ? "font-medium text-foreground" : "text-muted-foreground"}>
                        {item.title}
                      </span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )})}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-sidebar-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full justify-start"
                >
                  <Avatar className="h-8 w-8 rounded-lg border border-border">
                    <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                    <AvatarFallback className="rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
                        {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden ml-2">
                    <span className="truncate font-semibold">{session?.user?.name || "User"}</span>
                    <span className="truncate text-xs text-muted-foreground">{session?.user?.email || "Signed in"}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg bg-popover text-popover-foreground border-border"
                side="right"
                align="end"
                sideOffset={4}
              >
                 <DropdownMenuLabel>My Account</DropdownMenuLabel>
                 <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
