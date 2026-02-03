import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { checkOverlap, type TimeBlock } from "@/lib/scheduler";
import { TRPCError } from "@trpc/server";

export const timelineRouter = createTRPCRouter({
  getBlocks: protectedProcedure
    .input(z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
    .query(async ({ ctx, input }) => {
      const startOfDay = new Date(`${input.date}T00:00:00`);
      const endOfDay = new Date(`${input.date}T23:59:59.999`);

      // Find the DayLog for this user and date, then get blocks
      // Or search blocks directly if we had a direct relation, but relation is through DayLog.
      const dayLog = await ctx.db.dayLog.findUnique({
        where: {
          userId_date: {
            userId: ctx.session.user.id,
            date: new Date(input.date),
          },
        },
        include: {
          timeBlocks: true,
        },
      });

      return dayLog?.timeBlocks || [];
    }),

  upsertBlock: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        startTime: z.string(), // ISO string
        endTime: z.string(),   // ISO string
        category: z.string(),
        title: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const targetDate = new Date(input.date);
      const start = new Date(input.startTime);
      const end = new Date(input.endTime);

      if (start >= end) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Start time must be before end time",
        });
      }

      // Ensure DayLog exists
      const dayLog = await ctx.db.dayLog.upsert({
        where: {
          userId_date: {
            userId: ctx.session.user.id,
            date: targetDate,
          },
        },
        create: {
          userId: ctx.session.user.id,
          date: targetDate,
        },
        update: {},
        include: {
          timeBlocks: true,
        },
      });

      const newBlock: TimeBlock = {
        id: input.id,
        startTime: start,
        endTime: end,
        category: input.category,
      };

      // Check overlap
      const hasOverlap = checkOverlap(
        newBlock,
        dayLog.timeBlocks.map((b) => ({
          id: b.id,
          startTime: b.startTime,
          endTime: b.endTime,
          category: b.category,
        }))
      );

      if (hasOverlap) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Time block overlaps with an existing block",
        });
      }

      if (input.id) {
        return await ctx.db.timeBlock.update({
          where: { id: input.id },
          data: {
            startTime: start,
            endTime: end,
            category: input.category,
            title: input.title,
          },
        });
      } else {
        return await ctx.db.timeBlock.create({
          data: {
            dayLogId: dayLog.id,
            startTime: start,
            endTime: end,
            category: input.category,
            title: input.title,
          },
        });
      }
    }),

  deleteBlock: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership via DayLog
      const block = await ctx.db.timeBlock.findUnique({
        where: { id: input.id },
        include: { dayLog: true },
      });

      if (!block || block.dayLog.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db.timeBlock.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
