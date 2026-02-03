"use client";

import { useChronos } from "@/hooks/use-chronos";
import { Progress } from "@/components/ui/progress";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLayout } from "@/context/layout-context";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const { yearProgress, formattedString, loading } = useChronos();
  const { focusMode, setFocusMode } = useLayout();
  const router = useRouter();
  const pathname = usePathname();

  const currentTab = pathname?.includes("/dashboard/month") ? "month" : "year";

  const handleTabChange = (val: string) => {
      if (val === "year") router.push("/dashboard");
      if (val === "month") router.push("/dashboard/month");
  };

  return (
    <header className={cn(
        "sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-background/80 p-4 backdrop-blur-md transition-all duration-500",
        focusMode && "border-transparent bg-transparent py-8 pointer-events-none"
    )}>
      <div className={cn(
          "transition-all duration-300 overflow-hidden pointer-events-auto",
          focusMode ? "w-0 opacity-0" : "w-auto opacity-100"
      )}>
        <SidebarTrigger className="-ml-1" />
      </div>

      <div className={cn(
          "flex flex-1 flex-col gap-1 transition-all duration-500 pointer-events-auto",
          focusMode && "max-w-2xl mx-auto text-center items-center"
      )}>
        <div className="flex items-center justify-between text-sm w-full">
          <span className={cn(
              "font-medium text-muted-foreground transition-all duration-500",
              focusMode && "text-lg opacity-80"
          )}>Year Progress</span>
          <span className={cn(
              "font-mono text-muted-foreground transition-all duration-500 tabular-nums tracking-tight",
              focusMode && "text-5xl text-foreground font-bold"
          )}>{loading ? "..." : `${yearProgress}%`}</span>
        </div>
        <Progress value={loading ? 0 : parseFloat(yearProgress)} className={cn(
            "h-2 bg-secondary transition-all duration-500",
            focusMode && "h-1 opacity-50 w-full"
        )} />
      </div>

      <div className={cn(
          "flex items-center gap-4 transition-all duration-300 pointer-events-auto",
          focusMode ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
      )}>
            <Tabs value={currentTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-2 bg-secondary text-secondary-foreground">
                    <TabsTrigger value="year">Year</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="hidden text-sm text-muted-foreground xl:block tabular-nums font-mono">
                {formattedString}
            </div>
      </div>

      <div className={cn("flex items-center gap-2 pl-2 border-l border-border pointer-events-auto", focusMode && "border-transparent pl-0 absolute right-4 top-8")}>
          <Label htmlFor="focus-mode" className={cn(
              "text-xs text-muted-foreground transition-opacity cursor-pointer",
              focusMode && "opacity-50 hover:opacity-100"
          )}>Focus</Label>
          <Switch id="focus-mode" checked={focusMode} onCheckedChange={setFocusMode} />
      </div>
    </header>
  );
}
