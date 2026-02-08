import { blockRouter } from "@/server/api/routers/block";
import { goalRouter } from "@/server/api/routers/goal";
import { journalRouter } from "@/server/api/routers/journal";
import { searchRouter } from "@/server/api/routers/search";
import { statsRouter } from "@/server/api/routers/stats";
import { userRouter } from "@/server/api/routers/user";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  goal: goalRouter,
  journal: journalRouter,
  block: blockRouter,
  stats: statsRouter,
  search: searchRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
