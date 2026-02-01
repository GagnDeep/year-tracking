"use client";

import { useChronos } from "@/hooks/use-chronos";
import { Progress } from "@/components/ui/progress";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        "sticky top-0 z-10 flex items-center gap-4 border-b border-neutral-800 bg-neutral-950/80 p-4 backdrop-blur-md transition-all duration-500",
        focusMode && "border-transparent bg-transparent py-8"
    )}>
      <div className={cn(
          "transition-all duration-300 overflow-hidden",
          focusMode ? "w-0 opacity-0" : "w-auto opacity-100"
      )}>
        <SidebarTrigger />
      </div>

      <div className="flex flex-1 flex-col gap-1 transition-all duration-500">
        <div className="flex items-center justify-between text-sm">
          <span className={cn(
              "font-medium text-neutral-200 transition-all duration-500",
              focusMode && "text-lg opacity-80"
          )}>Year Progress</span>
          <span className={cn(
              "font-mono text-neutral-400 transition-all duration-500 tabular-nums",
              focusMode && "text-5xl text-white font-bold"
          )}>{loading ? "..." : `${yearProgress}%`}</span>
        </div>
        <Progress value={loading ? 0 : parseFloat(yearProgress)} className={cn(
            "h-2 bg-neutral-800 transition-all duration-500",
            focusMode && "h-1 opacity-50"
        )} />
      </div>

      <div className={cn(
          "flex items-center gap-4 transition-all duration-300",
          focusMode ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
      )}>
          <Tabs value={currentTab} onValueChange={handleTabChange}>
                <TabsList className="bg-neutral-900 border border-neutral-800">
                    <TabsTrigger value="year">Year</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="hidden text-sm text-neutral-400 xl:block">
                {formattedString}
            </div>
      </div>

      <div className="flex items-center gap-2 pl-2 border-l border-neutral-800/50">
          <Label htmlFor="focus-mode" className={cn(
              "text-xs text-neutral-500 transition-opacity",
              focusMode && "opacity-0 hidden sm:block sm:opacity-50"
          )}>Focus</Label>
          <Switch id="focus-mode" checked={focusMode} onCheckedChange={setFocusMode} />
      </div>
    </header>
  );
}
