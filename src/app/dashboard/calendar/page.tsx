"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CalendarPage() {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      router.push(`/dashboard/day/${format(selectedDate, "yyyy-MM-dd")}`);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Calendar</h1>
      <Card className="max-w-fit">
        <CardHeader>
          <CardTitle>Select a Day</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            className="rounded-md border"
          />
        </CardContent>
      </Card>
    </div>
  );
}
