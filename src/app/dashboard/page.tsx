"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { eachDayOfInterval, startOfYear, endOfYear, isSameDay, isBefore, format } from "date-fns";
import { useChronos } from "@/hooks/use-chronos";
import { api } from "@/trpc/react";
import { useLayout } from "@/context/layout-context";
import { YearGridSkeleton } from "@/components/skeletons/year-grid-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Flame, Target } from "lucide-react";

export default function DashboardPage() {
  const { now, loading } = useChronos();
  const year = now ? now.getFullYear() : new Date().getFullYear();
  const { setTransitionRect } = useLayout();
  const router = useRouter();

  // Fetch yearly stats
  const { data: yearlyStats } = api.journal.getYearlyStats.useQuery(
      { year },
      { enabled: !!now }
  );

  // Create a map for quick lookup
  const statsMap = useMemo(() => {
      const map = new Map<string, number>();
      if (yearlyStats) {
          yearlyStats.forEach(stat => {
              const dateStr = format(stat.date, "yyyy-MM-dd");
              map.set(dateStr, stat.productivityScore ?? 0);
          });
      }
      return map;
  }, [yearlyStats]);

  // Aggregation for Summary Cards
  const summary = useMemo(() => {
    if (!yearlyStats) return { streak: 0, avg: "0.0" };

    // Sort logic
    const sorted = [...yearlyStats].sort((a, b) => a.date.getTime() - b.date.getTime());

    // Streak
    let currentStreak = 0;
    let maxStreak = 0;
    let prevDate: Date | null = null;

    sorted.forEach(stat => {
        if (!prevDate) {
            currentStreak = 1;
        } else {
            const diff = (stat.date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
            if (Math.abs(diff - 1) < 0.1) currentStreak++;
            else currentStreak = 1;
        }
        if (currentStreak > maxStreak) maxStreak = currentStreak;
        prevDate = stat.date;
    });

    // Avg
    const total = yearlyStats.reduce((acc, cur) => acc + (cur.productivityScore || 0), 0);
    const avg = yearlyStats.length > 0 ? (total / yearlyStats.length).toFixed(1) : "0.0";

    return { streak: maxStreak, avg };
  }, [yearlyStats]);


  const days = useMemo(() => {
    // Fallback to current date if loading
    const targetDate = now || new Date();
    const start = startOfYear(targetDate);
    const end = endOfYear(targetDate);
    return eachDayOfInterval({ start, end });
  }, [now]);

  const handleDayClick = (e: React.MouseEvent, dateStr: string) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setTransitionRect(rect);
    router.push(`/dashboard/day/${dateStr}`);
  };

  if (loading) return <YearGridSkeleton />;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Year Grid</h2>
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium bg-card border border-border px-3 py-1 rounded-full shadow-sm">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span>{summary.streak} Day Streak</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium bg-card border border-border px-3 py-1 rounded-full shadow-sm">
                  <Target className="h-4 w-4 text-emerald-500" />
                  <span>{summary.avg} Avg</span>
              </div>
          </div>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
        <CardContent className="p-6">
            <div className="flex flex-wrap gap-1.5 justify-start">
                {days.map((day) => {
                const isToday = isSameDay(day, now!);
                const isPast = isBefore(day, now!) && !isToday;
                const dateString = format(day, "yyyy-MM-dd");
                const score = statsMap.get(dateString);

                let bgClass = "bg-secondary/40 border-transparent hover:border-border"; // Future

                if (isToday) {
                    bgClass = "bg-primary border-primary ring-2 ring-primary/20 animate-pulse z-10 scale-110 shadow-lg shadow-primary/20";
                } else if (isPast) {
                    if (score !== undefined) {
                        if (score >= 8) bgClass = "bg-emerald-500/90 border-emerald-600 hover:bg-emerald-500";
                        else if (score >= 4) bgClass = "bg-blue-500/90 border-blue-600 hover:bg-blue-500";
                        else bgClass = "bg-orange-500/90 border-orange-600 hover:bg-orange-500";
                    } else {
                        bgClass = "bg-muted border-transparent hover:bg-muted-foreground/20"; // Past no data
                    }
                }

                return (
                    <Link
                    key={dateString}
                    href={`/dashboard/day/${dateString}`}
                    onClick={(e) => handleDayClick(e, dateString)}
                    title={`${dateString}${score !== undefined ? ` - Score: ${score}` : ""}`}
                    className={cn(
                        "h-4 w-4 rounded-sm border transition-all duration-300 hover:scale-125 hover:z-20 hover:shadow-lg",
                        bgClass
                    )}
                    />
                );
                })}
            </div>
        </CardContent>
      </Card>

      <div className="flex gap-6 text-xs font-medium text-muted-foreground px-2">
          <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-orange-500/90 shadow-sm shadow-orange-500/20"></div>
              <span>Low (0-3)</span>
          </div>
          <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-blue-500/90 shadow-sm shadow-blue-500/20"></div>
              <span>Medium (4-7)</span>
          </div>
          <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-emerald-500/90 shadow-sm shadow-emerald-500/20"></div>
              <span>High (8-10)</span>
          </div>
           <div className="flex items-center gap-2 ml-auto">
              <div className="w-3 h-3 rounded-sm bg-primary animate-pulse"></div>
              <span>Today</span>
          </div>
      </div>
    </div>
  );
}
