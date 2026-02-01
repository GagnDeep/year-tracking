"use client";

import { useState, useEffect, useRef } from "react";
import { format, parse, isValid, getDaysInMonth, startOfMonth, differenceInDays } from "date-fns";
import { api } from "@/trpc/react";
import { DailyJournal } from "@/components/editor/daily-journal";
import { useDebounce } from "@/hooks/use-debounce";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLayout } from "@/context/layout-context";
import { gsap } from "gsap";
import { Timeline } from "@/components/timeline/timeline";
import { calculateDailyStats, TimeBlock } from "@/lib/scheduler";
import { toast } from "sonner";

export default function DayView({ date }: { date: string }) {
  // 1. Validate Date
  const parsedDate = parse(date, "yyyy-MM-dd", new Date());
  const formattedDate = isValid(parsedDate) ? format(parsedDate, "EEEE, MMMM do, yyyy") : "Invalid Date";

  // 2. Fetch Data
  const { data: entry, isLoading } = api.journal.getEntry.useQuery({ date }, { enabled: isValid(parsedDate) });
  const { data: blocks, refetch: refetchBlocks } = api.timeline.getBlocks.useQuery({ date }, { enabled: isValid(parsedDate) });

  const utils = api.useUtils();

  const journalMutation = api.journal.upsertEntry.useMutation({
      onSuccess: () => {
          utils.journal.getYearlyStats.invalidate();
      }
  });

  const timelineMutation = api.timeline.upsertBlock.useMutation({
      onSuccess: () => {
          refetchBlocks();
      },
      onError: (err) => {
          toast.error(err.message);
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
        setIsInitialized(true);
    }
  }, [entry, isLoading, isInitialized]);

  // 5. Auto-save Logic
  const debouncedContent = useDebounce(content, 1000);
  const debouncedScore = useDebounce(productivityScore, 1000);
  const debouncedMood = useDebounce(mood, 1000);

  useEffect(() => {
    if (!isInitialized) return;
    const isDifferent =
        content !== (entry?.content ?? "") ||
        productivityScore !== (entry?.productivityScore ?? 5) ||
        mood !== (entry?.mood ?? "neutral");

    if (isDifferent && isValid(parsedDate)) {
        journalMutation.mutate({
            date,
            content: debouncedContent,
            productivityScore: debouncedScore,
            mood: debouncedMood,
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedContent, debouncedScore, debouncedMood]);

  // 6. Animation Logic
  const { transitionRect, setTransitionRect } = useLayout();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transitionRect && containerRef.current) {
        const target = containerRef.current;
        const targetRect = target.getBoundingClientRect();

        const rectCX = transitionRect.left + transitionRect.width / 2;
        const rectCY = transitionRect.top + transitionRect.height / 2;

        const targetCX = targetRect.left + targetRect.width / 2;
        const targetCY = targetRect.top + targetRect.height / 2;

        const dx = rectCX - targetCX;
        const dy = rectCY - targetCY;

        gsap.fromTo(target,
            {
                x: dx,
                y: dy,
                scale: 0.05,
                opacity: 0,
            },
            {
                x: 0,
                y: 0,
                scale: 1,
                opacity: 1,
                duration: 0.6,
                ease: "expo.out",
                onComplete: () => {
                    setTransitionRect(null);
                }
            }
        );
    }
  }, [transitionRect, setTransitionRect]);

  if (!isValid(parsedDate)) return <div>Invalid date</div>;
  if (isLoading) return <div className="p-8">Loading...</div>;

  // Day Stats
  const monthStart = startOfMonth(parsedDate);
  const daysInMonth = getDaysInMonth(parsedDate);
  const daysPassed = differenceInDays(parsedDate, monthStart) + 1;
  const monthProgress = ((daysPassed / daysInMonth) * 100).toFixed(0);
  const monthName = format(parsedDate, "MMM");

  // Timeline Stats
  const timelineStats = calculateDailyStats((blocks || []).map(b => ({
      ...b,
      startTime: new Date(b.startTime), // Ensure Date object
      endTime: new Date(b.endTime)
  })));

  const handleBlockMove = (id: string, newStartTime: Date) => {
      const block = blocks?.find(b => b.id === id);
      if (!block) return;

      const durationMs = block.endTime.getTime() - block.startTime.getTime();
      const newEndTime = new Date(newStartTime.getTime() + durationMs);

      // Update date part to match current day (prevent dragging to another day visually)
      newStartTime.setFullYear(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
      newEndTime.setFullYear(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());

      timelineMutation.mutate({
          id,
          date,
          startTime: newStartTime.toISOString(),
          endTime: newEndTime.toISOString(),
          category: block.category,
          title: block.title,
      });
  };

  const handleBlockCreate = (startTime: Date) => {
      // Set correct date
      startTime.setFullYear(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour default

      timelineMutation.mutate({
          date,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          category: "Work", // Default
          title: "New Task",
      });
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold">{formattedDate}</h1>
          <p className="text-neutral-400 text-sm">
            {monthProgress}% of {monthName} passed
          </p>
        </div>
        <div className="text-sm text-neutral-500">
           {journalMutation.isPending ? "Saving..." : "Saved"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Editor */}
        <div className="lg:col-span-2 flex flex-col min-h-0 gap-4">
          <DailyJournal
            content={content}
            onChange={setContent}
            isSaving={journalMutation.isPending}
          />

          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
                <CardTitle className="text-sm">Day Stats</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1 text-neutral-400">
                <div className="flex justify-between">
                    <span>Scheduled:</span>
                    <span className="text-white">{timelineStats.totalScheduled.toFixed(1)}h</span>
                </div>
                <div className="flex justify-between">
                    <span>Free:</span>
                    <span className="text-white">{timelineStats.totalFree.toFixed(1)}h</span>
                </div>
                <div className="pt-2 border-t border-neutral-800 mt-2">
                    {Object.entries(timelineStats.byCategory).map(([cat, dur]) => (
                        <div key={cat} className="flex justify-between">
                            <span>{cat}:</span>
                            <span>{dur.toFixed(1)}h</span>
                        </div>
                    ))}
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-1 h-[600px] lg:h-auto overflow-y-auto border border-neutral-800 rounded-lg bg-neutral-950">
            <Timeline
                blocks={blocks || []}
                onBlockMove={handleBlockMove}
                onBlockCreate={handleBlockCreate}
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
