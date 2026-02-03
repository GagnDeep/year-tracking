import { useState, useEffect } from "react";
import {
  startOfYear,
  endOfYear,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  differenceInMilliseconds,
  isLeapYear,
  getDayOfYear,
  getDaysInYear,
  differenceInDays,
} from "date-fns";

export function useChronos() {
  // Initialize with null to avoid hydration mismatch, then set in useEffect?
  // Or just use new Date() but then server/client might differ slightly.
  // Ideally for "Live" feel, client-side only is fine, but initial render might mismatch.
  // I'll use a mounted check or just accept hydration warning if any (but hook usually runs on client).
  // Actually, if I render this on server, it will be static.
  // I'll initialize with new Date() but suppress hydration warning in usage or use useEffect to set state.

  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!now) {
    // Return empty or loading state to avoid hydration mismatch
    return {
      now: new Date(), // fallback
      year: new Date().getFullYear(),
      isLeapYear: false,
      yearProgress: "0.0000",
      monthProgress: "0.0000",
      dayProgress: "0.0000",
      daysLeft: 0,
      currentDay: 0,
      totalDays: 365,
      formattedString: "Loading...",
      loading: true,
    };
  }

  const currentYear = now.getFullYear();
  const yearStart = startOfYear(now);
  const yearEnd = endOfYear(now);
  // endOfYear is 23:59:59.999. total duration should be end - start.
  // Actually endOfYear returns the date object.
  const totalYearMs = differenceInMilliseconds(yearEnd, yearStart);
  const elapsedYearMs = differenceInMilliseconds(now, yearStart);
  const yearProgress = (elapsedYearMs / totalYearMs) * 100;

  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const totalMonthMs = differenceInMilliseconds(monthEnd, monthStart);
  const elapsedMonthMs = differenceInMilliseconds(now, monthStart);
  const monthProgress = (elapsedMonthMs / totalMonthMs) * 100;

  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);
  const totalDayMs = differenceInMilliseconds(dayEnd, dayStart);
  const elapsedDayMs = differenceInMilliseconds(now, dayStart);
  const dayProgress = (elapsedDayMs / totalDayMs) * 100;

  const totalDays = getDaysInYear(now);
  const currentDay = getDayOfYear(now);
  const daysLeft = differenceInDays(yearEnd, now);

  return {
    now,
    year: currentYear,
    isLeapYear: isLeapYear(now),
    yearProgress: yearProgress.toFixed(4),
    monthProgress: monthProgress.toFixed(4),
    dayProgress: dayProgress.toFixed(4),
    daysLeft,
    currentDay,
    totalDays,
    formattedString: `${daysLeft} days left`,
    loading: false,
  };
}
