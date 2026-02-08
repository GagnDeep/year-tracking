import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const journalRouter = createTRPCRouter({
  upsert: protectedProcedure
    .input(
      z.object({
        date: z.date(),
        content: z.string(), // JSON string
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if entry exists for this date (ignoring time)
      const startOfDay = new Date(input.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(input.date);
      endOfDay.setHours(23, 59, 59, 999);

      const existing = await ctx.db.journalEntry.findFirst({
        where: {
          userId: ctx.session.user.id,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      if (existing) {
        return ctx.db.journalEntry.update({
          where: { id: existing.id },
          data: { content: input.content },
        });
      }

      return ctx.db.journalEntry.create({
        data: {
          userId: ctx.session.user.id,
          date: input.date,
          content: input.content,
        },
      });
    }),

  getToday: protectedProcedure.query(async ({ ctx }) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return ctx.db.journalEntry.findFirst({
      where: {
        userId: ctx.session.user.id,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
  }),

  getByDate: protectedProcedure
    .input(z.object({ date: z.date() }))
    .query(async ({ ctx, input }) => {
      const startOfDay = new Date(input.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(input.date);
      endOfDay.setHours(23, 59, 59, 999);

      return ctx.db.journalEntry.findFirst({
        where: {
          userId: ctx.session.user.id,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });
    }),
});
