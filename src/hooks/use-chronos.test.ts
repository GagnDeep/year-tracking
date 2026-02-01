import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useChronos } from "./use-chronos";

describe("useChronos", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("correctly identifies a leap year (2024)", () => {
    vi.setSystemTime(new Date("2024-01-01T00:00:00"));
    const { result } = renderHook(() => useChronos());

    // We need to wait for useEffect to set 'now'
    act(() => {
        vi.advanceTimersByTime(0);
    });

    // Wait for the state update if necessary, but act should handle it.
    // However, the hook initializes 'now' in useEffect.

    // In our implementation:
    // const [now, setNow] = useState<Date | null>(null);
    // useEffect(() => { setNow(new Date()); ... }, [])

    // So initially result.current.loading might be true or false depending on effect timing.
    // We just want to ensure it settles to false and has correct data.

    act(() => {
        vi.advanceTimersByTime(100);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.isLeapYear).toBe(true);
    expect(result.current.totalDays).toBe(366);
  });

  it("calculates percentage for exactly mid-year (non-leap)", () => {
    // 2023 is non-leap. Mid year exactly.
    // Start: 2023-01-01 00:00:00
    // End: 2023-12-31 23:59:59.999
    // Midpoint... precise calculation might be tricky to hit exactly 50.0000% unless we pick the exact millisecond.
    // Let's pick July 2nd 12:00 PM for approximation check or just check consistent progress.
    // 365 days. Midpoint is Day 182.5 + start.

    vi.setSystemTime(new Date("2023-07-02T12:00:00")); // Roughly middle
    const { result } = renderHook(() => useChronos());

    act(() => {
        vi.advanceTimersByTime(100);
    });

    expect(result.current.year).toBe(2023);
    expect(result.current.isLeapYear).toBe(false);

    // Just verify it returns a string with 4 decimals
    expect(result.current.yearProgress).toMatch(/^\d+\.\d{4}$/);

    // It should be around 50%
    const progress = parseFloat(result.current.yearProgress);
    expect(progress).toBeGreaterThan(49);
    expect(progress).toBeLessThan(51);
  });

  it("Day 60 is Feb 29 in leap year", () => {
      vi.setSystemTime(new Date("2024-02-29T12:00:00"));
      const { result } = renderHook(() => useChronos());
      act(() => { vi.advanceTimersByTime(100); });

      expect(result.current.currentDay).toBe(60);
  });

   it("Day 60 is Mar 1 in non-leap year", () => {
      vi.setSystemTime(new Date("2023-03-01T12:00:00"));
      const { result } = renderHook(() => useChronos());
      act(() => { vi.advanceTimersByTime(100); });

      expect(result.current.currentDay).toBe(60);
  });
});
