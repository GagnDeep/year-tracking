import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
    });
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        image: z.string().url().optional(),
        username: z.string().min(3).max(20).optional(),
        publicVisibility: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // If updating username, check uniqueness
      if (input.username) {
        const existing = await ctx.db.user.findUnique({
          where: { username: input.username },
        });
        if (existing && existing.id !== ctx.session.user.id) {
          throw new Error("Username already taken");
        }
      }

      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: input,
      });
    }),

  getPublicProfile: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { username: input.username },
        select: {
          name: true,
          image: true,
          username: true,
          publicVisibility: true,
        },
      });

      if (!user || !user.publicVisibility) {
        throw new Error("User not found or profile is private");
      }

      return user;
    }),
});
