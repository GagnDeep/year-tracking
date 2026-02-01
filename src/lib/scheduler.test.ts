import { describe, it, expect } from "vitest";
import { calculateDailyStats, checkOverlap, type TimeBlock } from "./scheduler";

describe("Scheduler Logic", () => {
  it("calculates daily stats correctly", () => {
    const baseDate = new Date("2024-01-01T00:00:00");
    const blocks: TimeBlock[] = [
      {
        startTime: new Date("2024-01-01T09:00:00"),
        endTime: new Date("2024-01-01T11:00:00"), // 2 hours
        category: "Work",
      },
      {
        startTime: new Date("2024-01-01T12:00:00"),
        endTime: new Date("2024-01-01T13:00:00"), // 1 hour
        category: "Health",
      },
      {
        startTime: new Date("2024-01-01T14:00:00"),
        endTime: new Date("2024-01-01T15:00:00"), // 1 hour
        category: "Work",
      },
    ];

    const stats = calculateDailyStats(blocks);

    expect(stats.totalScheduled).toBe(4);
    expect(stats.totalFree).toBe(20);
    expect(stats.byCategory["Work"]).toBe(3);
    expect(stats.byCategory["Health"]).toBe(1);
  });

  it("detects overlaps correctly", () => {
    const existing: TimeBlock[] = [
      {
        id: "1",
        startTime: new Date("2024-01-01T10:00:00"),
        endTime: new Date("2024-01-01T12:00:00"),
        category: "Work",
      },
    ];

    // Case 1: No overlap (after)
    expect(checkOverlap({
        startTime: new Date("2024-01-01T12:00:00"),
        endTime: new Date("2024-01-01T13:00:00"),
        category: "Work"
    }, existing)).toBe(false);

    // Case 2: Overlap (Partial end)
    expect(checkOverlap({
        startTime: new Date("2024-01-01T09:00:00"),
        endTime: new Date("2024-01-01T10:30:00"),
        category: "Work"
    }, existing)).toBe(true);

    // Case 3: Overlap (Inside)
    expect(checkOverlap({
        startTime: new Date("2024-01-01T10:30:00"),
        endTime: new Date("2024-01-01T11:30:00"),
        category: "Work"
    }, existing)).toBe(true);

    // Case 4: Ignore self (update)
    expect(checkOverlap({
        id: "1", // Same ID as existing
        startTime: new Date("2024-01-01T10:30:00"), // Would overlap if considered
        endTime: new Date("2024-01-01T11:30:00"),
        category: "Work"
    }, existing)).toBe(false);
  });
});
