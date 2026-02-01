"use client";

import { useChronos } from "@/hooks/use-chronos";
import { Progress } from "@/components/ui/progress";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Header() {
  const { yearProgress, formattedString, loading } = useChronos();

  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-neutral-800 bg-neutral-950/80 p-4 backdrop-blur-md">
      <SidebarTrigger />
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-neutral-200">Year Progress</span>
          <span className="font-mono text-neutral-400">{loading ? "..." : `${yearProgress}%`}</span>
        </div>
        <Progress value={loading ? 0 : parseFloat(yearProgress)} className="h-2 bg-neutral-800" />
      </div>
      <div className="hidden text-sm text-neutral-400 sm:block">
        {formattedString}
      </div>
    </header>
  );
}
