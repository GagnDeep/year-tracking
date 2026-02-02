import { z } from "zod";
import bcrypt from "bcryptjs";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(6),
    }))
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists.",
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const user = await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          yearConfig: {
            create: {
                startOfWeek: "Monday",
                theme: "zinc",
            },
          },
        },
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(1).optional(),
      username: z.string().min(3).optional().nullable(),
      isPublic: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check username uniqueness if being updated
      if (input.username) {
        const existing = await ctx.db.user.findUnique({
            where: { username: input.username },
        });
        if (existing && existing.id !== ctx.session.user.id) {
            throw new TRPCError({
                code: "CONFLICT",
                message: "Username already taken.",
            });
        }
      }

      const updatedUser = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
            ...input,
        },
      });

      return updatedUser;
    }),

    getProfile: protectedProcedure
        .query(async ({ ctx }) => {
            return ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                select: {
                    name: true,
                    email: true,
                    username: true,
                    isPublic: true,
                    image: true,
                }
            });
        }),
});
