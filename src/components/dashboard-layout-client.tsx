"use client";

import {
  Calendar,
  LayoutDashboard,
  Settings,
  Target,
  BarChart,
  LogOut,
  Book,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommandMenu } from "@/components/command-menu";
import { useGlobalShortcuts } from "@/hooks/use-global-shortcuts";
import { Eye, EyeOff, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "usehooks-ts";
import { ShortcutsHelp } from "@/components/shortcuts-help";
import { useState } from "react";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  user: {
    id: string;
    name?: string | null;
    image?: string | null;
    email?: string | null;
  };
}

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Journal",
    url: "/dashboard/journal",
    icon: Book,
  },
  {
    title: "Goals",
    url: "/dashboard/goals",
    icon: Target,
  },
  {
    title: "Calendar",
    url: "/dashboard/calendar",
    icon: Calendar,
  },
  {
    title: "Stats",
    url: "/dashboard/stats",
    icon: BarChart,
  },
];

export function DashboardLayoutClient({
  children,
  user,
}: DashboardLayoutClientProps) {
  const pathname = usePathname();
  const [focusMode, setFocusMode] = useLocalStorage("chronos-focus-mode", false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  useGlobalShortcuts();

  return (
    <SidebarProvider>
      <CommandMenu />
      <ShortcutsHelp open={showShortcuts} onOpenChange={setShowShortcuts} />
      {!focusMode && (
      <Sidebar collapsible="icon">
        <SidebarHeader className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2 font-bold text-xl">
             <span>Chronos</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user.image || ""} alt={user.name || ""} />
                      <AvatarFallback className="rounded-lg">
                        {user.name?.slice(0, 2).toUpperCase() || "CN"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user.name}
                      </span>
                      <span className="truncate text-xs">{user.email}</span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setFocusMode(!focusMode)} tooltip="Toggle Focus Mode">
                    {focusMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span>Focus Mode</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      )}
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
           {!focusMode && <SidebarTrigger className="-ml-1" />}
           <div className="ml-auto flex items-center gap-2">
             <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowShortcuts(true)}
                title="Keyboard Shortcuts"
             >
                <HelpCircle className="h-4 w-4" />
             </Button>
             <Button
                variant="ghost"
                size="icon"
                onClick={() => setFocusMode(!focusMode)}
                title={focusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
              >
                {focusMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
           </div>
        </header>
        <div className={cn("flex flex-1 flex-col gap-4 p-4 pt-0", focusMode && "mx-auto w-full max-w-4xl pt-4")}>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
