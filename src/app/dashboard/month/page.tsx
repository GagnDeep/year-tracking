"use client";

import { useMemo } from "react";
import { generateCalendarMonth } from "@/lib/calendar";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { useChronos } from "@/hooks/use-chronos";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function MonthPage() {
    const { now, loading } = useChronos();
    // Default to current month/year if loading or not set
    const date = now || new Date();
    const year = date.getFullYear();
    const month = date.getMonth();

    const { data: logs } = api.journal.getMonthlyStats.useQuery(
        { year, month },
        { enabled: !!now } // Wait for hydration/chronos
    );

    const days = useMemo(() => generateCalendarMonth(year, month), [year, month]);

    // Map logs to date string
    const logsMap = useMemo(() => {
        const map = new Map();
        logs?.forEach(log => {
            map.set(format(log.date, "yyyy-MM-dd"), log);
        });
        return map;
    }, [logs]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="flex flex-col h-full">
            <div className="grid grid-cols-7 gap-1">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                    <div key={d} className="text-center text-xs text-neutral-500 py-2 border-b border-neutral-800">
                        {d}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1 auto-rows-fr flex-1">
                {days.map((day) => {
                    const dateStr = format(day.date, "yyyy-MM-dd");
                    const log = logsMap.get(dateStr);

                    return (
                        <Link
                            key={dateStr}
                            href={`/dashboard/day/${dateStr}`}
                            className={cn(
                                "min-h-[80px] border border-neutral-800 p-2 flex flex-col gap-1 transition-colors hover:bg-neutral-900 overflow-hidden",
                                !day.isCurrentMonth && "opacity-30 bg-neutral-950/50",
                                day.isToday && "border-white bg-neutral-900"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <span className={cn(
                                    "text-sm font-mono",
                                    day.isToday && "text-white font-bold"
                                )}>
                                    {day.date.getDate()}
                                </span>
                                {log?.mood && (
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        log.mood === "great" && "bg-emerald-500",
                                        log.mood === "good" && "bg-blue-500",
                                        log.mood === "neutral" && "bg-neutral-500",
                                        log.mood === "bad" && "bg-orange-500",
                                        log.mood === "awful" && "bg-red-500",
                                    )} />
                                )}
                            </div>

                            {log?.content && (
                                <p className="text-[10px] text-neutral-400 line-clamp-3 leading-snug">
                                    {log.content.replace(/<[^>]*>?/gm, '')}
                                </p>
                            )}
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}
