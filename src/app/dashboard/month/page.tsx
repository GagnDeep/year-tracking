"use client";

import { useMemo, useState } from "react";
import { generateCalendarMonth } from "@/lib/calendar";
import { api } from "@/trpc/react";
import { format, addMonths, subMonths } from "date-fns";
import { useChronos } from "@/hooks/use-chronos";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function MonthPage() {
    const { now, loading } = useChronos();
    const [currentDate, setCurrentDate] = useState<Date | null>(null);

    // Default to today if not set yet, or keep current navigation
    const displayDate = currentDate || now || new Date();
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();

    const { data: logs, isLoading } = api.journal.getMonthlyStats.useQuery(
        { year, month },
        // Always enabled, suspense handles wait? Or just simple load
        { enabled: true }
    );

    const days = useMemo(() => generateCalendarMonth(year, month), [year, month]);

    const logsMap = useMemo(() => {
        const map = new Map();
        logs?.forEach(log => {
            map.set(format(log.date, "yyyy-MM-dd"), log);
        });
        return map;
    }, [logs]);

    const handlePrev = () => setCurrentDate(subMonths(displayDate, 1));
    const handleNext = () => setCurrentDate(addMonths(displayDate, 1));

    // Loading skeleton could be better, but generic fallback for now
    if (loading && !currentDate) return <div className="p-8">Loading...</div>;

    return (
        <div className="flex flex-col h-full gap-4 animate-in fade-in duration-500">
            <Breadcrumbs />

            <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-4">
                     <Button variant="outline" size="icon" onClick={handlePrev}>
                         <ChevronLeft className="h-4 w-4" />
                     </Button>
                     <h1 className="text-2xl font-bold tracking-tight capitalize">
                         {format(displayDate, "MMMM yyyy")}
                     </h1>
                     <Button variant="outline" size="icon" onClick={handleNext}>
                         <ChevronRight className="h-4 w-4" />
                     </Button>
                 </div>
            </div>

            <Card className="flex-1 flex flex-col border-border bg-card/50 shadow-sm overflow-hidden">
                <div className="grid grid-cols-7 border-b border-border bg-muted/40">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                        <div key={d} className="text-center text-xs font-medium text-muted-foreground py-3">
                            {d}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 auto-rows-fr flex-1 divide-x divide-y divide-border border-l border-t border-border">
                    {days.map((day) => {
                        const dateStr = format(day.date, "yyyy-MM-dd");
                        const log = logsMap.get(dateStr);

                        return (
                            <Link
                                key={dateStr}
                                href={`/dashboard/day/${dateStr}`}
                                className={cn(
                                    "min-h-[100px] p-2 flex flex-col gap-1 transition-all hover:bg-muted/50 relative group",
                                    !day.isCurrentMonth && "bg-muted/10 text-muted-foreground/30",
                                    day.isToday && "bg-primary/5 ring-inset ring-1 ring-primary"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={cn(
                                        "text-sm font-mono w-6 h-6 flex items-center justify-center rounded-full",
                                        day.isToday ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground"
                                    )}>
                                        {day.date.getDate()}
                                    </span>
                                    {log?.mood && (
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            log.mood === "great" && "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
                                            log.mood === "good" && "bg-blue-500",
                                            log.mood === "neutral" && "bg-neutral-500",
                                            log.mood === "bad" && "bg-orange-500",
                                            log.mood === "awful" && "bg-red-500",
                                        )} />
                                    )}
                                </div>

                                {log?.content && (
                                    <div className="mt-1 flex-1">
                                        <p className="text-[10px] text-muted-foreground line-clamp-3 leading-relaxed group-hover:text-foreground transition-colors">
                                            {log.content.replace(/<[^>]*>?/gm, '') || "No content"}
                                        </p>
                                    </div>
                                )}

                                {log?.productivityScore !== undefined && (
                                    <div className="absolute bottom-1 right-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <span className={cn(
                                            "text-[10px] font-bold px-1.5 py-0.5 rounded",
                                            log.productivityScore >= 8 ? "bg-emerald-500/20 text-emerald-500" :
                                            log.productivityScore >= 4 ? "bg-blue-500/20 text-blue-500" :
                                            "bg-orange-500/20 text-orange-500"
                                        )}>
                                            {log.productivityScore}
                                        </span>
                                    </div>
                                )}
                            </Link>
                        )
                    })}
                </div>
            </Card>
        </div>
    );
}
