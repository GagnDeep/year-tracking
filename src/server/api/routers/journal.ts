import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const journalRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.journalEntry.findUnique({
        where: {
          userId_date: {
            userId: ctx.session.user.id,
            date: input.date,
          },
        },
      });
    }),

  upsert: protectedProcedure
    .input(z.object({ date: z.string(), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.journalEntry.upsert({
        where: {
          userId_date: {
            userId: ctx.session.user.id,
            date: input.date,
          },
        },
        update: {
          content: input.content,
        },
        create: {
          userId: ctx.session.user.id,
          date: input.date,
          content: input.content,
        },
      });
    }),
});
