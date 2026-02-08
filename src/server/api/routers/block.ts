import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const blockRouter = createTRPCRouter({
  getBlocks: protectedProcedure
    .input(z.object({ date: z.date() }))
    .query(async ({ ctx, input }) => {
      const startOfDay = new Date(input.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(input.date);
      endOfDay.setHours(23, 59, 59, 999);

      return ctx.db.block.findMany({
        where: {
          userId: ctx.session.user.id,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        orderBy: { startTime: "asc" },
      });
    }),

  upsertBlock: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(),
        title: z.string().min(1),
        startTime: z.string(), // HH:mm
        endTime: z.string(), // HH:mm
        date: z.date(),
        type: z.string().default("event"),
        category: z.string().default("default"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.id) {
        return ctx.db.block.update({
          where: { id: input.id, userId: ctx.session.user.id },
          data: {
            title: input.title,
            startTime: input.startTime,
            endTime: input.endTime,
            date: input.date,
            type: input.type,
            category: input.category,
          },
        });
      }

      return ctx.db.block.create({
        data: {
          title: input.title,
          startTime: input.startTime,
          endTime: input.endTime,
          date: input.date,
          type: input.type,
          category: input.category,
          userId: ctx.session.user.id,
        },
      });
    }),

  deleteBlock: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.block.delete({
        where: { id: input.id, userId: ctx.session.user.id },
      });
    }),
});
