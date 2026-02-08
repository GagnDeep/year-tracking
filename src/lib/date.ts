import { format, parse, addDays, subDays } from "date-fns";

export function formatDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function parseDate(dateStr: string): Date {
  return parse(dateStr, "yyyy-MM-dd", new Date());
}

export function getNextDay(dateStr: string): string {
  const date = parseDate(dateStr);
  return formatDate(addDays(date, 1));
}

export function getPrevDay(dateStr: string): string {
  const date = parseDate(dateStr);
  return formatDate(subDays(date, 1));
}

export function isToday(dateStr: string): boolean {
    return dateStr === formatDate(new Date());
}
