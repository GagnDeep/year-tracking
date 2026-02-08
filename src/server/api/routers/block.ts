import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const blockRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.block.findMany({
        where: {
          userId: ctx.session.user.id,
          date: input.date,
        },
        orderBy: { startTime: "asc" },
      });
    }),

  create: protectedProcedure
    .input(z.object({
        date: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        title: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.block.create({
        data: {
          userId: ctx.session.user.id,
          date: input.date,
          startTime: input.startTime,
          endTime: input.endTime,
          title: input.title,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.block.delete({
        where: { id: input.id, userId: ctx.session.user.id },
      });
    }),
});
