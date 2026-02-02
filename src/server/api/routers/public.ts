import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const publicRouter = createTRPCRouter({
  getProfile: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { username: input.username },
        select: {
          id: true,
          name: true,
          isPublic: true,
          yearConfig: true,
        },
      });

      if (!user || !user.isPublic) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return user;
    }),

  getYear: publicProcedure
    .input(z.object({ username: z.string(), year: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { username: input.username },
      });

      if (!user || !user.isPublic) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const startOfYear = new Date(`${input.year}-01-01`);
      const endOfYear = new Date(`${input.year}-12-31T23:59:59.999Z`);

      const logs = await ctx.db.dayLog.findMany({
        where: {
          userId: user.id,
          date: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
        select: {
          date: true,
          productivityScore: true,
          mood: true,
          // EXPLICITLY NOT SELECTING CONTENT
        },
      });

      return logs;
    }),
});
