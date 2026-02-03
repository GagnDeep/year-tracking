// @vitest-environment node
import path from "path";

const dbPath = path.join(process.cwd(), "test-journal.db");
const TEST_DB_URL = `file:${dbPath}`;

import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";

// Mock env before other imports
vi.mock("../../../env", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("path");
    const dbPath = path.join(process.cwd(), "test-journal.db");
    return {
      env: {
        NODE_ENV: "test",
        DATABASE_URL: `file:${dbPath}`,
        NEXTAUTH_SECRET: "secret",
        NEXTAUTH_URL: "http://localhost:3000"
      }
    };
});
import { appRouter } from "../root";
import { createTRPCContext } from "../trpc";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

describe("Journal Router", () => {
    let prisma: PrismaClient;
    let ctx: any;
    let caller: any;

    beforeEach(async () => {
        // Remove DB file if exists
        try {
            execSync(`rm -f "${dbPath}"*`);
        } catch (e) {
            // ignore
        }

        // Push schema
        execSync("npx prisma db push --skip-generate", {
            stdio: 'ignore',
            env: { ...process.env, DATABASE_URL: TEST_DB_URL }
        });

        prisma = new PrismaClient({
             datasources: { db: { url: TEST_DB_URL } }
        });

        // Create a user for auth context
        const user = await prisma.user.create({
            data: {
                name: "Test User",
                email: "test@example.com",
            }
        });

        // Mock context manually to avoid next-auth/nextjs headers dependency
        ctx = {
            headers: new Headers(),
            db: prisma,
            session: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
                expires: new Date().toISOString(),
            }
        };

        caller = appRouter.createCaller(ctx);
    });

    afterAll(async () => {
        await prisma?.$disconnect();
        try {
            execSync(`rm -f "${dbPath}"*`);
        } catch (e) {
            // ignore
        }
    });

    it("should upsert a new entry", async () => {
        const input = {
            date: "2024-01-01",
            content: "<p>Hello World</p>",
            productivityScore: 8,
            mood: "good",
        };

        const result = await caller.journal.upsertEntry(input);

        expect(result.content).toBe(input.content);
        expect(result.productivityScore).toBe(input.productivityScore);

        // Verify in DB
        const dbEntry = await prisma.dayLog.findFirst({
            where: { userId: ctx.session.user.id }
        });
        expect(dbEntry?.content).toBe(input.content);
    });

    it("should update an existing entry without changing ID", async () => {
        const date = "2024-01-02";

        // First create
        const first = await caller.journal.upsertEntry({
            date,
            content: "First",
            productivityScore: 5
        });

        // Update
        const second = await caller.journal.upsertEntry({
            date,
            content: "Second",
            productivityScore: 10
        });

        expect(first.id).toBe(second.id);
        expect(second.content).toBe("Second");
        expect(second.productivityScore).toBe(10);
    });

    it("should validate productivity score (0-10)", async () => {
        await expect(caller.journal.upsertEntry({
            date: "2024-01-03",
            productivityScore: 11 // Invalid
        })).rejects.toThrow();

        await expect(caller.journal.upsertEntry({
            date: "2024-01-03",
            productivityScore: -1 // Invalid
        })).rejects.toThrow();
    });
});
