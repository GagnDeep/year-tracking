"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/app-sidebar";
import { Header } from "./_components/header";
import { useLayout } from "@/context/layout-context";
import { Screensaver } from "@/components/layout/screensaver";
import { CommandMenu } from "@/components/layout/command-menu";
import { cn } from "@/lib/utils";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { focusMode } = useLayout();

  return (
    <SidebarProvider defaultOpen={!focusMode}>
       <Screensaver />
       <CommandMenu />
       <div className="flex min-h-screen w-full bg-neutral-950 text-white relative">
         <div className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden",
            focusMode ? "w-0 opacity-0" : "w-auto opacity-100"
         )}>
             <AppSidebar />
         </div>

         <div className="flex flex-col flex-1 transition-all duration-500 ease-in-out min-w-0">
           <Header />
           <main className={cn(
               "flex-1 p-4 overflow-auto transition-all duration-500",
               focusMode && "container mx-auto max-w-5xl pt-12"
           )}>
             {children}
           </main>
         </div>
       </div>
    </SidebarProvider>
  );
}
