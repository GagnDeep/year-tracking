import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const journalRouter = createTRPCRouter({
  getEntry: protectedProcedure
    .input(z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
    .query(async ({ ctx, input }) => {
      const entry = await ctx.db.dayLog.findUnique({
        where: {
          userId_date: {
            userId: ctx.session.user.id,
            date: new Date(input.date),
          },
        },
      });

      return entry;
    }),

  upsertEntry: protectedProcedure
    .input(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        content: z.string().optional(),
        productivityScore: z.number().min(0).max(10).optional(),
        mood: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { date, content, productivityScore, mood } = input;
      const targetDate = new Date(date);

      const entry = await ctx.db.dayLog.upsert({
        where: {
          userId_date: {
            userId: ctx.session.user.id,
            date: targetDate,
          },
        },
        create: {
          userId: ctx.session.user.id,
          date: targetDate,
          content,
          productivityScore,
          mood,
        },
        update: {
          content,
          productivityScore,
          mood,
        },
      });

      return entry;
    }),

  getYearlyStats: protectedProcedure
    .input(z.object({ year: z.number() }))
    .query(async ({ ctx, input }) => {
      const startOfYear = new Date(`${input.year}-01-01`);
      const endOfYear = new Date(`${input.year}-12-31T23:59:59.999Z`);

      const logs = await ctx.db.dayLog.findMany({
        where: {
          userId: ctx.session.user.id,
          date: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
        select: {
          date: true,
          productivityScore: true,
          mood: true,
        },
      });

      return logs;
    }),

  getMonthlyStats: protectedProcedure
    .input(z.object({ year: z.number(), month: z.number() }))
    .query(async ({ ctx, input }) => {
      // month is 0-indexed in JS Date, but input might be 0-11
      const start = new Date(input.year, input.month, 1);
      const end = new Date(input.year, input.month + 1, 0, 23, 59, 59, 999);

      const logs = await ctx.db.dayLog.findMany({
        where: {
          userId: ctx.session.user.id,
          date: {
            gte: start,
            lte: end,
          },
        },
        select: {
          date: true,
          productivityScore: true,
          mood: true,
          content: true,
        },
      });

      return logs;
    }),
});
