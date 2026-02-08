import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const searchRouter = createTRPCRouter({
  search: protectedProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const q = input.query;

      const goals = await ctx.db.goal.findMany({
        where: {
          userId: ctx.session.user.id,
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ],
        },
        take: 5,
      });

      const journalEntries = await ctx.db.journalEntry.findMany({
        where: {
          userId: ctx.session.user.id,
          content: { contains: q },
        },
        take: 5,
        orderBy: { date: "desc" },
      });

      return {
        goals,
        journalEntries,
      };
    }),
});
