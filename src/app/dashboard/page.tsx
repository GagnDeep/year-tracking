"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { eachDayOfInterval, startOfYear, endOfYear, isSameDay, isBefore, format } from "date-fns";
import { useChronos } from "@/hooks/use-chronos";
import { api } from "@/trpc/react";
import { useLayout } from "@/context/layout-context";
import { YearGridSkeleton } from "@/components/skeletons/year-grid-skeleton";

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
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Year Grid</h2>
      <div className="flex flex-wrap gap-1">
        {days.map((day) => {
          const isToday = isSameDay(day, now!);
          const isPast = isBefore(day, now!) && !isToday;
          const dateString = format(day, "yyyy-MM-dd");
          const score = statsMap.get(dateString);

          // Heatmap Logic
          let bgClass = "bg-neutral-900 border-neutral-800 hover:border-neutral-600"; // Default Future

          if (isToday) {
              bgClass = "bg-white animate-pulse border-white";
          } else if (isPast) {
              if (score !== undefined) {
                  if (score >= 8) bgClass = "bg-emerald-500 border-emerald-500";
                  else if (score >= 4) bgClass = "bg-blue-500 border-blue-500";
                  else bgClass = "bg-orange-500 border-orange-500";
              } else {
                  // Past but no data -> Neutral gray
                  bgClass = "bg-neutral-800 border-neutral-800";
              }
          }

          return (
            <Link
              key={dateString}
              href={`/dashboard/day/${dateString}`}
              onClick={(e) => handleDayClick(e, dateString)}
              title={`${dateString}${score !== undefined ? ` - Score: ${score}` : ""}`}
              className={`
                h-4 w-4 rounded-sm border transition-all hover:scale-125
                ${bgClass}
              `}
            />
          );
        })}
      </div>

      <div className="flex gap-4 text-xs text-neutral-500 mt-4">
          <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-orange-500"></div>
              <span>Low (0-3)</span>
          </div>
          <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
              <span>Medium (4-7)</span>
          </div>
          <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
              <span>High (8-10)</span>
          </div>
      </div>
    </div>
  );
}
