import { notFound } from "next/navigation";
import { isValid, parse } from "date-fns";
import DayView from "./day-view";

export default async function DayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;

  // Validate date format yyyy-MM-dd
  const parsedDate = parse(date, "yyyy-MM-dd", new Date());
  if (!isValid(parsedDate)) {
    notFound();
  }

  return <DayView date={date} />;
}
