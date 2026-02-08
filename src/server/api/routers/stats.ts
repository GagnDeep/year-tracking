import { z } from "zod";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, subDays, differenceInDays } from "date-fns";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const statsRouter = createTRPCRouter({
  getWeeklyStats: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date();
    // Get last 7 days including today
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(today, 6 - i);
      return {
        date: d,
        label: format(d, "EEE"), // Mon, Tue...
      };
    });

    const firstDay = last7Days[0];
    const lastDay = last7Days[6];

    if (!firstDay || !lastDay) {
        throw new Error("Date calculation failed");
    }

    const start = new Date(firstDay.date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(lastDay.date);
    end.setHours(23, 59, 59, 999);

    const tasks = await ctx.db.task.findMany({
      where: {
        userId: ctx.session.user.id,
        completedAt: {
          gte: start,
          lte: end,
        },
        completed: true,
      },
    });

    const data = last7Days.map((day) => {
      const dayStart = new Date(day.date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day.date);
      dayEnd.setHours(23, 59, 59, 999);

      const tasksCount = tasks.filter(
        (t) => t.completedAt && t.completedAt >= dayStart && t.completedAt <= dayEnd
      ).length;

      return {
        name: day.label,
        tasks: tasksCount,
      };
    });

    // Calculate Streak
    // Fetch all completed tasks ordered by completedAt desc
    // We fetch a larger range to calculate streak properly, simpler than full history
    const allCompletedTasks = await ctx.db.task.findMany({
      where: {
        userId: ctx.session.user.id,
        completed: true,
        completedAt: { not: null },
      },
      orderBy: { completedAt: "desc" },
      select: { completedAt: true },
      take: 100 // Optimization: just check last 100 tasks, if streak > 100 days, good enough or fetch more
    });

    let currentStreak = 0;

    // Simplistic streak logic
    const uniqueDays = new Set<string>();
    allCompletedTasks.forEach(t => {
        if (t.completedAt) {
            uniqueDays.add(format(t.completedAt, 'yyyy-MM-dd'));
        }
    });

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    // Check if streak is alive (completed today or yesterday)
    if (uniqueDays.has(todayStr) || uniqueDays.has(yesterdayStr)) {
        let dateIter = new Date();
        // If not today, start from yesterday
        if (!uniqueDays.has(todayStr)) {
            dateIter = subDays(new Date(), 1);
        }

        while (true) {
            const dateStr = format(dateIter, 'yyyy-MM-dd');
            if (uniqueDays.has(dateStr)) {
                currentStreak++;
                dateIter = subDays(dateIter, 1);
            } else {
                break;
            }
        }
    }

    return {
        weeklyData: data,
        currentStreak
    };
  }),

  getCalendarDays: protectedProcedure.query(async ({ ctx }) => {
    // Return all dates that have activity (journal or blocks)
    // For optimization, maybe last 365 days?
    // Let's just get distinct dates from Journal and Blocks

    // Prisma distinct on dates is tricky with DateTime because of time.
    // Ideally we store date as string or separate column.
    // For now, we fetch partial data.

    const journalEntries = await ctx.db.journalEntry.findMany({
        where: { userId: ctx.session.user.id },
        select: { date: true }
    });

    const blocks = await ctx.db.block.findMany({
        where: { userId: ctx.session.user.id },
        select: { date: true }
    });

    // Combine and dedupe
    const dates = new Set<string>();

    journalEntries.forEach(e => dates.add(format(e.date, "yyyy-MM-dd")));
    blocks.forEach(b => dates.add(format(b.date, "yyyy-MM-dd")));

    return Array.from(dates);
  }),
});
