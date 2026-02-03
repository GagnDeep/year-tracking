// @vitest-environment node
import path from "path";

// Mock env before imports
vi.mock("../../../env", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("path");
    const dbPath = path.join(process.cwd(), "test-public.db");
    return {
      env: {
        NODE_ENV: "test",
        DATABASE_URL: `file:${dbPath}`,
        NEXTAUTH_SECRET: "secret",
        NEXTAUTH_URL: "http://localhost:3000"
      }
    };
});

import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import { appRouter } from "../root";
import { createTRPCContext } from "../trpc";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const dbPath = path.join(process.cwd(), "test-public.db");
const TEST_DB_URL = `file:${dbPath}`;

describe("Public Router (Security)", () => {
    let prisma: PrismaClient;
    let ctx: any;
    let caller: any;

    beforeEach(async () => {
        try { execSync(`rm -f "${dbPath}"*`); } catch (e) {}
        execSync("npx prisma db push --skip-generate", {
            stdio: 'ignore',
            env: { ...process.env, DATABASE_URL: TEST_DB_URL }
        });

        prisma = new PrismaClient({ datasources: { db: { url: TEST_DB_URL } } });

        // Mock public context (no session)
        ctx = {
            headers: new Headers(),
            db: prisma,
            session: null,
        };

        caller = appRouter.createCaller(ctx);
    });

    afterAll(async () => {
        await prisma?.$disconnect();
        try { execSync(`rm -f "${dbPath}"*`); } catch (e) {}
    });

    it("should NOT return secret content in public feed", async () => {
        // Setup: Create a user with public profile and a secret log
        const user = await prisma.user.create({
            data: {
                name: "Public User",
                email: "public@example.com",
                username: "publicuser",
                isPublic: true,
            }
        });

        await prisma.dayLog.create({
            data: {
                userId: user.id,
                date: new Date("2024-01-01"),
                content: "MY SECRET PASSWORD",
                productivityScore: 10,
            }
        });

        // Act: Fetch public data
        const logs = await caller.public.getYear({ username: "publicuser", year: 2024 });

        // Assert
        expect(logs).toHaveLength(1);
        expect(logs[0].productivityScore).toBe(10);
        expect((logs[0] as any).content).toBeUndefined(); // Ensure content field is missing
        expect(JSON.stringify(logs)).not.toContain("MY SECRET PASSWORD");
    });

    it("should return 404/Error if user is not public", async () => {
        await prisma.user.create({
            data: {
                name: "Private User",
                email: "private@example.com",
                username: "privateuser",
                isPublic: false,
            }
        });

        await expect(
            caller.public.getYear({ username: "privateuser", year: 2024 })
        ).rejects.toThrow("NOT_FOUND");
    });
});
