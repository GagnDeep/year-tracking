"use client";

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { LayoutProvider, useLayout } from "@/context/LayoutContext"
import { GlobalShortcuts } from "@/components/GlobalShortcuts"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { focusMode, toggleFocusMode } = useLayout();

  return (
    <SidebarProvider defaultOpen={!focusMode}>
      {!focusMode && <AppSidebar />}
      <SidebarInset className={cn("transition-all duration-300", focusMode && "m-0 rounded-none")}>
          <header className={cn("flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-opacity", focusMode && "opacity-0 hover:opacity-100")}>
              {!focusMode && (
                <>
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 h-4" />
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href="/dashboard">
                          Dashboard
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        <BreadcrumbPage>Overview</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </>
              )}
              <div className="ml-auto flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => toggleFocusMode()} title="Toggle Focus Mode">
                      {focusMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
              </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 max-w-6xl mx-auto w-full">
              {children}
          </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LayoutProvider>
      <GlobalShortcuts />
      <DashboardContent>{children}</DashboardContent>
    </LayoutProvider>
  )
}
