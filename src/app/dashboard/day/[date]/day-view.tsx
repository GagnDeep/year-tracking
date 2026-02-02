"use client";

import { useState, useEffect, useRef } from "react";
import { format, parse, isValid, getDaysInMonth, startOfMonth, differenceInDays, addDays, subDays } from "date-fns";
import { api } from "@/trpc/react";
import { DailyJournal } from "@/components/editor/daily-journal";
import { useDebounce } from "@/hooks/use-debounce";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLayout } from "@/context/layout-context";
import { gsap } from "gsap";
import { Timeline } from "@/components/timeline/timeline";
import { calculateDailyStats, TimeBlock } from "@/lib/scheduler";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const MOODS = [
    { value: "great", label: "🤩", text: "Great" },
    { value: "good", label: "🙂", text: "Good" },
    { value: "neutral", label: "😐", text: "Neutral" },
    { value: "bad", label: "🙁", text: "Bad" },
    { value: "awful", label: "😫", text: "Awful" },
];

export default function DayView({ date }: { date: string }) {
  // 1. Validate Date
  const parsedDate = parse(date, "yyyy-MM-dd", new Date());
  const formattedDate = isValid(parsedDate) ? format(parsedDate, "EEEE, MMMM do, yyyy") : "Invalid Date";

  const prevDate = isValid(parsedDate) ? format(subDays(parsedDate, 1), "yyyy-MM-dd") : "#";
  const nextDate = isValid(parsedDate) ? format(addDays(parsedDate, 1), "yyyy-MM-dd") : "#";

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
    <div ref={containerRef} className="flex flex-col gap-6 h-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-border pb-4">
        <Breadcrumbs />
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href={`/dashboard/day/${prevDate}`}>
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{formattedDate}</h1>
                    <p className="text-muted-foreground text-sm">
                        {monthProgress}% of {monthName} passed
                    </p>
                </div>
                <Button variant="outline" size="icon" asChild>
                    <Link href={`/dashboard/day/${nextDate}`}>
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </Button>
            </div>
            <div className="text-sm text-muted-foreground/50 font-mono">
               {journalMutation.isPending ? "Saving changes..." : "All changes saved"}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Editor & Stats - Main Area (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <DailyJournal
            content={content}
            onChange={setContent}
            isSaving={journalMutation.isPending}
          />

           {/* Sidebar Info moved here for mobile/better layout */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                        Daily Metrics
                    </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <Label>Productivity</Label>
                            <span className="text-sm font-mono text-muted-foreground">{productivityScore}/10</span>
                        </div>
                        <Slider
                        value={[productivityScore]}
                        min={0}
                        max={10}
                        step={1}
                        onValueChange={(v) => setProductivityScore(v[0]!)}
                        className="py-2"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Mood</Label>
                        <RadioGroup value={mood} onValueChange={setMood} className="flex justify-between">
                            {MOODS.map((m) => (
                                <div key={m.value} className="flex flex-col items-center gap-1 cursor-pointer">
                                    <RadioGroupItem value={m.value} id={`mood-${m.value}`} className="sr-only" />
                                    <Label
                                        htmlFor={`mood-${m.value}`}
                                        className={cn(
                                            "flex flex-col items-center justify-center w-10 h-10 rounded-full border border-border cursor-pointer transition-all hover:bg-muted",
                                            mood === m.value && "bg-primary text-primary-foreground border-primary scale-110"
                                        )}
                                    >
                                        <span className="text-lg">{m.label}</span>
                                    </Label>
                                    <span className="text-[10px] text-muted-foreground">{m.text}</span>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Time Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2 text-muted-foreground">
                        <div className="flex justify-between">
                            <span>Scheduled:</span>
                            <span className="text-foreground">{timelineStats.totalScheduled.toFixed(1)}h</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Free:</span>
                            <span className="text-foreground">{timelineStats.totalFree.toFixed(1)}h</span>
                        </div>
                        <div className="pt-2 border-t border-border mt-2 space-y-1">
                            {Object.entries(timelineStats.byCategory).map(([cat, dur]) => (
                                <div key={cat} className="flex justify-between text-xs">
                                    <span>{cat}:</span>
                                    <span>{dur.toFixed(1)}h</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
           </div>
        </div>

        {/* Timeline (5 cols) */}
        <div className="lg:col-span-5 h-[600px] lg:h-auto overflow-y-auto border border-border rounded-xl bg-card/50 flex flex-col">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20 sticky top-0 z-10 backdrop-blur-sm">
                 <h3 className="font-semibold text-sm">Timeline</h3>
                 <Button size="sm" variant="secondary" onClick={() => handleBlockCreate(new Date())} className="h-7 text-xs">
                     <Plus className="h-3 w-3 mr-1" />
                     Add Block
                 </Button>
            </div>
            <Timeline
                blocks={blocks || []}
                onBlockMove={handleBlockMove}
                onBlockCreate={handleBlockCreate}
            />
        </div>
      </div>
    </div>
  );
}
