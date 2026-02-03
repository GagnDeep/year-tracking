import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, getDay } from "date-fns";

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function generateCalendarMonth(year: number, month: number): CalendarDay[] {
  // month is 0-indexed (0 = Jan, 11 = Dec) in JS Date, but commonly 1-12 in args.
  // Let's assume 0-indexed for consistency with Date, or 1-indexed?
  // User said "February 2026".
  // Let's use JS Date standard: 0-11.

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = endOfMonth(firstDayOfMonth);

  // Default startOfWeek is Sunday (0) usually, but Chronos might configure it.
  // For this utility, let's assume Monday (1) as per previous schema default "startOfWeek: Monday".
  // date-fns startOfWeek options: weekStartsOn: 1 (Monday)

  const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 });
  const endDate = endOfWeek(lastDayOfMonth, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const today = new Date();

  return days.map((day) => {
    return {
      date: day,
      isCurrentMonth: day.getMonth() === month,
      isToday: day.getDate() === today.getDate() &&
               day.getMonth() === today.getMonth() &&
               day.getFullYear() === today.getFullYear(),
    };
  });
}
