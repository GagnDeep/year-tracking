"use client";

import { useState } from "react";
import { format } from "date-fns";
import { api } from "@/trpc/react";
import { JournalEditor } from "@/components/journal-editor";
import { Timeline } from "@/components/timeline";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());
  const { data: user } = api.user.getProfile.useQuery();

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.name?.split(" ")[0] || "User"}
        </h1>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={`w-[240px] justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={() => setDate(new Date())}>
             Today
          </Button>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1 border rounded-lg overflow-hidden">
        <ResizablePanel defaultSize={60} minSize={30}>
          <div className="h-full p-4 overflow-y-auto">
             <h2 className="text-lg font-semibold mb-2">Daily Journal</h2>
             <JournalEditor date={date} />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={40} minSize={30}>
          <div className="h-full p-4 bg-muted/10 overflow-hidden">
            <Timeline date={date} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
