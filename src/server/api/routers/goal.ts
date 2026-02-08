import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const goalRouter = createTRPCRouter({
  getGoals: protectedProcedure
    .input(z.object({ showArchived: z.boolean().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.goal.findMany({
        where: {
            userId: ctx.session.user.id,
            archived: input.showArchived ? true : false
        },
        include: { tasks: true },
        orderBy: { createdAt: "desc" },
      });
    }),

  createGoal: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        isPublic: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.goal.create({
        data: {
          title: input.title,
          description: input.description,
          isPublic: input.isPublic,
          userId: ctx.session.user.id,
        },
      });
    }),

  updateGoal: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        completed: z.boolean().optional(),
        isPublic: z.boolean().optional(),
        archived: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.goal.update({
        where: { id: input.id, userId: ctx.session.user.id },
        data: {
          title: input.title,
          description: input.description,
          completed: input.completed,
          isPublic: input.isPublic,
          archived: input.archived,
        },
      });
    }),

  deleteGoal: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.goal.delete({
        where: { id: input.id, userId: ctx.session.user.id },
      });
    }),

  createTask: protectedProcedure
    .input(
      z.object({
        goalId: z.string(),
        title: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.create({
        data: {
          title: input.title,
          goalId: input.goalId,
          userId: ctx.session.user.id,
        },
      });
    }),

  updateTask: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        completed: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const data: any = { ...input };
      if (input.completed !== undefined) {
        data.completedAt = input.completed ? new Date() : null;
      }
      return ctx.db.task.update({
        where: { id: input.id, userId: ctx.session.user.id },
        data,
      });
    }),

  deleteTask: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.delete({
        where: { id: input.id, userId: ctx.session.user.id },
      });
    }),
});
