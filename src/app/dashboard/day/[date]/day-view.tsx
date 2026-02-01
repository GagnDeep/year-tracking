"use client";

import { useState, useEffect, useCallback } from "react";
import { format, parse, isValid, getDaysInMonth, startOfMonth, differenceInDays } from "date-fns";
import { notFound } from "next/navigation";
import { api } from "@/trpc/react";
import { DailyJournal } from "@/components/editor/daily-journal";
import { useDebounce } from "@/hooks/use-debounce";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DayView({ date }: { date: string }) {
  // 1. Validate Date
  const parsedDate = parse(date, "yyyy-MM-dd", new Date());
  if (!isValid(parsedDate)) return <div>Invalid date</div>;

  const formattedDate = format(parsedDate, "EEEE, MMMM do, yyyy");

  // 2. Fetch Data
  const { data: entry, isLoading, refetch } = api.journal.getEntry.useQuery({ date });
  const utils = api.useUtils();
  const upsertMutation = api.journal.upsertEntry.useMutation({
      onSuccess: () => {
          utils.journal.getYearlyStats.invalidate();
      }
  });

  // 3. Local State
  const [content, setContent] = useState("");
  const [productivityScore, setProductivityScore] = useState(0);
  const [mood, setMood] = useState("neutral");
  const [isInitialized, setIsInitialized] = useState(false);

  // 4. Initialize State from DB
  useEffect(() => {
    if (entry && !isInitialized) {
      setContent(entry.content ?? "");
      setProductivityScore(entry.productivityScore ?? 5);
      setMood(entry.mood ?? "neutral");
      setIsInitialized(true);
    } else if (!isLoading && !entry && !isInitialized) {
        // No entry yet
        setIsInitialized(true);
    }
  }, [entry, isLoading, isInitialized]);

  // 5. Auto-save Logic
  const debouncedContent = useDebounce(content, 1000);
  const debouncedScore = useDebounce(productivityScore, 1000);
  const debouncedMood = useDebounce(mood, 1000);

  useEffect(() => {
    if (!isInitialized) return;

    // Only save if dirty? Or just save everything.
    // To prevent overwrite on initial load, we rely on isInitialized.
    // Also, if nothing changed from DB, we might skip, but checking against DB is complex.
    // For now, simple auto-save on debounce.

    // Check if data is actually different from what we loaded?
    // Optimization: Skip if matches entry exactly.
    const isDifferent =
        content !== (entry?.content ?? "") ||
        productivityScore !== (entry?.productivityScore ?? 5) ||
        mood !== (entry?.mood ?? "neutral");

    if (isDifferent) {
        upsertMutation.mutate({
            date,
            content: debouncedContent,
            productivityScore: debouncedScore,
            mood: debouncedMood,
        });
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedContent, debouncedScore, debouncedMood]);
  // We use debounced values to trigger, but we could also use the raw values if we just want to save "current state" when debounce fires.
  // Actually, passing `debouncedContent` ensures we save the settled value.

  // 6. Day Stats Calculation
  const monthStart = startOfMonth(parsedDate);
  const daysInMonth = getDaysInMonth(parsedDate);
  const daysPassed = differenceInDays(parsedDate, monthStart) + 1;
  const monthProgress = ((daysPassed / daysInMonth) * 100).toFixed(0);
  const monthName = format(parsedDate, "MMM");

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold">{formattedDate}</h1>
          <p className="text-neutral-400 text-sm">
            {monthProgress}% of {monthName} passed
          </p>
        </div>
        <div className="text-sm text-neutral-500">
           {upsertMutation.isPending ? "Saving..." : "Saved"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Editor */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <DailyJournal
            content={content}
            onChange={setContent}
            isSaving={upsertMutation.isPending}
          />
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-sm font-medium uppercase tracking-wide text-neutral-400">
                Daily Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                    <Label>Productivity</Label>
                    <span className="text-sm text-neutral-400">{productivityScore}/10</span>
                </div>
                <Slider
                  value={[productivityScore]}
                  min={0}
                  max={10}
                  step={1}
                  onValueChange={(v) => setProductivityScore(v[0]!)}
                  className="py-4"
                />
              </div>

              <div className="space-y-2">
                <Label>Mood</Label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger className="bg-neutral-950 border-neutral-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="great">Great 🤩</SelectItem>
                    <SelectItem value="good">Good 🙂</SelectItem>
                    <SelectItem value="neutral">Neutral 😐</SelectItem>
                    <SelectItem value="bad">Bad 🙁</SelectItem>
                    <SelectItem value="awful">Awful 😫</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
