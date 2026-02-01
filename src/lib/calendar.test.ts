import { describe, it, expect } from "vitest";
import { generateCalendarMonth } from "./calendar";

describe("Calendar Utility", () => {
  it("should generate correct days for February 2026", () => {
    // Feb 2026.
    // 1st Feb 2026 is a Sunday.
    // If week starts on Monday, the calendar should start on Monday Jan 26, 2026?
    // Wait. 2026-02-01 is a Sunday.
    // startOfWeek(2026-02-01, { weekStartsOn: 1 }) -> Monday 2026-01-26.

    // Feb 2026 has 28 days.
    // Last day is Feb 28 (Saturday).
    // endOfWeek(Feb 28, { weekStartsOn: 1 }) -> Sunday Mar 1.

    // So range: Jan 26 to Mar 1.
    // Days: 6 (Jan) + 28 (Feb) + 1 (Mar) = 35 days.
    // Wait.
    // Jan 26, 27, 28, 29, 30, 31 (6 days)
    // Feb 1..28 (28 days)
    // Mar 1 (1 day)
    // Total 35 days (5 weeks).

    const days = generateCalendarMonth(2026, 1); // 1 = February

    expect(days).toHaveLength(35);

    const firstDay = days[0];
    expect(firstDay?.date.toISOString()).toContain("2026-01-26");
    expect(firstDay?.isCurrentMonth).toBe(false); // Jan

    // Check Feb 1st
    const feb1 = days.find(d => d.date.getDate() === 1 && d.date.getMonth() === 1);
    expect(feb1).toBeDefined();
    expect(feb1?.isCurrentMonth).toBe(true);

    // Check last day
    const lastDay = days[days.length - 1];
    expect(lastDay?.date.toISOString()).toContain("2026-03-01");
    expect(lastDay?.isCurrentMonth).toBe(false); // March
  });
});
