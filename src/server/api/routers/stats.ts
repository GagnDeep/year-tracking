import { z } from "zod";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, subDays } from "date-fns";

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

    return data;
  }),
});
