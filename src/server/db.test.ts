import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import path from "path";

// Use absolute path to avoid CWD confusion
const dbPath = path.join(process.cwd(), "test.db");
const TEST_DB_URL = `file:${dbPath}`;

describe("Database Integration (Real SQLite)", () => {
    let prisma: PrismaClient;

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
    });

    afterAll(async () => {
        await prisma?.$disconnect();
        try {
            execSync(`rm -f "${dbPath}"*`);
        } catch (e) {
            // ignore
        }
    });

    it("should allow creating a user", async () => {
        // Ensure clean state (redundant if rm worked, but safe)
        await prisma.user.deleteMany();

        const user = await prisma.user.create({
            data: {
                name: "Test User",
                email: "test@example.com",
                yearConfig: {
                    create: {
                        startOfWeek: "Monday",
                        theme: "zinc"
                    }
                }
            },
            include: {
                yearConfig: true
            }
        });

        expect(user.email).toBe("test@example.com");
        expect(user.yearConfig).toBeDefined();
        expect(user.yearConfig?.startOfWeek).toBe("Monday");
    });
});
