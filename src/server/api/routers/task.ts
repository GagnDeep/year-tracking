import { z } from "zod";

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
