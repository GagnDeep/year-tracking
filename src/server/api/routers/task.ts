import { z } from "zod";
import { subDays, format } from "date-fns";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const taskRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ date: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.task.findMany({
        where: {
          userId: ctx.session.user.id,
          date: input.date ?? undefined,
        },
        orderBy: { order: "asc" },
      });
    }),

  getWeeklyStats: protectedProcedure
    .query(async ({ ctx }) => {
        const endDate = new Date();
        const startDate = subDays(endDate, 6); // Last 7 days including today

        // We stored date as YYYY-MM-DD string
        // We can fetch all tasks for user where date is >= startString and <= endString
        // But storing as string makes > comparison strictly lexical, which works for ISO format
        const startStr = format(startDate, "yyyy-MM-dd");
        const endStr = format(endDate, "yyyy-MM-dd");

        const tasks = await ctx.db.task.findMany({
            where: {
                userId: ctx.session.user.id,
                date: {
                    gte: startStr,
                    lte: endStr,
                },
                completed: true
            },
            select: {
                date: true
            }
        });

        // Initialize map for last 7 days
        const statsMap = new Map<string, number>();
        for (let i = 0; i < 7; i++) {
            const d = subDays(endDate, i);
            statsMap.set(format(d, "yyyy-MM-dd"), 0);
        }

        // Count tasks
        tasks.forEach(t => {
            if (t.date && statsMap.has(t.date)) {
                statsMap.set(t.date, (statsMap.get(t.date) ?? 0) + 1);
            }
        });

        // Convert to array expected by recharts
        // Recharts wants array of objects. Sorting by date ascending.
        return Array.from(statsMap.entries())
            .map(([date, count]) => ({
                name: format(new Date(date), "EEE"), // Mon, Tue
                fullDate: date,
                tasks: count
            }))
            .reverse(); // Map iteration of date subDays goes Today -> Past. We want Past -> Today.
    }),

  create: protectedProcedure
    .input(z.object({ title: z.string(), date: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.create({
        data: {
          userId: ctx.session.user.id,
          title: input.title,
          date: input.date,
        },
      });
    }),

  updateOrder: protectedProcedure
    .input(z.array(z.object({ id: z.string(), order: z.number() })))
    .mutation(async ({ ctx, input }) => {
        // This is not efficient for large lists, but fine for daily tasks
        for (const item of input) {
            await ctx.db.task.update({
                where: { id: item.id, userId: ctx.session.user.id },
                data: { order: item.order },
            });
        }
    }),

  toggle: protectedProcedure
    .input(z.object({ id: z.string(), completed: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.update({
        where: { id: input.id, userId: ctx.session.user.id },
        data: { completed: input.completed },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
        return ctx.db.task.delete({
            where: { id: input.id, userId: ctx.session.user.id },
        });
    }),
});
