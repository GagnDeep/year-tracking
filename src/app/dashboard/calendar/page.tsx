"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { JournalEditor } from "@/components/journal-editor";
import { Timeline } from "@/components/timeline";

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-4 md:flex-row">
      <Card className="w-full md:w-auto h-fit">
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
          <CardDescription>
            Select a date to view your journal and schedule.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {date ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">
                {format(date, "MMMM do, yyyy")}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full overflow-hidden">
               <div className="flex flex-col h-full border rounded-md p-4 bg-background overflow-y-auto">
                  <h3 className="font-semibold mb-2">Journal</h3>
                  <JournalEditor date={date} />
               </div>
               <div className="flex flex-col h-full overflow-hidden">
                  <Timeline date={date} />
               </div>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Pick a date to view details.
          </div>
        )}
      </div>
    </div>
  );
}
